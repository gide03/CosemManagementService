import requests
import pytest
import context as context

@pytest.mark.v1
@pytest.mark.positive
@pytest.mark.login
def test_login():
    '''
        Login with new account
        
        response data:
        {
            'jwt' : str (jwt token),
            'user' : {
                'id': id number,
                'username': registered username ("autotest" in this case)
            }
        }
    '''
    api = "local"
    data = {
        "email": f"test_@gmail.com",
        "password": "pass1234"
    }
    response = requests.post(f'{context.ASSOCIATION_URL}/{api}', json=data)
    assert response.status_code == 200
    response_payload = response.json()
    assert isinstance(response_payload['jwt'], str)
    assert response_payload['user']['username'] == 'autotest'
    
    context.JWT = response_payload['jwt']

@pytest.mark.v1
@pytest.mark.positive
@pytest.mark.login
def test_login_with_wrong_email():
    '''
        Login with new account
    '''
    api = "local"
    data = {
        "email": f"test_{context.TEST_TIME}@yahoo.com",
        "password": "pass1234"
    }
    response = requests.post(f'{context.ASSOCIATION_URL}/{api}', json=data)
    print(response.json())
    assert response.status_code == 400

@pytest.mark.v1
@pytest.mark.positive
@pytest.mark.login
def test_login_with_wrong_password():
    '''
        Login with new account
    '''
    api = "local"
    data = {
        "email": f"test_@gmail.com",
        "password": "pass12345"
    }
    response = requests.post(f'{context.ASSOCIATION_URL}/{api}', json=data)
    assert response.status_code == 400
    print(response.json())
