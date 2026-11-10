# WeatherGPT: System Architecture & Technical Specifications

**Problem Statement ID:** 26068  
**Organization:** Ministry of Earth Sciences (MoES) / India Meteorological Department (IMD)  
**Theme:** Disaster Management  

---

## 1. High-Level Architecture Diagram

```mermaid
flowchart TD
    subgraph Client ["Client Layer (React + TypeScript + Vite)"]
        UI["Weather Dashboard & AI Assistant UI"]
        Map["Leaflet & OpenStreetMap Layer"]
        Voice["Web Speech API (STT / TTS)"]
        i18n["Multilingual Engine (English / Tamil / Hindi)"]
    end

    subgraph API_GW ["Backend API Layer (FastAPI)"]
        AuthRouter["/api/v1/auth (JWT)"]
        WeatherRouter["/api/v1/weather"]
        AlertsRouter["/api/v1/alerts"]
        ClimateRouter["/api/v1/climate"]
        ChatRouter["/api/v1/chat"]
        NWPRouter["/api/v1/nwp"]
    end

    subgraph Core_Services ["Application Services & Logic"]
        WeatherSvc["WeatherService & TTLCache"]
        AdvisoryEngine["Disaster Advisory Rules Engine"]
        AlertSvc["AlertService (Active & Demo Tiers)"]
        ClimateSvc["ClimateService (ERA5 Analytics & CSV)"]
        ChatEngine["ChatService (Intent Analysis & Grounding)"]
    end

    subgraph Adapters ["External Weather Providers & NWP Adapters"]
        OpenMeteo["Open-Meteo REST API (Live & Historical)"]
        IMDAdapter["IMD Mausam API Adapter (Spec Ready)"]
        WRFAdapter["WRF 3km Mesoscale Adapter (HPC NetCDF)"]
        GFSAdapter["GFS 12km Global Domain Adapter"]
    end

    subgraph AI_Layer ["AI & Natural Language Processing"]
        IntentAnalyzer["Meteorological Intent Parser"]
        ToolExecutor["Domain Tool Dispatcher"]
        GroundedSynthesizer["Factually Grounded Synthesizer"]
        GeminiLLM["Optional Gemini / External LLM API"]
    end

    subgraph Storage ["Persistence Layer"]
        DB[(PostgreSQL / Local SQLite)]
        Tables["Users, Preferences, SavedLocations, ChatSessions, Alerts"]
    end

    UI --> API_GW
    API_GW --> Core_Services
    Core_Services --> Storage
    WeatherSvc --> Adapters
    ClimateSvc --> OpenMeteo
    AlertSvc --> AdvisoryEngine
    ChatRouter --> ChatEngine
    ChatEngine --> IntentAnalyzer
    IntentAnalyzer --> ToolExecutor
    ToolExecutor --> WeatherSvc
    ToolExecutor --> AlertSvc
    ToolExecutor --> ClimateSvc
    ToolExecutor --> GroundedSynthesizer
    GroundedSynthesizer -.-> GeminiLLM
```

---

## 2. Conversational AI Grounding Workflow

```mermaid
sequenceDiagram
    autonumber
    actor User as User / Student
    participant ChatUI as React Chat Interface
    participant FastAPIChat as /api/v1/chat
    participant NLP as Intent Analyzer
    participant ToolExec as Tool Executor
    participant WeatherAPI as Open-Meteo Provider
    participant Advisory as Advisory Engine
    participant RespGen as Grounded Response Synthesizer

    User->>ChatUI: "Should I carry an umbrella today in Chennai?"
    ChatUI->>FastAPIChat: POST /api/v1/chat
    FastAPIChat->>NLP: analyze(message)
    NLP-->>FastAPIChat: intent=UMBRELLA_DECISION, location=Chennai, time=today
    FastAPIChat->>ToolExec: execute(intent, "Chennai")
    ToolExec->>WeatherAPI: get_weather("Chennai")
    WeatherAPI-->>ToolExec: Live observations (precip prob: 75%, rain: 2.4mm)
    ToolExec->>Advisory: evaluate_weather(data)
    Advisory-->>ToolExec: Umbrella caution generated
    ToolExec-->>FastAPIChat: Verified telemetry payload
    FastAPIChat->>RespGen: generate_grounded_response()
    RespGen-->>FastAPIChat: Grounded explanation with confidence note
    FastAPIChat-->>ChatUI: Response JSON with grounded telemetry & follow-ups
    ChatUI-->>User: Displays advice, telemetry badges, and speech option
```

---

## 3. Database Schema Entity-Relationship

```mermaid
erDiagram
    USERS ||--o| USER_PREFERENCES : has
    USERS ||--o{ SAVED_LOCATIONS : saves
    USERS ||--o{ CHAT_SESSIONS : owns
    CHAT_SESSIONS ||--o{ CHAT_MESSAGES : contains

    USERS {
        int id PK
        string email UK
        string username UK
        string hashed_password
        boolean is_active
        datetime created_at
    }

    USER_PREFERENCES {
        int id PK
        int user_id FK
        string temp_unit
        string wind_speed_unit
        string language
        string theme
    }

    SAVED_LOCATIONS {
        int id PK
        int user_id FK
        string name
        float latitude
        float longitude
        string admin1
        string country
    }

    CHAT_SESSIONS {
        int id PK
        int user_id FK
        string title
        datetime created_at
    }

    CHAT_MESSAGES {
        int id PK
        int session_id FK
        string sender
        text content
        string intent
        string location
        string tool_called
        datetime created_at
    }

    WEATHER_ALERTS {
        int id PK
        string event_type
        string severity
        string title
        text description
        text instruction
        string location_name
        boolean is_simulated
    }
```
