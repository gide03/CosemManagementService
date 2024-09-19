import requests
import pytest
import context as context

@pytest.mark.v1
@pytest.mark.positive
@pytest.mark.register
def test_register():
    '''
        Register new account
    '''
    api = "register"
    data = {
        "username": f"autotest",
        "email": f"test_@gmail.com",
        "password": "pass1234"
    }
    response = requests.post(f'{context.ASSOCIATION_URL}/{api}', json=data)
    assert response.status_code == 200
    print(response.json())
    
@pytest.mark.v1
@pytest.mark.positive
@pytest.mark.register
def test_duplicate_register():
    '''
        Register dupplicate account
    '''
    api = "register"
    data = {
        "username": f"autotest",
        "email": f"test_@gmail.com",
        "password": "pass1234"
    }
    response = requests.post(f'{context.ASSOCIATION_URL}/{api}', json=data)
    assert response.status_code == 400
    print(response.json())
