from flask import Flask, Response, request, jsonify, send_file, abort
from time import time
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
from server.association_server import Association_Server
from server.export_import_data import Export_Import_Data
from server.crud_server import COSEM_Crud_Server
from datetime import timedelta


app = Flask(__name__)
app.register_blueprint(Association_Server, url_prefix='/auth')
app.register_blueprint(Export_Import_Data, url_prefix='/data')
app.register_blueprint(COSEM_Crud_Server, url_prefix='/project')

app.config['JWT_SECRET_KEY'] = 'my-secret-key'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=8) # set token expiration time
app.config['JST_REFRESH_TOKEN_EXPIRES'] = timedelta(days=1) # set refresh token expiration time
# app.config['JWT_TOKEN_LOCATION'] = ['cookies'] # store tokens in coockies
jwt = JWTManager(app)

CORS(app)

@app.route('/')
def index():
    print('Hello world')
    return ('Hello world')
