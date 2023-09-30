import pymongo
import ssl
from flask import jsonify, request, blueprints
from flask_jwt_extended import jwt_required, create_access_token, get_jwt_identity
from lib.ErrorMessage import ErrorMessage

# app = Flask(__name__)
Association_Server = blueprints.Blueprint("AssociationServer", __name__)

chelenges = {}

# @Association_Server.record
# def init_mail(state):
#     print('[Association_Server] Initialization mail')
#     mail.init_app(state.app)

@Association_Server.route('/local', methods=['POST'])
def login():
    ''' LOGIN
    payload
    {
        "email" : "member@abc.com",
        "password": "Pass1234"
    }
    '''
    data = request.get_json()
    ErrCode = 200

    try:
        email = data['email']
        password = data['password']
    except:
        resp = ErrorMessage(
            400, 
            "Bad Request", 
            [{"message" : "Key invalid"}], 
            [{"data" : f"Keys required: {['email', 'password']}"}]
        )
        return jsonify(resp), 400

    # Fetch user data by email
    client = pymongo.MongoClient('mongodb://localhost:27017/')
    db = client['user']
    collection = db['users']
    user_find_result = collection.find({"email":email})
    user_find_result = [user for user in user_find_result][0]
    print(user_find_result)
    identity = [user_find_result[_key] for _key in user_find_result][1:]

    # If email not registered yet
    if len(data) == 0:
        resp = ErrorMessage(
            400, 
            "Bad Request", 
            [{"message" : "unnable to find email"}], 
            [{"data" : f"unnable to find email"}]
        )
        return jsonify(resp), 400
   
    # validating email
    if email == user_find_result['email'] and password == user_find_result['password']:
        resp = {
            "jwt" : create_access_token(identity),
            "user": {
                "id":1,
                "username":user_find_result['username']
            }
        }
    else:
        resp = ErrorMessage(
            400, 
            "Bad Request", 
            [{"message" : "[Association_Server] Invalid identifier or password"}], 
            [{"data" : f"[Association_Server] Invalid identifier or password"}]
        )
        ErrCode = 400
    return jsonify(resp), ErrCode

@Association_Server.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    # Data Validation
    try:
        username = data['username']
        email = data['email']
    except:
        resp = ErrorMessage(
            400, 
            "Bad Request", 
            [{"message" : "[Association_Server :: register] Invalid identifier or password"}], 
            [{"data" : f"[Association_Server :: register] Keys required: {['username', 'email', 'password']}"}]
        )
        return jsonify(resp), 400

    # Get the list of users
    client = pymongo.MongoClient('mongodb://localhost:27017/')
    db = client['user']
    collection = db['users']

    user = [user for user in collection.find({"email": email})]
    if len(user) == 0:
        collection.insert_one(data)
        identifer = [data['username'], data['email']]
        resp = {
            "jwt" : create_access_token(identifer),
            "user": {
                "username":username
            }
        }
        return jsonify(resp), 200

    error_resp = ErrorMessage(
        400, 
        "Bad Request", 
        [{"message" : "[Association_Server :: register] email already registered"}], 
        [{"data" : f"[Association_Server :: register] email already registered"}]
    )
    return jsonify(error_resp), 400

# TODO: Change password
@Association_Server.route('/changepassword', methods=['POST'])
@jwt_required()
def change_password():
    identifier = get_jwt_identity()
    data = request.get_json()

    # validate keys
    try:
        email = data['email']
        new_password = data['newpassword']
    except:
        resp = ErrorMessage(
            400, 
            "Bad Request", 
            [{"message" : "Invalid keys"}], 
            [{"data" : "Required keys: email, newpassword"}]
        )
        return jsonify(resp), 400

    # matching email
    if identifier[1] != data['email']:
        resp = ErrorMessage(
            400, 
            "Bad Request", 
            [{"message" : "Email mismatch"}], 
            [{"data" : "Email mismatch"}]
        )
        return jsonify(resp), 400

    # update password
    client = pymongo.MongoClient('mongodb://localhost:27017/')
    db = client['user']
    collection = db['users']
    filter_criteria = {"email": email}
    update_data = {'$set': {"password":new_password}}
    collection.update_one(filter_criteria, update_data)    

    return 'OK', 200

@Association_Server.route('/getchelenge', methods=['POST'])
def change_password_getchelenge():
    data = request.get_json()
    print(data)
    
    if 'email' not in data:
        resp = ErrorMessage(
            400, 
            "Bad Request", 
            [{"message" : "data key invalid"}], 
            [{"data" : f"email not found"}]
        )
        return jsonify(resp), 400
    
    # check if the email is registered or not
    client = pymongo.MongoClient('mongodb://localhost:27017/')
    db = client['user']
    collection = db['users']
    user_find_result = collection.find({"email":data['email']})
    user_find_result = [user for user in user_find_result][0]
    if len(user_find_result) == 0:
        resp = ErrorMessage(
            400, 
            "Bad Request", 
            [{"message" : "email not registered"}], 
            [{"data" : f"email not registered"}]
        )
        return jsonify(resp), 400
    
    from random import randint
    global chelenges
    # generate random code
    verification_code = randint(1000,9999)
    chelenges[verification_code] = data['email']

    # # email administration
    # sender_email = 'gnugroho.autotest@gmail.com'
    # sender_password = 'uxnmhwjoqyrlyedy'
    recipient_email = data['email']
    # # connect to Gmail's SMTP server
    # smtp_server = 'smtp.gmail.com'
    # smtp_port = 465
    # # Create a secure SSL context
    # context = ssl.create_default_context()
    # # fill email information
    # subject = 'Firmware CMS Change Password'
    # body = f'This is verification code for your request {verification_code}'
    # print(f'send verification code to {recipient_email}')

    print('generate response')
    return jsonify({
        "message":"Verification Code Sent",
        "data":f"Verification code sent to {recipient_email} - {verification_code}"
    }), 200

@Association_Server.route('/verifychelenge', methods=['POST'])
def change_password_verify_chelenge():
    '''
        data request format
        {
            "email": <user email>,
            "chelenge": <chalange code sent to user's email>
        }
    '''
    data = request.get_json()

    if 'email' not in data and 'chelenge' not in data:
        resp = ErrorMessage(
            400, 
            "Bad Request", 
            [{"message" : "data key invalid"}], 
            [{"data" : f"need keys (email, chelenge)"}]
        )
        return jsonify(resp), 400

    # get request data
    global chelenges
    email = data['email']
    chelenge = data['chelenge']

    # check if the email is registered or not
    client = pymongo.MongoClient('mongodb://localhost:27017/')
    db = client['user']
    collection = db['users']
    user_find_result = collection.find({"email":email})
    try:
        user_find_result = [user for user in user_find_result][0]
    except:
        resp = ErrorMessage(
            400,
            "Bad Request",
            [{"message" : "email not registered"}],
            [{"data" : f"email not registered"}]
        )
        return jsonify(resp), 400
    
    # verify the chelenge
    if chelenge in chelenges:
        if chelenges[chelenge] == email:
            identity = [user_find_result[_key] for _key in user_find_result][1:]
            resp = {
                "jwt" : create_access_token(identity),
                "user": {
                    "id":1,
                    "username":user_find_result['username']
                }
            }
            del chelenges[chelenge]
            return jsonify(resp), 200   
        
        resp = ErrorMessage(
            400,
            "Bad Request",
            [{"message" : "chelenge not match"}],
            [{"data" : f"chelenge not match"}]
        )
        return jsonify(resp), 400
    
    resp = ErrorMessage(
        400,
        "Bad Request",
        [{"message" : "chelenge not available"}],
        [{"data" : f"chelenge not available"}]
    )
    return jsonify(resp), 400

@Association_Server.route('/test')
@jwt_required()
def test():
    print(get_jwt_identity())
    return "Association Server Test -- PASSED", 200