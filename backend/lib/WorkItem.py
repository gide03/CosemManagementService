class WorkItem:
    def __init__(self) -> None:
        self.title = "New COSEM"
        self.classId = ""
        self.objectName = ""
        self.logicalName = ""
        self.templates = {} #TBD
        self.selectedVersion = "version-0"
        # self.nodeEnable = { 'attribute': [], 'method': [] }
        self.accessRight = { } #TBD
        # storage for template helper
        self.versionOptions = [] #TBD
        self.attribute = []
        self.method = []
        self.comment = ''
        self.captureObject = []

    def get_json(self):
        temp_attribute = []
        temp_method = []

        for att in self.attribute:
            if att == None:
                temp_attribute.append(None)
                continue
            temp_attribute.append(att.get_json())
        for mtd in self.method:
            if mtd == None:
                temp_method.append(None)
                continue
            temp_method.append(mtd.get_json())

        return {
            "title": self.title,
            "classId": self.classId,
            "objectName": self.objectName,
            "logicalName": self.logicalName,
            "templates": self.templates,
            "selectedVersion": self.selectedVersion,
            # "nodeEnable": self.nodeEnable,
            "captureObject": self.captureObject,
            "accessRight": self.accessRight,
            "attribute": temp_attribute,
            "method": temp_method,
            "comment": self.comment
        }