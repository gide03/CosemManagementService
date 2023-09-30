import os
import json
import sqlite3
import pathlib
import pymongo
from time import time
from .NodeDataParser import extract_all_value, flatten

CURRENT_PATH = pathlib.Path(__file__).parent.parent.absolute()
APPDATA_PATH = f'{CURRENT_PATH}/appdata'
EXPORT_DB_PATH = f'{APPDATA_PATH}/exportdb'
if not os.path.exists(APPDATA_PATH):
    os.mkdir(APPDATA_PATH)

if not os.path.exists(EXPORT_DB_PATH):
    os.mkdir(EXPORT_DB_PATH)
    
try:
    os.remove('/home/itron/Gidion/git/EMX_CMS/backend/appdata/exportdb/MeterBuilder.db')
except:
    pass

class DBExportAgent:
    def __init__(self, project_target, version_target) -> None:
        self.project_target = "PROJECT_" + project_target
        self.version_target = version_target
        self.mongo_client = pymongo.MongoClient('mongodb://localhost:27017/')
        
        # check database list
        self.db_list = []
        for _db in self.mongo_client.list_database_names():
            if "PROJECT" in _db or "temporary" in _db:
                self.db_list.append(_db)
        if self.project_target not in self.db_list:
            raise Exception('Project not found')
        # check version list
        self.version_list = self.mongo_client[self.project_target].list_collection_names()
        if self.version_target not in self.version_list:
            raise Exception('Version not found')
        
        # Process the request
        self.time_hash = '%.02f'%hash(time())
        self.db_filename = f'{EXPORT_DB_PATH}/MeterBuilder_{self.time_hash}.db'
        self.project_db = self.mongo_client[self.project_target]
        self.data_collection = self.project_db[self.version_target]
        self.cosem_list = [_data for _data in self.data_collection.find()]
        self.association_clients = [_client for _client in self.cosem_list[0]['accessRight']] # get dlms clients by the first sample
        self.counter_collection = self.project_db['counter']
        self.conn = sqlite3.connect(self.db_filename)
    
    ####
    def get_reference(self, object_name, class_id, version):
        counter_document = self.counter_collection.find_one({"counter":{"$exists":"counter"}})
        counter = counter_document['counter']
        
        # use previous reference name
        result = self.counter_collection.find_one({'objectName':object_name})
        if result:
            return result['reference']
            
        # create new
        reference_name = f'e_ic{class_id}v{version}'
        if reference_name not in counter:
            counter[reference_name] = 0
        counter[reference_name] += 1
        reference_name += f'_{counter[reference_name]}'
        
        # insert to collection
        self.counter_collection.insert_one({"objectName":object_name, "reference":reference_name})
        
        # update counter
        counter_id = counter_document['_id']
        self.counter_collection.update_one({"_id":counter_id}, {"$set":{"counter":counter}})
        return reference_name
    
    def get_enum_section(self, modifier_data):
        section_collection = self.project_db['enumsection']
        
        section_enum = {
            "LR":0,
            "NLR": 1,
            "PQDSP":2,
            "LNR2":2
        }
        output = []
        for element in modifier_data:
            if type(element) == dict:
                key = list(element.keys())[0]
                output.append({key:self.get_enum_section(element[key])})
                continue
            elif type(element) == list:
                if len(element) == 0:
                    output.append()
                
            result = section_collection.find_one({"object_name":element})
            section = "NLR" if not result else result['section']
            
            output.append(section_enum[section])        
        return output
    
    def normalize(self, value_list):
        '''
            Remove dict
        '''
        output = []
        for element in value_list:
            if type(element) == dict:
                key = list(element.keys())[0]
                output.append(self.normalize(element[key]))
                continue
            output.append(element)
        return output
    ####
    
    def create_cosem_db(self):
        cursor = self.conn.cursor()
        
        # Create database tables: ASSOCIATION, BUILDERDBVERSION, COSEM, ENUM_DICT
        
        # ASSOCIATIONS TABLE
        self.association_clients
        assoc_client_queries = ''
        for idx, _client in enumerate(self.association_clients):
            assoc_client_queries += f"{_client} TEXT{',' if idx<len(self.association_clients)-1 else ''} "
        cursor.execute(f'\
            CREATE TABLE IF NOT EXISTS ASSOCIATIONS \
                (id INTEGER PRIMARY KEY, \
                    logical_name TEXT, \
                    class_id TEXT, \
                    version TEXT, \
                    {assoc_client_queries}\
                )'
        )

        # BUILDERDBVERSION
        cursor.execute(f'CREATE TABLE IF NOT EXISTS BUILDERDBVERSION (id INTEGER PRIMARY KEY, version TEXT, signature TEXT)')
        
        # COSEM
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS COSEM (
                id INTEGER PRIMARY KEY,
                object_name TEXT,
                logical_name TEXT,
                class_id TEXT,
                version TEXT,
                reference TEXT,
                structure TEXT,
                modifier TEXT,
                section TEXT,
                default_value TEXT,
                min_value TEXT,
                max_value TEXT
            )
        ''')
    
        # ENUM_DICTIONARY
        cursor.execute(f'CREATE TABLE IF NOT EXISTS ENUM_DICT (id INTEGER PRIMARY KEY, enum_name TEXT, linked_object TEXT)')
        
        # CAPTURE OBJECT
        cursor.execute(f'CREATE TABLE IF NOT EXISTS CAPTURE_OBJECT (id INTEGER PRIMARY KEY, object_name TEXT, att_id TEXT, captured_by TEXT)')
        cursor.close()
    
    def write_association(self):        
        def convert_to_enum(access_level_data):
            al_enumerator = {
                "NA":0,
                "Set":1,
                "Get":2,
                "GetSet":3,
                "Act":4
            }
            
            for idx,al_element in enumerate(access_level_data):
                if type(al_element) == list:
                    convert_to_enum(al_element)
                    continue
                access_level_data[idx] = al_enumerator[al_element]
        
        cursor = self.conn.cursor()
        
        assoc_client_queries = ''
        for idx, _client in enumerate(self.association_clients):
            assoc_client_queries += f"{_client}{',' if idx<len(self.association_clients)-1 else ''} "
            
        for _data in self.cosem_list:
            logical_name = json.dumps([int(i) for i in _data['logicalName'].split(';')])
            class_id = _data['classId']
            access_level = [_data['accessRight'][_client] for _client in self.association_clients]
            access_level = [[al['attribute'], al['method']] for al in access_level]
            selected_version = _data['selectedVersion'].split('-')[-1]
            
            query_value = [logical_name, class_id, selected_version]
            convert_to_enum(access_level)
            access_level = [json.dumps(al) for al in access_level]
            query_value.extend(access_level)
            
            cursor.execute(f"INSERT INTO ASSOCIATIONS (logical_name, class_id, version, {assoc_client_queries}) VALUES ({('?,'*(len(query_value)))[:-1]})", query_value)
        cursor.close()
        self.conn.commit()
        
    def write_cosem(self):        
        enum_list = {}
        cursor = self.conn.cursor()
        for _data in self.cosem_list:        
            value = extract_all_value(_data)
            object_name = value['object_name']
            logical_name = value['logical_name']
            class_id = value['class_id']
            version = value['version']
            modifier = value['modifier']
            structure = value['Structure']
            min_value = value['min_value']
            max_value = value['max_value']
            default_value = value['default_value']
            reference = self.get_reference(object_name, class_id, version)
            section = [self.get_enum_section(modifier[0]), self.get_enum_section(modifier[1])]
            column_names = (
                "object_name",
                "logical_name",
                "class_id",
                "version",
                "reference",
                "structure",
                "modifier",
                "section",
                "default_value",
                "min_value",
                "max_value",
            )
            
            # remove "Structure" and "Array-<min>-<max>"
            section = [self.normalize(section[0]), self.normalize(section[1])]
            modifier = [self.normalize(modifier[0]), self.normalize(modifier[1])]
            default_value = [self.normalize(default_value[0]), self.normalize(default_value[1])]
            
            # customize modifier and section. if entire attribute tree is null, then just say it null, and the section is NLR
            for i in range(0,2):
                for idx, mdf in enumerate(modifier[i]):                    
                    if type(mdf) == list:
                        _temp = list(set(flatten(mdf, True)))
                        if (len(_temp) == 1 and _temp[0] == None) or len(mdf) == 0:
                            modifier[i][idx] = None
                            section[i][idx] = 1 # 1 is enumeration for NLR
                        else:
                            _temp = _data
                            
            column = ', '.join(column_names)
            column_values = (
                str(object_name),
                str(logical_name),
                str(class_id),
                str(version),
                str(reference),
                json.dumps(structure),
                json.dumps(modifier),
                json.dumps(section),
                json.dumps(default_value),
                json.dumps(min_value),
                json.dumps(max_value),
            )
            cursor.execute(f'INSERT INTO COSEM ({column}) VALUES ({", ".join(["?" for i in column_values])})', column_values)
            
            # Enum Dictionary   
            def register_enum(enum_name):
                if enum_name not in enum_list:
                    enum_list[enum_name] = []
                enum_list[enum_name].append(object_name)
                
            for i in range(0,2):
                for idx, mdf in enumerate(modifier[i]):
                    if type(mdf) == list:
                        _temp = list(set(flatten(mdf,True)))
                        for _temp_element in _temp:
                            if _temp_element != None:
                                register_enum(_temp_element)
                    else:
                        if mdf != None:
                            register_enum(mdf)
            
        for enum in enum_list:
            cursor.execute(f'INSERT INTO ENUM_DICT (enum_name, linked_object) VALUES (?,?)', (enum, json.dumps(list(set(enum_list[enum])))))
                        
        cursor.close()
        self.conn.commit()
    
    def write_signature(self):
        version = self.version_target.replace('_','.').split('.')
        version = '.'.join(version[:2])
        
        cursor = self.conn.cursor()
        cursor.execute(f'INSERT INTO BUILDERDBVERSION (version, signature) VALUES (?,?)', (version, self.time_hash))
        cursor.close()
        self.conn.commit()

    def write_capture_object(self):
        capture_object_dict = {}
        for _data in self.cosem_list:        
            if len(_data['captureObject']) == 0:
                continue
            capture_object = _data['captureObject']
            # print(capture_object)
            for c_obj in capture_object:
                name = f'{c_obj[0]}_{c_obj[3]}'
                if name not in capture_object_dict:
                    capture_object_dict[name] = []
                capture_object_dict[name].append(_data['objectName'])

        cursor = self.conn.cursor()
        for c_obj in capture_object_dict:
            _key = c_obj.split('_')
            _val = capture_object_dict[c_obj]
            cursor.execute(f'INSERT INTO CAPTURE_OBJECT (object_name, att_id, captured_by) VALUES (?,?,?)', (_key[0], _key[1], json.dumps(_val)))
            
        cursor.close()
        self.conn.commit()
        
    ####
    def render(self) -> str:
        '''
            Render the database meter builder.
            Return database path
        '''
        self.create_cosem_db()
        self.write_association()
        self.write_cosem()
        self.write_signature()
        self.write_capture_object()
        self.conn.close()
        return self.db_filename