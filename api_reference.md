# BackendServer stack

## 1. Association Server

Api list:

- /local (POST)
- /register (POST)
- /changepassword (POST)
- /getchelenge (POST)
- /verifychelenge (POST)
- /test(GET)

### 1.1. API /local

#### Payload:

```.json
{
    "email" : "youremail@web.com",
    "password": "yourpassword"
}
```

#### Error Code:

- `400`, Bad request
- `200`, OK

#### Error Messages:

- Parameter invalid
- Un-registered email
- Invalid identifier or password

### 1.2. API /register

#### Payload:

```.json
{
    "username" : "your name",
    "email" : "your email",
    "password" : "your password"
}
```

#### Error Code

- `400`, Bad request
- `200`, OK

#### Error Message

- Parameter invalid
- Email already registered
- If OK: {"jwt": your jwt, "user": {"username": your name}}

### 1.3. API /changepassword

> JWT required

#### payload

```.json
{
    "email": "your registered email",
    "newpassword": "your new password"
}
```

#### Error Code

- `400`, Bad request
- `200`, OK

#### Error Message

- Parameter invalid
-
- If OK: {"jwt": your jwt, "user": {"username": your name}}

### 1.4. API /getchelenge

### 1.5. API /verifychelenge

### 1.6. API /test
