import requests
import pytest
import context as context

@pytest.mark.v1
@pytest.mark.positive
def test_change_password():
    # NOTE: Require JWT token. We need to login first
    if context.JWT == '':
        _api = "local"
        _data = {
            "email": f"test_@gmail.com",
            "password": "pass1234"
        }
        response = requests.post(f'{context.ASSOCIATION_URL}/{_api}', json=_data)
        assert response == 200
        context.JWT = response_payload['jwt']
    
    print("JWT:",context.JWT)
    api = "changepassword"
    headers = {
        "Authorization": f"Bearer {context.JWT}",
        "Content-Type": "application/json"
    }
    data = {
        "email": f"test_@gmail.com",
        "newpassword": "pass12345"
    }
    
    response = requests.post(f'{context.ASSOCIATION_URL}/{api}', json=data, headers=headers)
    response_payload = response.json()
    print('response',response_payload)
    assert response.status_code == 200

test_change_password()