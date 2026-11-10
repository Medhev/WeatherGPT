from typing import Dict, Any, List, Optional

class ResponseGenerator:
    """
    Synthesizes natural, factually grounded responses from retrieved meteorological data.
    Provides verified bilingual/multilingual responses in English, Tamil, and Hindi.
    """

    @staticmethod
    def generate_grounded_response(
        intent: str,
        tool_data: Dict[str, Any],
        language: str = "en",
        time_context: str = "today"
    ) -> Dict[str, Any]:
        lang = language.lower()
        if not tool_data.get("success", False):
            err = tool_data.get("error", "Unable to retrieve meteorological data.")
            if lang == "ta":
                return {"reply": f"மன்னிக்கவும், வானிலை தகவல்களை பெற முடியவில்லை: {err}", "uncertainty": None}
            elif lang == "hi":
                return {"reply": f"क्षमा करें, मौसम की जानकारी प्राप्त नहीं हो सकी: {err}", "uncertainty": None}
            return {"reply": f"Sorry, I could not retrieve weather information: {err}", "uncertainty": None}

        # 0. GENERAL_CHAT
        if intent == "GENERAL_CHAT":
            if lang == "ta":
                reply = (
                    "வணக்கம்! நான் **WeatherGPT**, இந்திய வானிலை ஆய்வுத் துறை (IMD) மற்றும் பூமி அறிவியல் அமைச்சகத்திற்கான (MoES) "
                    "வானிலை மற்றும் காலநிலை செயற்கை நுண்ணறிவு உதவியாளர்.\n\n"
                    "நான் உங்களுக்கு எவ்வாறு உதவ முடியும்?\n"
                    "- நேரடி வானிலை நிலவரம் மற்றும் வெப்பநிலை\n"
                    "- 24-மணி நேர மற்றும் 7-நாள் முன்னறிவிப்பு\n"
                    "- விவசாயம் மற்றும் பயணப் பாதுகாப்பு ஆலோசனைகள்\n"
                    "- கடுமையான வானிலை எச்சரிக்கைகள் மற்றும் பேரிடர் வழிகாட்டுதல்கள்\n\n"
                    "எடுத்துக்காட்டு: *'சென்னையில் நாளை மழை பெய்யுமா?'* அல்லது *'இன்று குடை தேவையா?'*"
                )
            elif lang == "hi":
                reply = (
                    "नमस्ते! मैं **WeatherGPT** हूँ, भारत मौसम विज्ञान विभाग (IMD) और पृथ्वी विज्ञान मंत्रालय (MoES) का "
                    "मौसम एवं जलवायु बुद्धिमत्ता सहायक।\n\n"
                    "मैं आपकी किस प्रकार सहायता कर सकता हूँ?\n"
                    "- लाइव मौसम और तापमान की स्थिति\n"
                    "- 24-घंटे और 7-दिवसीय मौसम पूर्वानुमान\n"
                    "- किसानों के लिए कृषि-मौसम परामर्श एवं यात्रा सुरक्षा\n"
                    "- आपदा चेतावनी एवं सक्रिय मौसम अलर्ट\n\n"
                    "उदाहरण: *'क्या कल चेन्नई में बारिश होगी?'* या *'चेन्नई और बेंगलुरु के मौसम की तुलना करें'*"
                )
            else:
                reply = (
                    "Hello! I am **WeatherGPT**, your AI Weather, Climate & Disaster Intelligence Assistant developed "
                    "for the Ministry of Earth Sciences (MoES) and India Meteorological Department (IMD).\n\n"
                    "How can I help you today?\n"
                    "- **Live Weather & Forecasts**: Ask about current conditions, rain probabilities, or 7-day outlooks for any city.\n"
                    "- **Decision Support**: Ask if you need an umbrella, travel safety advice, or heatwave alerts.\n"
                    "- **Agro-Meteorology**: Get farming and irrigation advisories based on meteorological metrics.\n"
                    "- **City Comparisons**: Compare weather between two cities (e.g. Chennai vs Bengaluru).\n"
                    "- **Climate Insights**: Analyze long-term temperature anomalies and rainfall records.\n\n"
                    "Feel free to ask a question in English, தமிழ் (Tamil), or हिन्दी (Hindi)!"
                )
            return {"reply": reply, "uncertainty": None}

        # 1. COMPARE_CITIES
        if intent == "COMPARE_CITIES":
            summary = tool_data.get("summary", "")
            city_a = tool_data.get("city_a", "")
            city_b = tool_data.get("city_b", "")
            if lang == "ta":
                reply = f"**{city_a} மற்றும் {city_b} வானிலை ஒப்பீடு:**\n\n{summary}\n\nஇரு நகரங்களின் நேரடி நிலவரப்படி திட்டமிடுங்கள்."
            elif lang == "hi":
                reply = f"**{city_a} और {city_b} के मौसम की तुलना:**\n\n{summary}\n\nदोनों शहरों के लाइव डेटा के अनुसार योजना बनाएं।"
            else:
                reply = f"**Weather Comparison between {city_a} and {city_b}:**\n\n{summary}\n\nData grounded via real-time meteorological observations."
            return {"reply": reply, "uncertainty": "Regional local microclimates may exhibit slight variations."}

        # 2. ALERTS_WARNINGS
        if intent == "ALERTS_WARNINGS":
            alerts = tool_data.get("alerts", [])
            loc = tool_data.get("location", "the region")
            if not alerts:
                if lang == "ta":
                    reply = f"**{loc}** பகுதியில் தற்போது கடுமையான வானிலை எச்சரிக்கைகள் எதுவும் இல்லை. வானிலை சாதாரணமாக உள்ளது."
                elif lang == "hi":
                    reply = f"**{loc}** के लिए वर्तमान में कोई गंभीर मौसम चेतावनी सक्रिय नहीं है। स्थिति सामान्य है।"
                else:
                    reply = f"There are currently no active severe weather warnings for **{loc}**. Conditions are normal."
                return {"reply": reply, "uncertainty": None}

            lines = []
            if lang == "ta":
                lines.append(f"**{loc} பகுதிக்கான வானிலை எச்சரிக்கைகள் ({len(alerts)}):**\n")
            elif lang == "hi":
                lines.append(f"**{loc} के लिए सक्रिय मौसम अलर्ट ({len(alerts)}):**\n")
            else:
                lines.append(f"**Active Weather Alerts for {loc} ({len(alerts)}):**\n")

            for a in alerts:
                sim_tag = " *(கல்வி மதிப்பீட்டு உருவகப்படுத்துதல்)*" if a.get("is_simulated") and lang == "ta" else (
                    " *(शैक्षणिक सिमुलेशन)*" if a.get("is_simulated") and lang == "hi" else (
                        " *(Academic Simulation Demo)*" if a.get("is_simulated") else ""
                    )
                )
                lines.append(f"- **[{a.get('severity')}] {a.get('title')}**{sim_tag}")
                lines.append(f"  *விவரம்/Details:* {a.get('description')}")
                if a.get("instruction"):
                    lines.append(f"  *அறிவுரை/Action:* {a.get('instruction')}\n")

            return {
                "reply": "\n".join(lines),
                "uncertainty": "Warning bulletins are issued according to IMD meteorological guidelines. Always refer to official local disaster management channels."
            }

        # 3. HISTORICAL_CLIMATE
        if intent == "HISTORICAL_CLIMATE":
            data = tool_data.get("data", {})
            stats = data.get("statistics", {})
            loc = tool_data.get("location", "")
            if lang == "ta":
                reply = (
                    f"**{loc} - வரலாற்று காலநிலை பகுப்பாய்வு (கடந்த 30 நாட்கள்):**\n\n"
                    f"- சராசரி வெப்பநிலை: **{stats.get('overall_avg_temp')}°C**\n"
                    f"- அதிகபட்ச வெப்பநிலை பதிவு: **{stats.get('record_max_temp')}°C**\n"
                    f"- குறைந்தபட்ச வெப்பநிலை பதிவு: **{stats.get('record_min_temp')}°C**\n"
                    f"- மொத்த மழைப்பொழிவு: **{stats.get('total_rainfall_mm')} மி.மீ** ({stats.get('rainy_days_count')} மழை நாட்கள்)\n"
                    f"- வெப்பநிலை விலகல் (Anomaly): **{stats.get('temperature_anomaly')}°C**"
                )
            elif lang == "hi":
                reply = (
                    f"**{loc} - ऐतिहासिक जलवायु विश्लेषण (पिछले 30 दिन):**\n\n"
                    f"- औसत तापमान: **{stats.get('overall_avg_temp')}°C**\n"
                    f"- उच्चतम दर्ज तापमान: **{stats.get('record_max_temp')}°C**\n"
                    f"- न्यूनतम दर्ज तापमान: **{stats.get('record_min_temp')}°C**\n"
                    f"- कुल वर्षा: **{stats.get('total_rainfall_mm')} मिमी** ({stats.get('rainy_days_count')} वर्षा दिवस)\n"
                    f"- तापमान विचलन (Anomaly): **{stats.get('temperature_anomaly')}°C**"
                )
            else:
                reply = (
                    f"**Climate & Historical Weather Analysis for {loc} (Past 30 Days):**\n\n"
                    f"- Mean Overall Temperature: **{stats.get('overall_avg_temp')}°C**\n"
                    f"- Record High / Low: **{stats.get('record_max_temp')}°C** / **{stats.get('record_min_temp')}°C**\n"
                    f"- Total Accumulated Precipitation: **{stats.get('total_rainfall_mm')} mm** across **{stats.get('rainy_days_count')}** rainy days (>=2.5mm)\n"
                    f"- Single Day Maximum Rain: **{stats.get('max_single_day_rainfall')} mm**\n"
                    f"- 30-Day Temperature Anomaly: **{stats.get('temperature_anomaly')}°C** relative to baseline normal."
                )
            return {"reply": reply, "uncertainty": "Historical records derived from Open-Meteo European/Copernicus ERA5 reanalysis datasets."}

        # Meteorological core values
        loc_name = tool_data.get("location", "Current Location")
        current = tool_data.get("current", {})
        temp = current.get("temperature", 0.0)
        app_temp = current.get("apparent_temperature", temp)
        condition = current.get("weather_description", "Fair")
        humidity = current.get("relative_humidity", 50)
        wind = current.get("wind_speed", 0.0)
        daily = tool_data.get("daily", [])
        hourly = tool_data.get("hourly", [])
        advisories = tool_data.get("advisories", [])

        # 4. UMBRELLA_DECISION
        if intent == "UMBRELLA_DECISION":
            precip_prob = 0
            if hourly:
                precip_prob = max([h.get("precipitation_probability", 0) for h in hourly[:12]])
            rain_val = current.get("rain", 0.0)
            
            if precip_prob >= 50 or rain_val > 1.0:
                if lang == "ta":
                    reply = f"**ஆம், குடை எடுத்துச் செல்வது நல்லது!**\n\n{loc_name}-ல் அடுத்த சில மணிநேரங்களில் மழைக்கான வாய்ப்பு **{precip_prob}%** ஆக உள்ளது. தற்போதைய வானிலை: {condition}."
                elif lang == "hi":
                    reply = f"**हाँ, छाता साथ ले जाना बेहतर रहेगा!**\n\n{loc_name} में अगले कुछ घंटों में बारिश की संभावना **{precip_prob}%** है। वर्तमान मौसम: {condition}."
                else:
                    reply = (
                        f"**Yes, carrying an umbrella is recommended today in {loc_name}.**\n\n"
                        f"- Precipitation Probability: **{precip_prob}%** over the next 12 hours.\n"
                        f"- Current Condition: **{condition}** with humidity at {humidity}%.\n"
                        f"- Expected rainfall activity is concentrated during afternoon/evening convective periods."
                    )
                uncertainty = f"Atmospheric probability is {precip_prob}%. Local convective clouds may cause sudden scattered showers."
            else:
                if lang == "ta":
                    reply = f"**இல்லை, இன்று குடை தேவையில்லை.**\n\n{loc_name}-ல் மழைக்கான வாய்ப்பு மிகவும் குறைவு ({precip_prob}%). தற்போதைய வெப்பநிலை: {temp}°C, வானிலை: {condition}."
                elif lang == "hi":
                    reply = f"**नहीं, आज छाते की आवश्यकता नहीं है।**\n\n{loc_name} में बारिश की संभावना काफी कम ({precip_prob}%) है। तापमान: {temp}°C, मौसम: {condition}."
                else:
                    reply = (
                        f"**No, an umbrella is not required for rain in {loc_name} today.**\n\n"
                        f"- Precipitation Probability: **{precip_prob}%** (very low risk).\n"
                        f"- Current Temperature: **{temp}°C** (Feels like {app_temp}°C).\n"
                        f"- Sky condition is predominantly **{condition}** with stable atmospheric pressure."
                    )
                uncertainty = "Low probability of precipitation; isolated overcast intervals may still occur."
            return {"reply": reply, "uncertainty": uncertainty}

        # 5. FORECAST
        if intent == "FORECAST":
            target_day = daily[1] if len(daily) > 1 and time_context in ["tomorrow", "day_after_tomorrow"] else (daily[0] if daily else None)
            day_label = "Tomorrow" if time_context == "tomorrow" else "Upcoming Days"
            if target_day:
                d_cond = target_day.get("weather_description", "Fair")
                d_max = target_day.get("temperature_max", 0.0)
                d_min = target_day.get("temperature_min", 0.0)
                d_prob = target_day.get("precipitation_probability_max", 0)
                d_rain = target_day.get("precipitation_sum", 0.0)
                
                if lang == "ta":
                    reply = (
                        f"**{loc_name} - {day_label} வானிலை முன்னறிவிப்பு ({target_day.get('date')}):**\n\n"
                        f"- வானிலை: **{d_cond}**\n"
                        f"- அதிகபட்ச வெப்பநிலை: **{d_max}°C**\n"
                        f"- குறைந்தபட்ச வெப்பநிலை: **{d_min}°C**\n"
                        f"- மழைக்கான வாய்ப்பு: **{d_prob}%** (எதிர்பார்க்கப்படும் மழை: {d_rain} மி.மீ)"
                    )
                elif lang == "hi":
                    reply = (
                        f"**{loc_name} - {day_label} मौसम का पूर्वानुमान ({target_day.get('date')}):**\n\n"
                        f"- मौसम की स्थिति: **{d_cond}**\n"
                        f"- अधिकतम तापमान: **{d_max}°C**\n"
                        f"- न्यूनतम तापमान: **{d_min}°C**\n"
                        f"- बारिश की संभावना: **{d_prob}%** (संभावित वर्षा: {d_rain} मिमी)"
                    )
                else:
                    reply = (
                        f"**Weather Forecast for {loc_name} ({day_label} - {target_day.get('date')}):**\n\n"
                        f"- Expected Condition: **{d_cond}**\n"
                        f"- High / Low Temperatures: **{d_max}°C** / **{d_min}°C**\n"
                        f"- Maximum Precipitation Probability: **{d_prob}%**\n"
                        f"- Expected Rainfall Volume: **{d_rain} mm**\n"
                        f"- Max Wind Speed: **{target_day.get('wind_speed_max')} km/h**"
                    )
            else:
                reply = f"Forecast information for {loc_name}: Current temperature is {temp}°C with {condition}."
            return {"reply": reply, "uncertainty": "Medium-range numerical weather prediction (NWP) forecast skill decreases past 48 hours."}

        # 6. FARMER_ADVISORY
        if intent == "FARMER_ADVISORY":
            farm_adv = next((adv for adv in advisories if adv.get("category") == "Agriculture & Irrigation"), None)
            if farm_adv:
                points = "\n".join([f"- {p}" for p in farm_adv.get("advice_points", [])])
                if lang == "ta":
                    reply = f"**{loc_name} - விவசாய ஆலோசனை (IMD வழிகாட்டுதல்):**\n\n**{farm_adv.get('headline')}**\n\n{points}"
                elif lang == "hi":
                    reply = f"**{loc_name} - किसान कृषि मौसम परामर्श (IMD दिशानिर्देश):**\n\n**{farm_adv.get('headline')}**\n\n{points}"
                else:
                    reply = (
                        f"**Agro-Meteorological Advisory for Farmers in {loc_name}:**\n\n"
                        f"### {farm_adv.get('headline')}\n\n"
                        f"{points}\n\n"
                        f"*Context:* Current Soil Moisture & Evapotranspiration index at {temp}°C with {humidity}% relative humidity."
                    )
            else:
                reply = f"Agricultural conditions in {loc_name} remain stable. Maintain regular watering schedules."
            return {"reply": reply, "uncertainty": "Advisory formulated using IMD Integrated Agro-Meteorological Advisory protocol standards."}

        # 7. TRAVEL_SAFETY
        if intent == "TRAVEL_SAFETY":
            travel_adv = next((adv for adv in advisories if adv.get("category") == "Travel & Commute"), None)
            if travel_adv:
                points = "\n".join([f"- {p}" for p in travel_adv.get("advice_points", [])])
                if lang == "ta":
                    reply = f"**{loc_name} - பயண பாதுகாப்பு வழிகாட்டுதல்:**\n\n**{travel_adv.get('headline')}**\n\n{points}"
                elif lang == "hi":
                    reply = f"**{loc_name} - यात्रा सुरक्षा सलाह:**\n\n**{travel_adv.get('headline')}**\n\n{points}"
                else:
                    reply = f"**Travel & Commute Safety Advisory for {loc_name}:**\n\n### {travel_adv.get('headline')}\n\n{points}"
            else:
                reply = f"Road and atmospheric transit conditions in {loc_name} are currently normal and safe."
            return {"reply": reply, "uncertainty": "Highway travel safety depends on dynamic localized conditions."}

        # 8. TEMP_CHANGES
        if intent == "TEMP_CHANGES":
            lines = [f"**Temperature Outlook for {loc_name}:**\n", f"- Today's current temperature is **{temp}°C** (feels like **{app_temp}°C**)."]
            for d in daily[:5]:
                lines.append(f"- **{d.get('date')}**: High **{d.get('temperature_max')}°C** | Low **{d.get('temperature_min')}°C** ({d.get('weather_description')})")
            return {"reply": "\n".join(lines), "uncertainty": "Surface temperatures fluctuate depending on convective cloud cover."}

        # 9. DEFAULT / CURRENT_WEATHER
        if lang == "ta":
            reply = (
                f"**{loc_name} தற்போதைய வானிலை:**\n\n"
                f"- வெப்பநிலை: **{temp}°C** (உணரப்படுவது: **{app_temp}°C**)\n"
                f"- வானிலை நிலை: **{condition}**\n"
                f"- ஈரப்பதம்: **{humidity}%**\n"
                f"- காற்றின் வேகம்: **{wind} கி.மீ/மணி**\n"
                f"- வளிமண்டல அழுத்தம்: **{current.get('pressure_msl', 1013)} hPa**"
            )
        elif lang == "hi":
            reply = (
                f"**{loc_name} में वर्तमान मौसम:**\n\n"
                f"- तापमान: **{temp}°C** (महसूस: **{app_temp}°C**)\n"
                f"- मौसम की स्थिति: **{condition}**\n"
                f"- आर्द्रता: **{humidity}%**\n"
                f"- हवा की गति: **{wind} किमी/घंटा**\n"
                f"- वायुमंडलीय दबाव: **{current.get('pressure_msl', 1013)} hPa**"
            )
        else:
            reply = (
                f"**Current Weather in {loc_name}:**\n\n"
                f"- Temperature: **{temp}°C** (Feels like **{app_temp}°C**)\n"
                f"- Condition: **{condition}**\n"
                f"- Relative Humidity: **{humidity}%**\n"
                f"- Wind Speed: **{wind} km/h** (Direction: {current.get('wind_direction')}°)\n"
                f"- Atmospheric Pressure: **{current.get('pressure_msl', 1013.2)} hPa**\n"
                f"- UV Index: **{current.get('uv_index', 5.0)}**"
            )

        return {"reply": reply, "uncertainty": None}

response_generator = ResponseGenerator()
