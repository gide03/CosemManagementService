{
    "statusCode": 400,
    "error": "Bad Request",
    "message": [
        {
            "messages": [
                {
                    "id": "Auth.form.error.invalid",
                    "message": "Identifier or password invalid."
                }
            ]
        }
    ],
    "data": [
        {
            "messages": [
                {
                    "id": "Auth.form.error.invalid",
                    "message": "Identifier or password invalid."
                }
            ]
        }
    ]
}

def ErrorMessage(statusCode:int, error:str, message:list, data:list)->dict:
    '''
        Helper to create error message
        @param statusCode 
            status code of http response
        @param error 
            error context
        @param message
            list of messages
        @param data
            list of data
    '''
    response = {
        "statusCode" : statusCode,
        "error" : error,
        "message" : message,
        "data" : data
    }
    return response