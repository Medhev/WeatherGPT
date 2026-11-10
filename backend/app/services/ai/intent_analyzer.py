import re
from typing import Dict, Any, List, Optional, Tuple

COMMON_INDIAN_CITIES = [
    "Chennai", "Bengaluru", "Bangalore", "Delhi", "New Delhi", "Mumbai", "Kolkata",
    "Hyderabad", "Pune", "Ahmedabad", "Jaipur", "Lucknow", "Chandigarh", "Bhopal",
    "Indore", "Patna", "Kochi", "Cochin", "Thiruvananthapuram", "Trivandrum",
    "Coimbatore", "Madurai", "Visakhapatnam", "Vizag", "Nagpur", "Varanasi",
    "Guwahati", "Bhubaneswar", "Puri", "Shimla", "Dehradun", "Srinagar",
    "Amritsar", "Agra", "Kanpur", "Mysuru", "Mangalore", "Trichy", "Salem",
    "Vijayawada", "Guntur", "Ranchi", "Raipur", "Jodhpur", "Udaipur", "Goa"
]

class IntentAnalyzer:
    """
    Robust Natural Language Processing for meteorological user inquiries.
    Extracts intents, locations, dates, and query parameters.
    """

    @staticmethod
    def extract_locations(query: str) -> List[str]:
        found: List[str] = []
        cleaned = re.sub(r'[^\w\s]', ' ', query)
        words = cleaned.split()

        # Check known gazetteer list (case-insensitive)
        for city in COMMON_INDIAN_CITIES:
            pattern = rf"\b{re.escape(city)}\b"
            if re.search(pattern, query, re.IGNORECASE):
                # Normalize city name
                norm = "Bengaluru" if city.lower() in ["bangalore"] else city
                norm = "Kochi" if city.lower() in ["cochin"] else norm
                norm = "Thiruvananthapuram" if city.lower() in ["trivandrum"] else norm
                norm = "Visakhapatnam" if city.lower() in ["vizag"] else norm
                if norm not in found:
                    found.append(norm)

        # Fallback regex for "in <City>", "at <City>", "for <City>"
        if not found:
            match = re.search(r'\b(?:in|at|for|around|near)\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)?)', query)
            if match:
                candidate = match.group(1).strip()
                if candidate.lower() not in ["tomorrow", "today", "yesterday", "morning", "evening", "farmers", "travel"]:
                    found.append(candidate)

        return found

    @staticmethod
    def extract_time_context(query: str) -> str:
        q = query.lower()
        if "tomorrow" in q:
            return "tomorrow"
        if "day after tomorrow" in q:
            return "day_after_tomorrow"
        if "weekend" in q:
            return "weekend"
        if "next week" in q or "7 days" in q or "seven days" in q:
            return "week"
        if "yesterday" in q or "last month" in q or "last year" in q or "past" in q or "history" in q:
            return "historical"
        return "today"

    @classmethod
    def analyze(cls, query: str) -> Dict[str, Any]:
        q = query.lower().strip()
        locations = cls.extract_locations(query)
        time_context = cls.extract_time_context(query)

        intent = "CURRENT_WEATHER"

        q_norm = q.replace("ñ", "n").replace("é", "e").replace("á", "a").replace("í", "i").replace("ó", "o")

        # General greetings, introductions, or educational science Q&A
        is_greeting = any(q == g or q.startswith(g + " ") or q.startswith(g + "!") or q.startswith(g + ",") 
                          for g in ["hi", "hello", "hey", "namaste", "vanakkam", "good morning", "good afternoon", "good evening"])
        is_general_qa = any(k in q for k in ["who are you", "what are you", "what can you do", "help me", "what is weathergpt", "introduce yourself", "how do you work", "who built you", "thank you", "thanks"])
        is_science_qa = any(k in q or k in q_norm for k in ["el nino", "la nina", "atmospheric pressure", "clouds form", "why does it rain", "what is monsoon", "how does a cyclone form", "explain global warming", "what is humidity", "how does radar work", "what is imd"])
        has_weather_target = any(k in q for k in ["weather", "temperature", "rain", "forecast", "climate", "hot", "cold", "humid", "wind", "storm", "umbrella", "degree", "celsius", "fahrenheit"])

        if (is_greeting or is_general_qa or is_science_qa) and not (locations and has_weather_target):
            intent = "GENERAL_CHAT"

        # Compare detection (e.g., "compare Chennai and Bengaluru")
        elif "compare" in q or " vs " in q or " versus " in q or ("difference between" in q and len(locations) >= 2):
            intent = "COMPARE_CITIES"

        # Umbrella inquiry
        elif "umbrella" in q or "carry an umbrella" in q or "need an umbrella" in q or "raincoat" in q:
            intent = "UMBRELLA_DECISION"

        # Agricultural / Farmer advisory
        elif any(k in q for k in ["farmer", "farmers", "farming", "crop", "irrigation", "agriculture", "sowing", "pesticide"]):
            intent = "FARMER_ADVISORY"

        # Travel safety
        elif any(k in q for k in ["travel", "driving", "flight", "commute", "road trip", "highway", "safe to travel", "safe to drive"]):
            intent = "TRAVEL_SAFETY"

        # Alerts / Warnings
        elif any(k in q for k in ["alert", "alerts", "warning", "warnings", "disaster", "cyclone", "evacuation", "emergency"]):
            intent = "ALERTS_WARNINGS"

        # Temperature explanation
        elif any(k in q for k in ["temperature change", "getting hotter", "getting colder", "heat wave", "temp trend", "explain the upcoming temperature"]):
            intent = "TEMP_CHANGES"

        # Historical / Climate
        elif any(k in q for k in ["historical", "climate trend", "past weather", "last year", "average temperature over", "past 30 days"]):
            intent = "HISTORICAL_CLIMATE"

        # Forecast inquiry
        elif time_context in ["tomorrow", "day_after_tomorrow", "weekend", "week"] or any(k in q for k in ["forecast", "will it rain", "chances of rain", "upcoming weather"]):
            intent = "FORECAST"

        return {
            "intent": intent,
            "locations": locations,
            "primary_location": locations[0] if locations else None,
            "secondary_location": locations[1] if len(locations) > 1 else None,
            "time_context": time_context,
            "original_query": query
        }

intent_analyzer = IntentAnalyzer()
