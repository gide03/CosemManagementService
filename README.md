# 1. Brief
This project contains a service to maintain COSEM release in a project.

# 2. Running service
There are 3 thing need to do here:
1. Configure backend server
2. Configure database, here the project designed to use noSQL database `mongodb`
3. Configure frontend server

## 2.1. Configure backend server
Go to backend directory `cd backend`, and follow this steps:
1. Create python virtual environment. example: `python -m venv env`
2. Activate the virtual envionrment. On linux: `source env/bin/activate` On windows: `env\Script\activate`
3. Install the requrements: `pip install -r requirements.txt`
4. Run the server: `flask run`
5. Done!!
> Note: if you want to share the access with other device, pass other parametre such as --port or --host.

## 2.2. Configure database
Just install mongodb in your local device and run the service. 
> TIP: we could install it in docker. Consider to setup docker volume for the container

## 2.3. Configure frontend server
Go to frontend directory `cd frontend`, and follow this steps:
1. Install node package `npm install`, wait until all process done
2. Build the frontend `npm run build`, after process done `build` directory will appear on frontend directory
3. Run the serivice `serve -s build`
4. Done !!!

> TIP: it is better to configure reverse proxy using an application like nginx. On the client side, it is more better to go to xx.xx.xx.xx instead of xx.xx.xx.xx:3000
