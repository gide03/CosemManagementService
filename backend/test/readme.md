# Running test script

Please start the test inside current absolute path!!. You can run specific groups of tests using the -k option with the markers. For example:

> pytest -k `mark name` test_example.py

we could make operation when pass `-k` for example:

- `pytest -k "positive or slow" test_example.py`
- `pytest -k "positive and slow" test_example.py`
- `pytest -k "(positive or negative) and slow" test_example.py`

# Test order

This is positive test order

1. test_association_register_v1.py
2. test_assocaition_login_v1.py

```
    pytest -k "v1 and positive" -v .\test_association_register_v1.py .\test_association_register_v1.py
```
