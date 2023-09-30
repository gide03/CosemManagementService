# from pymongo import MongoClient
# from lib.ExportDatabase import DBExportAgent


# mongo_client = MongoClient('mongodb://localhost:27017/')
# db = mongo_client['PROJECT_RUBY']
# collection = db['0.04.20230908']

# # db = mongo_client['PROJECT_Dev']
# # collection = db['0.1']

# def fix_nodes(nodes):
#     for node in nodes:
#         if node['_dtype'] == 'VisibleStringDTO':
#             # print(node['defaultValue'])
#             node['defaultValue'] = (''.join([chr(int(i)) for i in node['defaultValue'].split(',')]))
#             # print(node['defaultValue'])
            
#         # print(node['id'], node['_dtype'], node['defaultValue'])
#         if len(node['children']) > 0:
#                 walk_nodes(node['children'])


# def walk_nodes(nodes):
#     for node in nodes:
#         print(node['id'], node['_dtype'], node['defaultValue'])
#         if len(node['children']) > 0:
#                 walk_nodes(node['children'])

# for obj in collection.find():
#     print(obj['objectName'], obj['_id']) 
#     obj_id = obj['_id']
#     # fix_nodes(obj['attribute'])
#     # fix_nodes(obj['method'])
    
#     # walk_nodes(obj['attribute'])
#     data_update = {
#         # "attribute":obj['attribute'],
#         # "method":obj['method'],
#         "captureObject":[]
#     }
#     result = collection.update_one({'_id':obj_id}, {"$set": data_update})
#     print(result)
    
    
from lib.XML_Import import WorkFile_Manager

wfm = WorkFile_Manager('METER_EM600_(ITE623_-_RUBY)_VER_0_03_20230419_1252.xml')
wfm.render()
