# Brief

COSEM Management System

# 1. Minimal System Requirements

Minimum system: 4 service for frontend, backend, database, url router. You need to install:

1. Python (3.xx ++)
2. NodeJS
3. MongoDB
4. NGINX

## 1.1 Backend Server

Enter `backend` as your workspace directory in a new terminal. Create python virtual environment here. In my case the virtual environment is `env`. Enter the virtual environment and follow the steps bellow:

1. install all python requirements: `pip install -r requirements.txt`
2. configure backend variables
3. run the server: `flask run`

Done!!. We could make it as service or run it on background mode.

### 1.1.1 Backend configuration

The backend need a connection to a dd variables configuratabase, in this project we are using noSQL only with `mongoDB`. Majorly, the database stores the UI states. The UI states contains all COSEM object information like it's object name, logical name, class id, version, attributes, methods and much more.

To configure backend-database connection, go to `./backend/constant/config.json`. Change the variable correspond to the context or you can just leave it in default.

I will provide you documentation in wiki

## 1.2 Frontend Server

Enter `frontend` as your workspace directory in a new terminal. Make sure `nodejs` and `npm` already installed in your device. Then follow the steps below:

1. Install packages by execute `npm install`. Wait until the installation finish
2. Configure the server, edit the config file at `./frontend/constant/config.json`. Change the file as you want or just leave it in default
3. Build the source code, `npm build`. When finish, inside your workspace, there will appear a new directory named "build". Those are our artifact
4. Start the server, `serve -s build`

### 1.2.1 Frontend configuration

The frontend is just a platfrom to transform information into User Interface in user's browser. Thus we need to connect to our backend server by fill the url of our backend. We can just leave it to use default value.

I will provide you documentation in wiki

## 1.3. MongoDB

You can just download and install mongo db to your device, or other device that has installed it. Just, please to remember the ip:port address of this service must be set to backend configuration file.

## 1.4. NGINX

User don't care about service port. Edit nginx configuration to route url to our system. Install <a href='https://www.nginx.com/'>nginx</a> to your system and configure the nginx file. this is minimum configuration I use:

```text
server{
        listen 80;
        listen [::]:80;

        # enable large data stream
        client_max_body_size 100M;

        location / {
                proxy_pass http://localhost:3000;
        }

        location /api/ {
                proxy_pass http://localhost:5000/;
        }
}
```

## 2. Dockerize project

...
