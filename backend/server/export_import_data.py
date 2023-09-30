import json
from flask import jsonify, request, blueprints, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from lib.ErrorMessage import ErrorMessage
from lib.XML_Import import WorkFile_Manager
from lib.ExportDatabase import DBExportAgent
import pymongo

Export_Import_Data = blueprints.Blueprint('Import Data', __name__)

@Export_Import_Data.route('/')
def index():
    return "Import your data here"

@Export_Import_Data.route('/upload', methods=['POST'])
@jwt_required()
def import_data():
    identity = get_jwt_identity()
    
    username = identity[0]
    # email = identity[1]
    # password = identity[2]

    # fetch the file
    try:
        if 'filecustomer' not in request.files or 'filemanuf' not in request.files:
            return 'no file part'
        file_customer = request.files['filecustomer']
        file_manuf = request.files['filemanuf']
        is_merge = True if request.form['ismerge'] == 'true' else False
        project_to_merge = None
        if is_merge:
            project_to_merge = 'PROJECT_' + request.form['reference']
    except:
        resp = ErrorMessage(
            400, 
            "Bad Request", 
            [{"message" : "Invalid form"}], 
            [{"data" : f"Form needed: filecustomer(file), filemanuf(file), ismerge(str):true or false, reference(str)"}]
        )
        return jsonify(resp), 400
        
        
    # render workfiles
    # [1] Render customer file; NOTE: We can extract the association clients from it, and set the association overide
    # [2] Render manuf file
    # [3] Iterate manuf file, for every object that is not exist on customer object, append the workfile to the object list
    # [4] if the is_merge true, merge object's modifier from the latest version.
    customer_wf_manager = WorkFile_Manager(file_customer)
    manuf_wf_manager = WorkFile_Manager(file_manuf)
    cosem_list = customer_wf_manager.getObjectList()
    clients = [client for client in cosem_list[0]['accessRight']] # get client list and pass to manuf workfile manager
    manuf_wf_manager.override_access_level = clients # configure access right client to be configure
    
    work_file_list = [wf['objectName'] for wf in cosem_list] 
    for manuf_object in manuf_wf_manager.getObjectList(): # Append manufacture object
        if manuf_object['objectName'] not in work_file_list:
            cosem_list.append(manuf_object)
       
    def flatten(node):
        output = []
        if node == None:
            return None
        output.append(node['_dtype'])
        for child in node['children']:
            output.extend(flatten(child))
        return output
    
    client = pymongo.MongoClient('mongodb://10.23.40.185:27017/')
    reference_database = client[project_to_merge]
    #
    # MERGE COSEM
    #
    if is_merge:
        version = [] 
        selected_version = None
        for ver in reference_database.list_collection_names():
            if ver not in ('counter', 'enumsection', 'changelogs'):
                version.append(ver)
           
        if len(version) > 0: # selected latest version to be merged
            version.sort()
            selected_version = version[-1] 
            object_collection = reference_database[selected_version]
            for idx, _obj in enumerate(cosem_list):
                object_name = cosem_list[idx]['objectName']
                result = object_collection.find_one({'objectName':object_name})
                if not result:
                    continue
                # merge:
                # [1] check if the data structure of attribute and method is the same (we can use flatten function from ExportDatabase)
                def merge_node(ref:dict, src:dict): 
                    '''
                        merge reference data to source data
                        ref and src is actually Node instance in JSON format
                    '''
                    src['modifier'] = ref['modifier']
                    src['defaultValue'] = ref['defaultValue']
                    src['minValue'] = ref['minValue']
                    src['maxValue'] = ref['maxValue']
                    if len(ref['children']) > 0:
                        for ref_child, src_child in zip (ref['children'], src['children']):
                            merge_node(ref_child, src_child) # recursive
                            
                    return src
                
                # iterate each node in attribute and method
                # NOTE: Every object has key: attribute(list of Node) and method (list of Node) :: Refer to class/WorkItem.py and class/Node.py
                #       Inside for loop below, Instance of WorkItem already converted to dictionary
                for _key in ('attribute', 'method'): 
                    ref_data_structure = [flatten(node) for node in result[_key]]
                    obj_data_structure = [flatten(node) for node in cosem_list[idx][_key]]
                    
                    # make sure the list length have is the same
                    if len(ref_data_structure) != len(obj_data_structure):
                        continue
                        
                    # iterate and merge the modifier (if the data structure is the same)
                    for att_idx, (ref_data, src_data) in enumerate(zip(ref_data_structure, obj_data_structure)):
                        if ref_data == None:
                            continue
                        if ref_data == src_data: # TODO: MERGEE!
                            merge_node(result[_key][att_idx], cosem_list[idx][_key][att_idx])      
                    try:
                        del obj_data_structure
                        del ref_data_structure
                    except:
                        pass
    # store on database
    db = client[f'temporary']
    try:
        db.drop_collection(f'{username}')
        collection = db[f'{username}']
        collection.insert_many(cosem_list)
        del customer_wf_manager
        del manuf_wf_manager
        del cosem_list    
    except:
        pass
    return 'OK'

@Export_Import_Data.route('/importenumsection', methods=['POST'])
# @jwt_required()
def import_enum():
    '''
        Import enumeration libraries file with JSON file
        Warning: The enumeration will be overrided
        requred keys:
            "files" : must be json file
            "projectname" : (str)
    '''
    # identity = get_jwt_identity()    
    # username = identity[0]
    
    # fetch the file
    if 'file' not in request.files:
        resp = ErrorMessage(
            400, 
            "Bad Request", 
            [{"message" : "Key invalid"}], 
            [{"data" : f"Keys required: {['file (BLOB): .json format file', 'projectname (str): the project name ']}"}]
        )
        return jsonify(resp), 400
    if 'projectname' not in request.form:
        resp = ErrorMessage(
            400, 
            "Bad Request", 
            [{"message" : "Key invalid"}], 
            [{"data" : f"Keys required: {['file (BLOB): .json format file', 'projectname (str): the project name ']}"}]
        )
        return jsonify(resp), 400
        # return 'no "projectname" on form'
    
    file = request.files['file']
    project_name = 'PROJECT_' + request.form['projectname']
    
    # render the enumerators
    try:
        enum_data = json.load(file)
    except:
        resp = ErrorMessage(
            400, 
            "Bad Request", 
            [{"message" : "File shall be in JSON format"}], 
            [{"data" : f"Keys required: {['file (BLOB): .json format file', 'projectname (str): the project name ']}"}]
        )
        return jsonify(resp), 400
    
    try:
        LR_data = enum_data['LR']
        NLR_data = enum_data['NLR']
        NLR2_data = enum_data['PQDSP']
    except:
        resp = ErrorMessage(
            400, 
            "Bad Request", 
            [{"message" : "Invalid JSON format"}], 
            [{"data" : "Required LR, NLR, NLR2. Each of keys contains enumeration list"}]
        )
        return jsonify(resp), 400
    
    client = pymongo.MongoClient('mongodb://localhost:27017/')
    database = client[project_name]
    database.drop_collection('enumsection') # drop the collection from prev version 
    section_collection = database['enumsection']
    
    for data in LR_data:
        result = section_collection.find_one({'object_name':data})
        if not result:
            section_collection.insert_one({"object_name":data,"section":"LR"})
    
    for data in NLR2_data:
        result = section_collection.find_one({'object_name':data})
        if not result:
            section_collection.insert_one({"object_name":data,"section":"PQDSP"})
        
    for data in NLR_data:
        result = section_collection.find_one({'object_name':data})
        if not result:
            section_collection.insert_one({"object_name":data,"section":"NLR"})
            
    return 'OK'

@Export_Import_Data.route('/download/<project_target>/<version_target>')
def download(project_target, version_target):
    db_agent = DBExportAgent(project_target, version_target)
    output_path = db_agent.render()
    
    db_to_be_sent = open(output_path, 'rb')
    try:
        from os import remove
        remove(output_path)
    except:
        pass
    return send_file(db_to_be_sent, 'application/octet-stream', download_name=f'MeterBuilderDB_{version_target}.db')