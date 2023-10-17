import json
import pymongo
from flask import jsonify, request, blueprints
from flask_jwt_extended import jwt_required, get_jwt_identity
from lib.ErrorMessage import ErrorMessage
from datetime import datetime

with open('constant/config.json', 'r') as f:
    SERVER_CONFIG = json.load(f)
    MONGO_SETTING = SERVER_CONFIG['mongodb']
    MONGO_ADDRESS = f'mongodb://{MONGO_SETTING["address"]}:{MONGO_SETTING["port"]}/'

# app = Flask(__name__)
COSEM_Crud_Server = blueprints.Blueprint("COSEM Crud Server", __name__)

class ChangeLog:
    def __init__(self, by, email, message, version_reference=None):
        self.commit_date = datetime.now().strftime('%Y/%m/%d %H:%M:%S')
        self.by = by
        self.email = email
        self.message = message
        self.version_reference = version_reference
        
    def get(self):
        ret_val = {
            'commit_date': self.commit_date,
            'by': self.by,
            'email': self.email,
            'message': self.message
        }
        
        if self.version_reference != None:
            ret_val['version_reference'] = self.version_reference
        return ret_val

def list_version(projectname):
    client = pymongo.MongoClient(MONGO_ADDRESS)
    db = client[projectname]
    collection = db['changelogs']
    result = collection.find({"version_list": {"$exists":True}})
    try:
        return [val for val in result][0], client # [0] because the data shall be just record once
    except:
        return None, client

def list_project():
    client = pymongo.MongoClient(MONGO_ADDRESS)
    temp_database_list = client.list_database_names()
    database_list = []
    for _db in temp_database_list:
        if "PROJECT" in _db:
            database_list.append(_db.replace('PROJECT_',''))
    return database_list, client

@COSEM_Crud_Server.route('/listproject', methods=['GET'])
def get_project_list():
    projects, _ = list_project()
    return jsonify(projects), 200

@COSEM_Crud_Server.route('/createproject', methods=['POST'])
@jwt_required()
def create_project():
    '''
        In project database, collection will be registered in default are: changelogs, counter, and enumsection.
            Need to be noted that collection enumsection will be create after user access api ../data/uploadsection
            where on that API, user need to send JSON file contain the list of object inside LR and PQDS(NLR2)
    '''
    
    identifier = get_jwt_identity()
    data = request.get_json()
    projects, _ = list_project()
    print(f'identifier: {identifier}')
    print(f'data: {data}')
    print(f'projects: {projects}')
    
    # check is the project already exist
    try:
        projectname = "PROJECT_" + data['projectname']
        description = data['description']
    except:
        resp = ErrorMessage(
            400, 
            "Bad Request", 
            [{"message" : "Key invalid"}], 
            [{"data" : f"Keys required: {['projectname', 'description']}"}]
        )
        return jsonify(resp), 400
    
    if projectname in projects:
        resp = ErrorMessage(
            400,
            "Bad Request",
            [{"message": "Project already exist"}],
            [{"data": projects}]
        )
        return jsonify(resp), 400
    
    # create new database
    client = pymongo.MongoClient(MONGO_ADDRESS)
    db = client[projectname]
    collection = db['changelogs']
    commit_message = f"Create new project: {projectname}. {description}"
    
    change_log_item = ChangeLog(identifier[0], identifier[1], commit_message)
    collection.insert_one(change_log_item.get())
    collection.insert_one({"version_list":[], "is_publish":[]})
    
    collection = db['counter']
    counter_item = {"counter":{}}
    collection.insert_one(counter_item)
    
    return 'OK'

@COSEM_Crud_Server.route('/listversion/<projectname>', methods=['GET'])
def get_version_list(projectname):
    prj_name = 'PROJECT_'+projectname
    version_list, _ = list_version(prj_name)
    return jsonify(version_list['version_list'])

@COSEM_Crud_Server.route('/temporary/listversion', methods=['GET'])
@jwt_required()
def get_temporary_collection():
    identifier = get_jwt_identity()
    client = pymongo.MongoClient(MONGO_ADDRESS)
    db = client['temporary']
    username = identifier[0]
    collection_list = []
    for collection in db.list_collection_names():
        if collection == username:
            collection_list.append(collection)
    return collection_list

@COSEM_Crud_Server.route('/addversion', methods=['POST'])
@jwt_required()
def create_project_collection():
    '''
        Create version inside project
        
        keys:
            "projectname"
            "version"
    '''
    identifier = get_jwt_identity()
    data = request.get_json()
    print(f'identifier: {identifier}')
    print(f'data: {data}')
    
    try:
        projectname = 'PROJECT_'+data['projectname']
        version = data['version']
    except:
        resp = ErrorMessage(
            400, 
            "Bad Request", 
            [{"message" : "Key invalid"}], 
            [{"data" : f"Keys required: {['projectname', 'version']}"}]
        )
        return jsonify(resp), 400
    
    # check if the project is exist
    projects, _ = list_project()
    print(f'projects: {projects}')
    if projectname not in projects:
        resp = ErrorMessage(
            400, 
            "Bad Request", 
            [{"message" : "Projects does not exist"}], 
            [{"data" : projects}]
        )
        return jsonify(resp), 400
    
    # check if the version is exist
    version_list, cursor = list_version(projectname)
    if version in version_list['version_list']:
        resp = ErrorMessage(
            400, 
            "Bad Request", 
            [{"message" : "Version already exist"}], 
            [{"data" : version_list}]
        )
        return jsonify(resp), 400
    
    # create version
    _version_data = version_list['version_list']
    _is_publish_data = version_list['is_publish']
    _version_data.append(version)
    _is_publish_data.append(False)
    data_update = {
        "version_list":_version_data,
        "is_publish":_is_publish_data
    }
    db = cursor[projectname]
    collection = db['changelogs']
    collection.update_one({"_id":version_list['_id']}, {"$set": data_update})
    return 'OK'


### IMPORT DATA
@COSEM_Crud_Server.route('/import', methods=['POST'])
@jwt_required()
def import_data():
    '''
        Will generate new collection if the collection is not exist. Will reject if version is exist.
    '''
    data = request.get_json()
    try:
        projectname = 'PROJECT_'+data['projectname']
        version = data['version']
    except:
        resp = ErrorMessage(
            400, 
            "Bad Request", 
            [{"message" : "Key invalid"}], 
            [{"data" : f"Keys required: {['projectname', 'version']}"}]
        )
        return jsonify(resp), 400
    
    if len(version) == 0:
        resp = ErrorMessage(
            400, 
            "Bad Request", 
            [{"message" : "Version shall be not empty"}], 
            [{"data" : f"Version shall be not empty"}]            
        )
        return resp, 400
    
    #  Reject if version is already exist
    version_list, _ = list_version(projectname)
    if version in version_list['version_list']:
        resp = ErrorMessage(
            400, 
            "Bad Request", 
            [{"message" : "Version already exist"}], 
            [{"data" : version_list['version_list']}]
        )
        return jsonify(resp), 400
    
    # # create new collection
    client = pymongo.MongoClient(MONGO_ADDRESS)
    identifier = get_jwt_identity()
    username = identifier[0]
    email = identifier[1]
    source_db = client['temporary']
    source_collection = source_db[username]
    
    dest_db = client[projectname]
    dest_collection = dest_db[version]
    log_collection = dest_db['changelogs']
    
    # create version
    _version_data = version_list['version_list']
    _is_publish_data = version_list['is_publish']
    _version_data.append(version)
    _is_publish_data.append(False)
    data_update = {
        "version_list":_version_data,
        "is_publish":_is_publish_data
    }
    db = client[projectname]
    collection = db['changelogs']
    collection.update_one({"_id":version_list['_id']}, {"$set": data_update})
    
    result = source_collection.find()
    # copy contents
    for idx,doc in enumerate(result):
        dest_collection.insert_one(doc)
    # log the activity
    
    print(version)
    log_item = ChangeLog(
        by=username,
        email=email,
        message=f"import database from my temporary database",
        version_reference=f"{version}"
    )
    log_collection.insert_one(log_item.get())
    
    # delete user temporary database
    source_db.drop_collection(username)
    return 'OK'

# GET COSEM
@COSEM_Crud_Server.route('/getcosemlist/<projectname>/<version>')
def get_cosem_list(projectname, version):
    projectname = "PROJECT_"+projectname
    client = pymongo.MongoClient(MONGO_ADDRESS)
    db = client[projectname]
    collection = db[version]
    cursor = collection.find()
    resp = [pointer['objectName'] for pointer in cursor]
    return jsonify(resp)

@COSEM_Crud_Server.route('/get/<projectname>/<version>/<objectname>')
def get_cosem(projectname, version, objectname):
    projectname = "PROJECT_"+projectname
    client = pymongo.MongoClient(MONGO_ADDRESS)
    db = client[projectname]
    collection = db[version]
    cursor = collection.find({"objectName":objectname})
    try:
        resp = [pointer for pointer in cursor][0]
        del resp['_id']
        return jsonify(resp)
    except:
        return jsonify([])
    
@COSEM_Crud_Server.route('/update', methods=['POST'])
def update_cosem():
    try:
        data = request.get_json()
        projectname = 'PROJECT_'+data['projectname']
        version = data['version']
        workfile = data['workfile'] # the work item
        objectname = workfile['objectName']
    except:
        resp = ErrorMessage(
            400, 
            "Bad Request", 
            [{"message" : "Key invalid"}], 
            [{"data" : f"Keys required: {['projectname', 'version', 'workfile']}"}]
        )
        return jsonify(resp), 400
    
    client = pymongo.MongoClient(MONGO_ADDRESS)
    db = client[projectname]
    collection = db[version]
    find_result = collection.find({"objectName": objectname})
    try:
        find_result = [val for val in find_result][0]
        id = find_result['_id']
    except:
        resp = ErrorMessage(
            400, 
            "Bad Request", 
            [{"message" : "Data not found"}], 
            [{"data" : find_result}]
        )
        return jsonify(resp)
    
    collection.update_one({"_id":id}, {"$set": workfile})
    return 'OK'


# For Temporary Database
@COSEM_Crud_Server.route('/temporary/getcosemlist/<user>')
@jwt_required()
def get_temporary_cosem_list(user):
    identitiy = get_jwt_identity()
    # projectname = projectname
    client = pymongo.MongoClient(MONGO_ADDRESS)
    db = client['temporary']
    collection = db[user]
    cursor = collection.find()
    resp = [pointer['objectName'] for pointer in cursor]
    return jsonify(resp)

@COSEM_Crud_Server.route('/temporary/get/<version>/<objectname>')
@jwt_required()
def get_temporary_cosem( version, objectname):
    identity = get_jwt_identity()
    client = pymongo.MongoClient(MONGO_ADDRESS)
    db = client['temporary']
    collection = db[version]
    cursor = collection.find({"objectName":objectname})
    try:
        resp = [pointer for pointer in cursor][0]
        del resp['_id']
        return jsonify(resp)
    except:
        return jsonify([])
    
@COSEM_Crud_Server.route('/temporary/update', methods=['POST'])
@jwt_required()
def update_temporary_cosem():
    identity = get_jwt_identity()
    
    try:
        data = request.get_json()
        projectname = 'temporary'
        version = data['version']
        workfile = data['workfile'] # the work item
        objectname = workfile['objectName']
    except:
        resp = ErrorMessage(
            400, 
            "Bad Request", 
            [{"message" : "Key invalid"}], 
            [{"data" : f"Keys required: {['projectname', 'version', 'workfile']}"}]
        )
        return jsonify(resp), 400
    
    client = pymongo.MongoClient(MONGO_ADDRESS)
    db = client[projectname]
    collection = db[version]
    find_result = collection.find({"objectName": objectname})
    try:
        find_result = [val for val in find_result][0]
        id = find_result['_id']
    except:
        resp = ErrorMessage(
            400, 
            "Bad Request", 
            [{"message" : "Data not found"}], 
            [{"data" : find_result}]
        )
        return jsonify(resp)
    
    collection.update_one({"_id":id}, {"$set": workfile})
    return 'OK'

@COSEM_Crud_Server.route('/removecollection', methods=['POST'])
@jwt_required()
def delete_collection():
    identity = get_jwt_identity()
    
    try:
        data = request.get_json()
        projectname = data['projectname']
        version = data['version']
    except:
        resp = ErrorMessage(
            400, 
            "Bad Request", 
            [{"message" : "Key invalid"}], 
            [{"data" : f"Keys required: {['projectname', 'version', 'workfile']}"}]
        )
        return jsonify(resp), 400

    client = pymongo.MongoClient(MONGO_ADDRESS)
    
    # Check is the project name is inside database list
    if projectname in list_project():
        resp = ErrorMessage(
            400, 
            "Bad Request", 
            [{"message" : "Project name not in database"}], 
            [{"data" : f'projectname: {projectname}, version: {version}'}]
        )
        return jsonify(resp), 400
    
    # Check is the firmware version is inside selected database
    if version in list_version(projectname):
        resp = ErrorMessage(
            400, 
            "Bad Request", 
            [{"message" : f"Collection {version} not found inside database {projectname}"}], 
            [{"data" : f'projectname: {projectname}, version: {version}'}]
        )
        return jsonify(resp), 400

    # Execute!!
    db = client['PROJECT_'+projectname]
    
    # Update version list
    changelogs_collection = db['changelogs']
    changelogs_document = changelogs_collection.find({"version_list": {"$exists":True}})
    changelogs_document = [i for i in changelogs_document][0]
    doc_id = changelogs_document['_id']
    _version_list = changelogs_document['version_list']
    _is_publish = changelogs_document['is_publish']
    _index = _version_list.index(version)
    _version_list.pop(_index)
    _is_publish.pop(_index)
    data_update = {
        "version_list":_version_list,
        "is_publish":_is_publish
    }
    changelogs_collection.update_one({"_id":doc_id}, {"$set": data_update})

    # drop the collection
    db.drop_collection(version)
    client.close()
        
    return 'OK'