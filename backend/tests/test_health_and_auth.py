def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "WeatherGPT" in data["service"]

def test_user_registration(client):
    payload = {
        "email": "reg_user@imd.gov.in",
        "username": "reg_user",
        "password": "SecurePassword123!",
        "full_name": "Senior IMD Meteorologist"
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "reg_user@imd.gov.in"
    assert data["user"]["username"] == "reg_user"

def test_duplicate_user_registration(client):
    payload = {
        "email": "dup_user@imd.gov.in",
        "username": "dup_user",
        "password": "Password123!"
    }
    # Initial registration
    res1 = client.post("/api/v1/auth/register", json=payload)
    assert res1.status_code == 201

    # Duplicate registration
    res2 = client.post("/api/v1/auth/register", json=payload)
    assert res2.status_code == 400
    assert "already exists" in res2.json()["detail"]

def test_user_login_success(client):
    # Register first
    client.post("/api/v1/auth/register", json={
        "email": "login_user@imd.gov.in",
        "username": "login_user",
        "password": "SecurePassword123!"
    })

    # Now login
    payload = {
        "username_or_email": "login_user",
        "password": "SecurePassword123!"
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["username"] == "login_user"

def test_user_login_failure(client):
    payload = {
        "username_or_email": "non_existent_user",
        "password": "WrongPassword123!"
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 401
    assert "Incorrect" in response.json()["detail"]

def test_protected_me_route(client):
    reg_res = client.post("/api/v1/auth/register", json={
        "email": "me_user@imd.gov.in",
        "username": "me_user",
        "password": "SecurePassword123!"
    })
    token = reg_res.json()["access_token"]

    # Valid token
    res = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    assert res.json()["username"] == "me_user"

    # Missing token
    res_no_auth = client.get("/api/v1/auth/me")
    assert res_no_auth.status_code == 401

def test_user_preferences(client):
    reg_res = client.post("/api/v1/auth/register", json={
        "email": "pref_user@imd.gov.in",
        "username": "pref_user",
        "password": "SecurePassword123!"
    })
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch preferences
    res = client.get("/api/v1/preferences", headers=headers)
    assert res.status_code == 200
    assert res.json()["temp_unit"] == "celsius"

    # Update preferences
    update_res = client.put("/api/v1/preferences", headers=headers, json={
        "temp_unit": "fahrenheit",
        "language": "ta"
    })
    assert update_res.status_code == 200
    assert update_res.json()["temp_unit"] == "fahrenheit"
    assert update_res.json()["language"] == "ta"
