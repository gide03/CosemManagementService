import xml.etree.ElementTree as ET
import copy
from .Node import Node
from .WorkItem import WorkItem

class WorkFile_Manager():
    def __init__(self, file, override_access_level:list=[]):
        '''
            override_access_level: [client_name_1, client_name_2]
        '''
        self.tree = ET.parse(file)
        self.override_access_level = override_access_level
    
    def getObjectList(self):
        cosem_list = self.render()
        return cosem_list

    def xml_to_nodes(self, attribute_items):
        def transform(_tag):
            name = _tag.get('name')
            _id = _tag.get('id')
            _dtype = _tag.tag
            min_value = _tag.get('min_value')
            max_value = _tag.get('max_value')
            default_value = _tag.get('default_value')

            mNode = Node(
                title=name,
                id=str(_id),
                parent=None,
                isConfigurable=False,
                dtype=_dtype
            )
            mNode.minValue = min_value
            mNode.maxValue = max_value
            mNode.defaultValue = default_value

            if _dtype == 'Array':
                mNode.minValue = _tag.get('min_size')
                mNode.maxValue = _tag.get('max_size')
            
            if _dtype in ('Array', 'Structure'):
                for child in _tag:
                    mNode.add_child(transform(child))
                
                if _dtype == 'Array':
                    mNode.arrayTemplate = copy.deepcopy(mNode.children[0])
                    mNode.children = []
                    for i in range(int(mNode.minValue)):
                        mNode.add_child(copy.deepcopy(mNode.arrayTemplate))
            
            if _dtype == 'VisibleStringDTO':
                mNode.defaultValue = ','.join([str(ord(i)) for i in default_value])
                mNode.minValue = len(default_value)
                mNode.maxValue = len(default_value)
                    
            if _dtype == 'OctetStringDTO':
                is_logical_name = True if _tag.get('is_logical_name') == 'True' else False
                if is_logical_name:
                    default_value = default_value.split(';')
                else:
                    default_value = [str(int(default_value[i:i+2], 16)) for i in range(0, len(default_value), 2)]
                mNode.defaultValue = ','.join(default_value)
                mNode.minValue = len(default_value)
                mNode.maxValue = len(default_value)
            
            if _dtype == 'BitStringDTO':
                default_value = [i for i in default_value]
                default_value = ';'.join(default_value)
                
            if _dtype == 'BooleanDTO':
                min_value = '0'
                max_value = '1'
                
            if _dtype in ('Choice'):
                mNode.dtypeChoices = {}
                for idx, child in enumerate(_tag):
                    selector_node = transform(child)
                    mNode.add_child(selector_node)
                    mNode.dtypeChoices[f'option-{idx}'] = mNode.children[-1]
                mNode.children = [mNode.children[-1]]
                mNode.standardize_id(mNode)
                for idx, selector_node in enumerate(mNode.dtypeChoices):
                    mNode.dtypeChoices[selector_node].id = f'option{idx}'
                    mNode.dtypeChoices[selector_node].standardize_id(mNode.dtypeChoices[selector_node])
                    mNode.dtypeChoices[selector_node] = mNode.dtypeChoices[selector_node].get_json()
            # in case there was enumeration inside _tag
            for enum_item in _tag:
                if enum_item.get('value') != None:
                    mNode.enumChoices[enum_item.get('value')] = enum_item.get('description')
            return mNode

        output = [transform(attribute_item) for attribute_item in attribute_items] # iterate and store in list
        return output[0]

    def get_attribute(self, cosemObject):
        attribute = []
        for att in cosemObject:
            if att.get('name') == 'reserved':
                continue
            attribute.append(att)
            
        accessrights = []
        attribute_items = []
        output_attributes = []
        output_accessright = {}

        # access_right_association initialization
        if len(self.override_access_level) > 0:
            Association_List = self.override_access_level[:]
        else:
            Association_List = [association.get('keyname') for association in self.tree.iter('association')]
        for association in Association_List:
            output_accessright[association] = []

        # Unwrap attribute elements in xml
        for att in attribute:
            for att_element in att: #iterate <attribute> elements
                if att_element.tag == 'accessrights':
                    accessrights.append([access_right for access_right in att_element])
                elif att_element.tag == 'attribute_items':
                    attribute_items.append(att_element)
        
        # extract acessright
        for att, accessright in zip(attribute, accessrights):
            temp = {}
            att_id_item = int(att.get('id'))
            for access_item in accessright: # fill if assoc exist
                if len(self.override_access_level) > 0:
                    temp[access_item.get('association')] = 'NA'
                else:
                    temp[access_item.get('association')] = access_item.text.strip()
            
            for assoc_client in Association_List:
                if assoc_client in temp:
                    # if att_id_item < 129:
                    output_accessright[assoc_client].append(temp[assoc_client])
                else:
                    output_accessright[assoc_client].append('NA')

        # Deep walk to get xml elements. It will returns attribute data structure
        for attribute, attribute_item in zip(attribute, attribute_items):
            output_attributes.append(self.xml_to_nodes(attribute_item))
            output_attributes[-1].id = attribute.get('id')
            output_attributes[-1].title = attribute.get('name')
            output_attributes[-1].standardize()
        

        # Separate attribute and method
        id_list = [int(att.id) for att in output_attributes]
        temp_attribute = {"attribute":[], "method":[]}
        temp_associations = {}
        for _key in output_accessright:
            temp_associations[_key] = {"attribute":[], "method":[]}
        for idx,att_id in enumerate(id_list): # NOTE: It's actually the same algorithm for attribute and association
            t_key = "attribute" if att_id<129 else "method"
            temp_attribute[t_key].append(output_attributes[idx])
            for _key in temp_associations:
                try:
                    temp_associations[_key][t_key].append(output_accessright[_key].pop(0))
                except:
                    temp_associations[_key][t_key].append('NA')

            # if idx < len(id_list)-1:
            #     if id_list[idx+1] - att_id > 1 and id_list[idx+1] != 129:  # FILL ATTRIBUTE
            #         # for attribute
            #         num_of_empty_attribute = id_list[idx+1] - att_id - 1
            #         temp_attribute[t_key].extend([None]*num_of_empty_attribute)

            #         # for association
            #         for _key in temp_associations:
            #             temp_associations[_key][t_key].extend([None]*num_of_empty_attribute)
                
        output_attributes = temp_attribute
        output_accessright = temp_associations
        
        # Interpolation attribute
        temp_attributeIdList = [int(att.id) for att in output_attributes['attribute']]
        temp_methodIdList = [int(att.id) for att in output_attributes['method']]
        prev_id = 0
        for idx,att in enumerate(cosemObject):
            id = int(att.get('id'))
            
            if int(att.get('id')) < 129: #attribute
                if id in temp_attributeIdList:
                    prev_id = id
                else:
                    temp_attributeIdList.insert(temp_attributeIdList.index(prev_id)+1, id)
                    output_attributes['attribute'].insert(temp_attributeIdList.index(prev_id)+1, None)
                    for client in output_accessright:
                        output_accessright[client]['attribute'].insert(temp_attributeIdList.index(prev_id)+1, 'NA')
                    prev_id = id
                continue
            
            # method
            if prev_id<129: # prev_id switch from attribute
                prev_id = id
                if prev_id not in temp_methodIdList: # if the first method not exist
                    temp_methodIdList.insert(0, id)
                    output_attributes['method'].insert(0, None)
                    for client in output_accessright:
                        output_accessright[client]['method'].insert(0, 'NA')
                    continue
            
            if id in temp_methodIdList:
                prev_id = id
            else:
                if temp_methodIdList == []:
                    temp_methodIdList.append(id)
                    output_attributes['method'].append(None)
                    prev_id = id
                    for client in output_accessright:
                        output_accessright[client]['method'].append('NA')
                    continue
                
                temp_methodIdList.insert(temp_methodIdList.index(prev_id)+1, id)
                output_attributes['method'].insert(temp_methodIdList.index(prev_id)+1, None)
                prev_id = id
                for client in output_accessright:
                    output_accessright[client]['method'].insert(temp_methodIdList.index(prev_id)+1, 'NA')
        return output_attributes, output_accessright
    

    def render(self):
        work_items = []
        for cosemObject in self.tree.iter('COSEM_object'):
            object_name = cosemObject.get('name')
            logical_name = cosemObject.get('logical_name')
            class_id = cosemObject.get('class_id')
            version = cosemObject.get('version')
            attribute, accessrights = self.get_attribute(cosemObject)
            
            work_item = WorkItem()
            work_item.title = object_name
            work_item.objectName = object_name
            work_item.logicalName = logical_name
            work_item.classId = class_id
            work_item.selectedVersion = f'version-{version}'
            work_item.attribute = attribute['attribute']
            work_item.method = attribute['method']            
            work_item.accessRight = accessrights
            work_items.append(work_item)
            
        # fetch capture objects if the xml is customer mode
        # NOTE: self.override_access_level > 0 can indicate the parser have manuf xml
        if len(self.override_access_level) == 0:
            for profile in self.tree.iter('capture'):
                object_name_list = [obj.objectName for obj in work_items]
                object_index = object_name_list.index(profile.get('name'))
                selected_work_item = work_items[object_index]
                
                # iterate the capture object
                for capture_object in profile:
                    id = capture_object.get('id')
                    name = capture_object.get('name')
                    logical_name = capture_object.get('logical_name')
                    class_id = capture_object.get('class_id')
                    version = capture_object.get('version')
                    index = capture_object.get('index')
                    is_optional = capture_object.get('is_optional')
                    is_default = capture_object.get('is_default')

                    obj = [name, class_id, logical_name, id, index, is_optional, is_default]
                    selected_work_item.captureObject.append(obj)


                # fill default value of profile with the capture objects if is_default is True
                    # cl_id , logical_name, attribute, index
                if len(selected_work_item.captureObject) > 0:
                    node_capture_object = selected_work_item.attribute[2]
                    node_capture_object.children = [] # reset attribute 3 (capture object)
                    for capture_object in selected_work_item.captureObject:
                        if capture_object[-1] != 'True':
                            continue
                        cl_id = capture_object[1]
                        logical_name = capture_object[2].replace(';',',')
                        attribute = capture_object[3]
                        index = capture_object[4]
                        val_cap_obj = (cl_id, logical_name, attribute, index)
                        template = copy.deepcopy(node_capture_object.arrayTemplate) # the data structure of child shall be the same
                        for node_child, val in zip(template.children, val_cap_obj):
                            node_child.defaultValue = val
                        node_capture_object.add_child(template)
                    selected_work_item.attribute[2] = node_capture_object
        work_items = [wi.get_json() for wi in work_items]
        return work_items
