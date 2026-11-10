from typing import List, Dict, Any
from app.schemas.alerts import DisasterAdvisory

class AdvisoryEngine:
    """
    Expert rules engine converting meteorological measurements into practical,
    actionable advisories for farmers, commuters, travelers, and disaster management teams.
    """

    @staticmethod
    def evaluate_weather(weather_dict: Dict[str, Any]) -> List[DisasterAdvisory]:
        advisories: List[DisasterAdvisory] = []
        
        current = weather_dict.get("current", {})
        temp = current.get("temperature", 25.0)
        apparent_temp = current.get("apparent_temperature", temp)
        rain = current.get("rain", 0.0)
        precip_prob = 0
        hourly = weather_dict.get("hourly", [])
        if hourly:
            precip_prob = max([h.get("precipitation_probability", 0) for h in hourly[:12]])
        
        wind_speed = current.get("wind_speed", 0.0)
        w_code = current.get("weather_code", 0)
        uv_index = current.get("uv_index", 5.0) or 5.0

        # 1. Umbrella & Rain Advisory
        if precip_prob >= 60 or rain > 1.0 or w_code in [61, 63, 65, 80, 81, 82, 95]:
            advisories.append(DisasterAdvisory(
                category="Rain & Umbrella",
                level="Warning" if rain > 5.0 else "Caution",
                headline="High Probability of Rain – Umbrella & Waterproofs Highly Recommended",
                advice_points=[
                    f"Precipitation probability is elevated at {precip_prob}% over the next 12 hours.",
                    "Carry a durable umbrella or rain poncho before heading out.",
                    "Keep electronic devices in water-resistant sleeves.",
                    "Expect localized water logging at low-lying crossings."
                ],
                target_demographic="Daily Commuters, Pedestrians & Office Workers",
                relevance_context="Active rain front detected in regional radar/forecast"
            ))
        elif precip_prob >= 30:
            advisories.append(DisasterAdvisory(
                category="Rain & Umbrella",
                level="Normal",
                headline="Moderate Chance of Showers – Keep a Compact Umbrella Handy",
                advice_points=[
                    f"Precipitation probability is around {precip_prob}%.",
                    "Passing light showers or drizzle are possible in certain localities.",
                    "General outdoor plans can proceed with mild contingency."
                ],
                target_demographic="Daily Commuters & Travelers",
                relevance_context="Scattered cloud cover and convective instability"
            ))
        else:
            advisories.append(DisasterAdvisory(
                category="Rain & Umbrella",
                level="Normal",
                headline="Clear Conditions – No Umbrella Needed for Rain",
                advice_points=[
                    "Precipitation probability is very low (< 25%).",
                    "Dry conditions expected throughout the day."
                ],
                target_demographic="General Public",
                relevance_context="Stable atmospheric pressure"
            ))

        # 2. Farming & Agricultural Advisory (IMD Agro-met standard)
        if rain > 5.0 or precip_prob >= 70:
            advisories.append(DisasterAdvisory(
                category="Agriculture & Irrigation",
                level="Warning",
                headline="Suspend Irrigation & Chemical Spraying Due to Impending Rain",
                advice_points=[
                    "Postpone planned field irrigation to prevent water wastage and root rot.",
                    "Delay pesticide and fertilizer application, as surface runoff will wash away chemicals.",
                    "Ensure adequate drainage trenches around standing crop plots to prevent inundation.",
                    "Store harvested produce under elevated waterproof tarpaulins."
                ],
                target_demographic="Farmers, Agricultural Cooperatives, Rural Horticulturists",
                relevance_context="MoES-IMD Integrated Agro-Meteorological Advisory Protocol"
            ))
        elif temp > 36.0 or (apparent_temp > 38.0 and precip_prob < 20):
            advisories.append(DisasterAdvisory(
                category="Agriculture & Irrigation",
                level="Caution",
                headline="High Evapotranspiration – Increase Evening Irrigation",
                advice_points=[
                    "High daytime temperatures will accelerate soil moisture depletion.",
                    "Irrigate fields during evening or early dawn hours to minimize evaporative loss.",
                    "Apply organic straw mulch around crop roots to conserve bed moisture.",
                    "Provide shade and adequate fresh water for livestock."
                ],
                target_demographic="Farmers & Livestock Handlers",
                relevance_context="Soil moisture balance and heat stress index"
            ))
        else:
            advisories.append(DisasterAdvisory(
                category="Agriculture & Irrigation",
                level="Normal",
                headline="Favorable Agricultural Windows for Normal Operations",
                advice_points=[
                    "Weather parameters are suitable for routine tillage, sowing, and harvesting.",
                    "Maintain standard crop inspection for minor seasonal pests.",
                    "Soil moisture retention remains within typical seasonal bounds."
                ],
                target_demographic="Farmers & Field Workers",
                relevance_context="Standard agro-climatic conditions"
            ))

        # 3. Heatwave & Thermal Comfort Advisory
        if temp >= 40.0 or apparent_temp >= 42.0:
            advisories.append(DisasterAdvisory(
                category="Heat Safety & Exposure",
                level="Emergency" if temp >= 43 else "Warning",
                headline=f"Severe Heat Warning – Feels-like Index {apparent_temp:.1f}°C",
                advice_points=[
                    "Avoid direct sun exposure during peak thermal window (12:00 PM – 4:00 PM).",
                    "Hydrate frequently with water, ORS, lemon water, or traditional electrolyte drinks.",
                    "Wear lightweight, loose-fitting, light-colored cotton clothing.",
                    "Never leave children, elderly individuals, or pets inside parked vehicles.",
                    "Recognize early symptoms of heat stroke: dizziness, nausea, rapid pulse."
                ],
                target_demographic="Outdoor Workers, Elderly Citizens, Athletes, Children",
                relevance_context="IMD Heatwave Action Protocol (Yellow/Orange Tier)"
            ))
        elif temp >= 35.0:
            advisories.append(DisasterAdvisory(
                category="Heat Safety & Exposure",
                level="Caution",
                headline="Warm to Hot Conditions – Regular Hydration Required",
                advice_points=[
                    f"Temperature is {temp:.1f}°C with noticeable solar radiation.",
                    "Carry drinking water when traveling outdoors.",
                    "Use sunglasses and sunscreen (UV index around {uv_index:.1f})."
                ],
                target_demographic="General Public & Commuters",
                relevance_context="Moderate heat index"
            ))

        # 4. Travel & Highway Safety Advisory
        if wind_speed > 45.0 or w_code in [95, 96, 99]:
            advisories.append(DisasterAdvisory(
                category="Travel & Commute",
                level="Emergency",
                headline="Thunderstorm / High Wind Alert – Exercise Extreme Caution on Highways",
                advice_points=[
                    f"Strong wind gusts up to {wind_speed} km/h and thunderstorm activity detected.",
                    "Avoid parking vehicles under large trees, loose advertising banners, or old poles.",
                    "Reduce vehicle speeds on highways; maintain greater braking distance on wet asphalt.",
                    "Two-wheeler riders should seek sturdy shelter during high crosswinds."
                ],
                target_demographic="Highway Motorists, Bus Operators, Two-Wheeler Riders",
                relevance_context="IMD Severe Convective Storm Warning"
            ))
        elif rain > 10.0:
            advisories.append(DisasterAdvisory(
                category="Travel & Commute",
                level="Warning",
                headline="Waterlogging & Reduced Visibility on Roads",
                advice_points=[
                    "Heavy rain bursts may obscure road lane markings and reduce headlight distance.",
                    "Drive with low-beam headlights on and double the safe following distance.",
                    "Verify city traffic / municipal pump advisories for underpass flooding."
                ],
                target_demographic="City Drivers & Transit Users",
                relevance_context="Precipitation rate threshold"
            ))
        else:
            advisories.append(DisasterAdvisory(
                category="Travel & Commute",
                level="Normal",
                headline="Normal Road and Travel Conditions",
                advice_points=[
                    "Good visibility and stable wind speeds across transportation routes.",
                    "Standard travel schedules can proceed without weather-related delays."
                ],
                target_demographic="All Travelers",
                relevance_context="Clear transit conditions"
            ))

        # 5. Flood / Low-lying Area Preparedness
        if rain >= 20.0 or w_code in [65, 82, 99]:
            advisories.append(DisasterAdvisory(
                category="Flood & Heavy Rain Preparedness",
                level="Warning",
                headline="High Runoff Warning – Monitor Low-Lying Drainage Channels",
                advice_points=[
                    "Significant accumulated rainfall increases surface runoff rapidly.",
                    "Residents in low-lying riparian zones should keep emergency kits ready.",
                    "Avoid stepping into open storm-water drains or submerged power cables.",
                    "Follow district disaster management (DDMA) emergency broadcast channels."
                ],
                target_demographic="Residents in Flood-Prone & Low-Lying Areas",
                relevance_context="Disaster Management Authority Warning Framework"
            ))

        return advisories

advisory_engine = AdvisoryEngine()
