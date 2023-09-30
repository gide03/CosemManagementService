class Node:
    def __init__(self, title, id, parent, isConfigurable = False, dtype = "null-data") -> None:
        self.id = id
        self.hidden = False # manipulate end-point visibility
        self.title = title
        self.dtypeChoices = None # None or dictionary
        self.enumChoices = {}
        self.comment = ''

        # Logical state
        self.isArray = False
        self.isChoice = False
        self.is_ASCII = []
        self.is_ByteArray = []
        self.is_VisibleString = []
        self.isConfigurable = isConfigurable

        # For array only
        self.arrayTemplate = None

        # Main data form
        self.section = "NLR"
        self.defaultValue = ""
        self.reference = ""
        self.modifier = ""
        self.minValue = ""
        self.maxValue = ""
        self.parent = parent
        self.children = []
        self._dtype = dtype

    def get_json(self):
        me = {
            "id": self.id,
            "hidden": self.hidden,
            "title": self.title,
            "dtypeChoices": self.dtypeChoices,
            "enumChoices": self.enumChoices,
            "comment": self.comment,

            # Logical state
            "isArray": self.isArray,
            "isChoice": self.isChoice,
            "is_ASCII": self.is_ASCII,
            "is_ByteArray": self.is_ByteArray,
            "is_VisibleString": self.is_VisibleString,
            "isConfigurable": self.isConfigurable,

            # For array only
            "arrayTemplate": self.arrayTemplate.get_json() if self.arrayTemplate != None else None,

            # Main data form
            "section": self.section,
            "defaultValue": self.defaultValue,
            "reference": self.reference,
            "modifier": self.modifier,
            "minValue": self.minValue,
            "maxValue": self.maxValue,
            "parent": None,
            "children": [child.get_json() for child in self.children],
            "_dtype": self._dtype,
        }
        return me
    
    def standardize_id(self, _node):
        for idx, child in enumerate(_node.children):
            child.parent = _node
            child.id = f'{_node.id}-{idx}'
            if len(child.children) > 0:
                _node.standardize_id(child)

    def standardize(self):
        self.standardize_id(self)

    def add_child(self, node):
        self.children.append(node)
        self.standardize_id(self)
    
    def walk(self, node=None):
        root = node
        if root == None:
            root = self
        print(root.id)
        for child in root.children:
            self.walk(child)
