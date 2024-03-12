import struct

def get_dtype_enum(dtype:str)-> int:
    '''
        Get enumerator standard blue book
    '''
    dtype_enum = {
        None:None,
        "NullDTO":0,
        "BooleanDTO":3,
        "BitStringDTO":4,
        "Integer32DTO":5, 
        "Unsigned32DTO": 6,
        "OctetStringDTO":9, 
        "VisibleStringDTO":10,
        "utf8-string":12,
        "bcd":13,
        "Integer8DTO":15,
        "Integer16DTO":16,
        "Unsigned8DTO":17,
        "Unsigned16DTO":18, 
        "Integer64DTO":24,
        "Unsigned64DTO":21, 
        "EnumeratedDTO":22, 
        "Float32DTO":23,
        "Float64DTO":24,
        "DateTime":25,
        "Date":26,
        "Time":27,
        "Array":1,
        "Structure":2,
    }
    if dtype == None:
        return None
    if 'Array' in dtype:
        return 1
    return dtype_enum[dtype]

def get_bit_string(bit_list):
    '''
        CAST bit list to firmware format. [bit_length, unsigned number forms]
    '''
    BASE_BIT = 8
    BITSTRING_NUM = []
    BITSTRING_VALUE = 0
    
    BIT_NUM = []
    if bit_list != []:
        if type(bit_list) is str:
            BIT_LEN = len(bit_list)
            # XML_DATA_BIT = "11111111"
            for i in range(BIT_LEN):
                if bit_list[i] == str(1):
                    bit = i+1
                    BIT_NUM.append(bit)
        elif type(bit_list) is list and type(bit_list[0]) is int:
            # DATA_BIT = [1,2,3,4,5,6,7,8]
            BIT_NUM = bit_list
    
    bit_num = BIT_NUM

    for bit in bit_num:
        byte = int(bit / BASE_BIT)
        bit_pos = bit % BASE_BIT
        if bit_pos == 0:
            bit_pos = 8
            byte -= 1
        nw_bit = (BASE_BIT - bit_pos)
        bitstr = ((1 << nw_bit) << (BASE_BIT*byte))
        BITSTRING_NUM.append(nw_bit + (8*byte))
        BITSTRING_VALUE += bitstr
    return BITSTRING_VALUE

def extract_dtype(node):
    '''
        Extract data type
    '''
    if node['_dtype'] == 'Choice':
        return extract_dtype(node['children'][0])
    
    if node['_dtype'] == 'Structure':
        dtype = {"Structure":[]}
        for child in node['children']:
            dtype["Structure"].append(extract_dtype(child))
        return dtype
    
    if node['_dtype'] == 'Array':
        min_value = node['minValue']
        max_value = node['maxValue']
        template = node['arrayTemplate']
        dtype = {f'Array-{min_value}-{max_value}':[]}
        dtype[f'Array-{min_value}-{max_value}'].append(extract_dtype(template))
        return dtype
    # print(f"EXTRACT DTYPE RETURN {node['_dtype']}")
    return node['_dtype']

def extract_defaultvalue(node):
    '''
        Extract default value
    '''
    if node['_dtype'] == 'Choice':
        return extract_defaultvalue(node['children'][0])
    
    if node['_dtype'] == 'Structure':
        defaultValue = {'Structure':[]}
        for child in node['children']:
            defaultValue['Structure'].append(extract_defaultvalue(child))
        return defaultValue
    
    if node['_dtype'] == 'Array':
        min_value = node['minValue']
        max_value = node['maxValue']
        defaultValue = {f'Array-{min_value}-{max_value}':[]}
        for child in node['children']:
            defaultValue[f'Array-{min_value}-{max_value}'].append(extract_defaultvalue(child))
        return defaultValue

    return cast_value(node['_dtype'], node['defaultValue'])

def extract_modifier(node):
    '''
        Extract modifier
    '''    
    if node['_dtype'] == 'Choice':
        return extract_modifier(node['children'][0])
    
    if node['_dtype'] == 'Structure':
        modifier = {'Structure':[]}
        for child in node['children']:
            modifier['Structure'].append(extract_modifier(child))
        return modifier
    
    if node['_dtype'] == 'Array':
        min_value = node['minValue']
        max_value = node['maxValue']
        modifier = {f'Array-{min_value}-{max_value}':[]}
        for child in node['children']:
            modifier[f'Array-{min_value}-{max_value}'].append(extract_modifier(child))
        return modifier

    if node['modifier'] == '':
        return None
    return node['modifier']

def extract_maxvalue(node):
    '''
        Extract max value
    '''
    if node['_dtype'] == 'Choice':
        return extract_maxvalue(node['children'][0])
    
    if node['_dtype'] == 'Structure':
        maxvalue = {None:[]}
        for child in node['children']:
            maxvalue[None].append(extract_maxvalue(child))
        return maxvalue
    
    if node['_dtype'] == 'Array':
        try:
            max_value = int(node['maxValue'])
        except:
            max_value = 0
        template = node['arrayTemplate']
        maxvalue = {max_value:[]}
        maxvalue[max_value].append(extract_maxvalue(template))
        return maxvalue

    if node['_dtype'] == 'EnumeratedDTO':
        minvalue = [int(choice) for choice in node['enumChoices']]
        return minvalue
    
    # for time only
    if node['_dtype'] == 'DateTime':
        return 12
    if node['_dtype'] == 'Date':
        return 5
    if node['_dtype'] == 'Time':
        return 4

    return cast_value(node['_dtype'], node['maxValue'])

def cast_value(dtype, value):
    '''
        Cast value based on its dtype
    '''
    # print(f'[cast_value] value: {value} type of value: {type(value)} dtype: {dtype}')
    if value == None:
        return None

    numeric_data_types = (
        'Unsigned8DTO',
        'Unsigned16DTO',
        'Unsigned32DTO',
        'Unsigned64DTO',
        'Integer8DTO',
        'Integer16DTO',
        'Integer32DTO',
        'Integer64DTO'
        )

    is_numeric = False
    for i in numeric_data_types:
        if dtype.find(i) != -1:
            is_numeric = True

    if is_numeric:
        if value == '':
            return 0
        return int(value)
    if dtype == 'EnumeratedDTO':
        if ',' in value:
            return [int(i) for i in value.split(',')]
        if len(value) == 0:
            return 0
        return int(value)
    if dtype == 'BooleanDTO':
        if value.lower() == 'true':
            return 1
        elif value == '1':
            return 1
        return 0
    if dtype == 'OctetStringDTO':
        if type(value) == int:
            return value        
        if ';' in value:
            output = [int(i) for i in value.split(';')]
            return output  
        else:
            try:
                return [int(value)]
            except:
                pass
        if ',' in value:
            output = [int(i) for i in value.split(',')]
            return output
        if value == '':
            return 0
        return value.split(',')
    if dtype in ('DateTime', 'Date', 'Time'):
        if ',' in value:
            output = [int(i) for i in value.split(',')]
            return output
        if value == '':
            return 0
        return [int(i) for i in value.split(',')]
    if dtype == 'VisibleStringDTO':
        output = []
        try:
            if ',' in value:
                return [int(i) for i in value.split(',')]
            for i in value:
                output.append(ord(i))
        except:
            pass
        return output
    if dtype == 'Float32DTO':
        if value == '':
            return 0
        # transformed_value = struct.unpack('!f', bytes.fromhex(value))[0]
        transformed_value = [int(value[i:i+2], 16) for i in range(0, len(value), 2)]
        return transformed_value

    if dtype == 'Float64DTO':
        # transformed_value = struct.unpack('!d', bytes.fromhex(value))[0]
        transformed_value = [int(value[i:i+2], 16) for i in range(0, len(value), 2)]
        return transformed_value

    if dtype == 'BitStringDTO':
        if value == '':
            return [0,0]
        if ',' in value:
            output = get_bit_string(value.replace(',',''))
            return [len(value), output]
        output = get_bit_string(value)
        return [len(value), output]

    if dtype == 'NullDTO':
        return None
    
    return value

def extract_minvalue(node):
    '''
        Extract min value
    '''
    if node['_dtype'] == 'Structure':
        minvalue = {None:[]}
        for child in node['children']:
            minvalue[None].append(extract_minvalue(child))
        return minvalue
    
    if node['_dtype'] == 'Array':
        try:
            min_value = int(node['minValue'])
        except:
            min_value = 0
        template = node['arrayTemplate']
        minvalue = {min_value:[]}
        minvalue[min_value].append(extract_minvalue(template))
        return minvalue

    if node['_dtype'] == 'EnumeratedDTO':
        minvalue = [int(choice) for choice in node['enumChoices']]
        return minvalue

    # for time only
    if node['_dtype'] == 'DateTime':
        return 12
    if node['_dtype'] == 'Date':
        return 5
    if node['_dtype'] == 'Time':
        return 4
    
    return cast_value(node['_dtype'], node['minValue'])

def extract_node(node):
    '''
    Value will be extract
        title
        modifier
        data_type
        minimum_value
        default_value
        maximum_value
    '''
    if node == None:
        return (None, None, None, None, None)
    
    # title = extract_title(node)
    modifier = extract_modifier(node)
    dtype = extract_dtype(node)
    minvalue = extract_minvalue(node)
    maxvalue = extract_maxvalue(node)
    defaultvalue = extract_defaultvalue(node)
    return (modifier, dtype, minvalue, maxvalue, defaultvalue)

def flatten(data, deep=False):
    output = []
    for element in data:
        if type(element) == dict:
            key = list(element.keys())[0]
            output.append(key)
            output.extend(flatten(element[key]))
            continue
        
        if deep and type(element) == list:
            output.extend(flatten(element, deep))
            continue
        output.append(element)
    return output

def flatten_attribute(data):
    def normalize(value_list):
        '''
            Remove dict
        '''
        output = []
        for element in value_list:
            if type(element) == dict:
                key = list(element.keys())[0]
                temp = []
                temp.append(key)
                temp.extend(normalize(element[key]))
                output.extend(temp)
                continue
            output.append(element)
        return output
            
    return [normalize([i]) for i in data]

def transpose(X):
    '''
        Matrix transpose
    '''
    row = len(X)
    if row == 0:
        return []
    col = len(X[0])
    output = []
    for i in range(col):
        _temp = []
        for j in range(row):
            _temp.append(X[j][i])
        output.append(_temp)
    return output


def extract_all_value(ui_state:dict)->dict:
    '''
        Extract ui_state to data that will be stored in COSEM database.
        Returns:
            {} if there is failure in data parsing
            {...} if success
    '''
    out_data = {}

    # Extract basic form
    object_name = ui_state['objectName']
    logical_name = [int(i) for i in ui_state['logicalName'].split(';')]
    class_id = int(ui_state['classId'].split(' ')[-1])
    version = int(ui_state['selectedVersion'].split('-')[-1])
    
    # Extract nodes
    attributes = []
    # for node, isEnable in zip(ui_state['attribute'], ui_state['nodeEnable']['attribute']):
    #     extracted_value = extract_node(node)
    #     attributes.append(extracted_value if isEnable else [None]*len(extracted_value))
    for node in ui_state['attribute'][1:]:
        extracted_value = extract_node(node)
        attributes.append(extracted_value)
        
    # Extract methods
    methods = []
    for node in ui_state['method']:
        extracted_value = extract_node(node)
        methods.append(extracted_value)

    # Merge basic data
    out_data['object_name'] = object_name
    out_data['logical_name'] = logical_name
    out_data['class_id'] = class_id
    out_data['version'] = version
    # Merge attribute and method nodes
    keys = ('modifier', 'Structure', 'min_value', 'max_value', 'default_value')
    attributes = transpose(attributes)
    methods = transpose(methods)

    # Merge Data
    for _key in keys:
        out_data[_key] = {'attribute':[], 'method':[]}
    
    # print(f'LENGTH of ATTRIBUTE: {len(attributes)}')
    for _key, _att in zip(keys, attributes):
        out_data[_key]['attribute'] = _att
        
    for _key, _mtd in zip(keys, methods):
        out_data[_key]['method'] = _mtd

    # Flatten DTYPE, MIN, MAX value
    out_data['Structure'] = {'attribute':(flatten_attribute(out_data['Structure']['attribute'])), 'method':(flatten_attribute(out_data['Structure']['method']))}
    out_data['min_value'] = {'attribute':(flatten_attribute(out_data['min_value']['attribute'])), 'method':(flatten_attribute(out_data['min_value']['method']))}
    out_data['max_value'] = {'attribute':(flatten_attribute(out_data['max_value']['attribute'])), 'method':(flatten_attribute(out_data['max_value']['method']))}

    # Convert DTYPE to COSEM enum
    out_data['Structure'] = {
        'attribute':[[[get_dtype_enum(i) for i in _att]][0] for _att in out_data['Structure']['attribute']], 
        'method':[[[get_dtype_enum(i) for i in _mtd]][0] for _mtd in out_data['Structure']['method']]}
    
    for val in out_data:
        try:
            temp = []
            if "attribute" in out_data[val] and 'method' in out_data[val]:
                temp.append(out_data[val]['attribute'])
                temp.append(out_data[val]['method'])
                out_data[val] = temp
        except:
            pass
    return out_data