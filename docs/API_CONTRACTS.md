# WeatherGPT API Reference & Contracts

Base URL: `http://localhost:8000/api/v1`  
OpenAPI Interactive Documentation: `http://localhost:8000/docs`  
ReDoc Reference: `http://localhost:8000/redoc`  

---

## 1. Authentication (`/auth`)

### `POST /auth/register`
Create a new user account.
```json
// Request Body:
{
  "email": "user@imd.gov.in",
  "username": "meteorologist_raj",
  "password": "Password123!",
  "full_name": "Rajesh Kumar"
}

// Response (201 Created):
{
  "access_token": "eyJhbGciOi...",
  "token_type": "bearer",
  "expires_in_minutes": 1440,
  "user": {
    "id": 1,
    "email": "user@imd.gov.in",
    "username": "meteorologist_raj",
    "is_active": true,
    "is_admin": false,
    "created_at": "2026-10-11T12:00:00"
  }
}
```

### `POST /auth/login`
Authenticate with username or email.
```json
// Request Body:
{
  "username_or_email": "meteorologist_raj",
  "password": "Password123!"
}
```

---

## 2. Weather & Forecasting (`/weather`)

### `GET /weather/current?city=Chennai`
Retrieve real-time conditions, 24-hour hourly forecast, 7-day outlook, and atmospheric highlights.

### `GET /weather/compare?city_a=Chennai&city_b=Bengaluru`
Compare meteorological metrics between two cities side-by-side with difference analysis.

---

## 3. Conversational AI Chat (`/chat`)

### `POST /chat`
Natural-language weather questions with tool execution and grounding.
```json
// Request Body:
{
  "message": "Will it rain in Chennai tomorrow? Should I carry an umbrella?",
  "language": "en",
  "current_location": "Chennai"
}

// Response (200 OK):
{
  "session_id": 1,
  "reply": "Yes, carrying an umbrella is recommended today in Chennai...",
  "intent": "UMBRELLA_DECISION",
  "detected_location": "Chennai",
  "grounded_data": {
    "tool": "get_weather",
    "location": "Chennai",
    "temperature": 31.0,
    "rain_probability": 75
  },
  "uncertainty_note": "Atmospheric probability is 75%. Local convective showers possible.",
  "suggested_followups": [
    "What is the hourly rainfall probability?",
    "Is it safe to travel on the highway today?"
  ]
}
```

---

## 4. Alerts & Disaster Warnings (`/alerts`)

### `GET /alerts?severity=Severe&location=Chennai`
Retrieve active and simulation alerts filtered by tier and district.

### `GET /alerts/advisories?city=Chennai`
Generate sector-specific disaster advisories for:
- Agriculture & Irrigation
- Travel & Commute
- Rain & Umbrella
- Heat Exposure & Safety
- Heavy Rain & Flood Preparedness

---

## 5. Climate Insights (`/climate`)

### `GET /climate/trends?city=Chennai&start_date=2026-09-01&end_date=2026-10-01`
Retrieve historical daily observation series and computed statistical metrics (mean temp, record highs, accumulated rain, rainy days count, anomaly).

### `GET /climate/export-csv?city=Chennai&start_date=2026-09-01&end_date=2026-10-01`
Downloadable CSV report formatted with metadata headers and daily records.
