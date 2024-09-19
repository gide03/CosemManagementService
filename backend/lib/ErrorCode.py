class ErrorCode:
    OK = 200            # Indicates a successful operation, commonly used for successful retrieval (Read) or update (Update) operations
    CREATED = 201       # Typically used after a successful creation (Create) of a new resource
    NO_CONTENT = 204    # Indicates that the server successfully processed the request but there is no content to send back
    BAD_REQUEST = 400   # Signifies that the server cannot understand the request, often used when the request parameters are invalid or missing
    UNAUTHORIZED = 401  # Indicates that authentication is required and has failed, or the user does not have the necessary permissions for the operation
    FORBIDDEN = 403     # The server understood the request, but it refuses to authorize it
    NOT_FOUND = 404     # Indicates that the requested resource was not found on the server
    CONFLICT = 409      # Indicates that the request could not be completed due to a conflict with the current state of the target resource
    