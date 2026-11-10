export type Language = 'en' | 'ta' | 'hi';

export interface TranslationDictionary {
  appName: string;
  tagline: string;
  nav: {
    dashboard: string;
    chat: string;
    forecast: string;
    alerts: string;
    climate: string;
    map: string;
    savedLocations: string;
    settings: string;
    nwpStatus: string;
    login: string;
    register: string;
    logout: string;
  };
  dashboard: {
    currentWeather: string;
    feelsLike: string;
    humidity: string;
    windSpeed: string;
    pressure: string;
    visibility: string;
    uvIndex: string;
    sunrise: string;
    sunset: string;
    hourlyForecast: string;
    sevenDayForecast: string;
    weatherHighlights: string;
    activeAlertsBanner: string;
    searchPlaceholder: string;
    useMyLocation: string;
    advisoryOverview: string;
  };
  chat: {
    welcomeTitle: string;
    welcomeSubtitle: string;
    placeholder: string;
    send: string;
    listening: string;
    speak: string;
    stopSpeaking: string;
    groundedContext: string;
    suggestedQueries: string;
    uncertaintyNotice: string;
  };
  alerts: {
    title: string;
    subtitle: string;
    filterAll: string;
    filterMinor: string;
    filterModerate: string;
    filterSevere: string;
    filterExtreme: string;
    simulatedTag: string;
    instructions: string;
    noAlerts: string;
  };
  climate: {
    title: string;
    subtitle: string;
    startDate: string;
    endDate: string;
    exportCsv: string;
    temperatureTrends: string;
    rainfallTrends: string;
    meanTemp: string;
    recordMax: string;
    recordMin: string;
    totalRainfall: string;
    rainyDays: string;
  };
  map: {
    title: string;
    subtitle: string;
    selectCity: string;
    compareCities: string;
  };
  settings: {
    title: string;
    temperatureUnit: string;
    celsius: string;
    fahrenheit: string;
    windSpeedUnit: string;
    language: string;
    theme: string;
    dark: string;
    light: string;
    savePreferences: string;
    savedSuccess: string;
  };
}

export const translations: Record<Language, TranslationDictionary> = {
  en: {
    appName: "WeatherGPT",
    tagline: "Ministry of Earth Sciences / IMD Climate Intelligence Platform",
    nav: {
      dashboard: "Dashboard",
      chat: "AI Weather Chat",
      forecast: "Forecast",
      alerts: "Weather Alerts",
      climate: "Climate Insights",
      map: "Weather Map",
      savedLocations: "Saved Locations",
      settings: "Settings",
      nwpStatus: "NWP & IMD Models",
      login: "Sign In",
      register: "Register",
      logout: "Sign Out",
    },
    dashboard: {
      currentWeather: "Current Weather",
      feelsLike: "Feels Like",
      humidity: "Humidity",
      windSpeed: "Wind Speed",
      pressure: "Atmospheric Pressure",
      visibility: "Visibility",
      uvIndex: "UV Index",
      sunrise: "Sunrise",
      sunset: "Sunset",
      hourlyForecast: "24-Hour Hourly Forecast",
      sevenDayForecast: "7-Day Outlook",
      weatherHighlights: "Today's Meteorological Highlights",
      activeAlertsBanner: "Active Disaster Alerts Detected",
      searchPlaceholder: "Search city (e.g., Chennai, Delhi, Mumbai, Bengaluru)...",
      useMyLocation: "Detect My Location",
      advisoryOverview: "Location-Based Safety & Agro Advisories",
    },
    chat: {
      welcomeTitle: "WeatherGPT Intelligence Assistant",
      welcomeSubtitle: "Ask anything about real-time weather, 7-day forecasts, disaster advisories, farming guidance, or city comparisons.",
      placeholder: "e.g., Will it rain in Chennai tomorrow? Should I carry an umbrella? Compare Chennai and Bengaluru...",
      send: "Send",
      listening: "Listening... speak now",
      speak: "Voice Input",
      stopSpeaking: "Stop Speech",
      groundedContext: "Grounded Meteorological Evidence",
      suggestedQueries: "Suggested Inquiries",
      uncertaintyNotice: "Meteorological Confidence Note",
    },
    alerts: {
      title: "Weather Alerts & Disaster Warnings",
      subtitle: "Monitoring severe meteorological phenomena in alignment with IMD early warning protocol.",
      filterAll: "All Alerts",
      filterMinor: "Minor",
      filterModerate: "Moderate (Yellow)",
      filterSevere: "Severe (Orange)",
      filterExtreme: "Extreme (Red)",
      simulatedTag: "Academic Simulation Demo",
      instructions: "Recommended Precautionary Action",
      noAlerts: "No active severe alerts detected for this selection.",
    },
    climate: {
      title: "Historical Weather & Climate Analysis",
      subtitle: "Explore long-term meteorological trends, rainfall accumulation, and thermal anomalies.",
      startDate: "Start Date",
      endDate: "End Date",
      exportCsv: "Download CSV Report",
      temperatureTrends: "Temperature Trends (°C)",
      rainfallTrends: "Daily Precipitation (mm)",
      meanTemp: "Average Temperature",
      recordMax: "Record High",
      recordMin: "Record Low",
      totalRainfall: "Total Rainfall",
      rainyDays: "Rainy Days (≥2.5mm)",
    },
    map: {
      title: "Interactive Weather Map",
      subtitle: "OpenStreetMap meteorological overview of key Indian metropolitan centers and synoptic stations.",
      selectCity: "Select City Marker",
      compareCities: "Compare Multiple Cities",
    },
    settings: {
      title: "Application & Unit Settings",
      temperatureUnit: "Temperature Unit",
      celsius: "Celsius (°C)",
      fahrenheit: "Fahrenheit (°F)",
      windSpeedUnit: "Wind Speed Unit",
      language: "Interface Language",
      theme: "Display Theme",
      dark: "Dark Mode",
      light: "Light Mode",
      savePreferences: "Save Preferences",
      savedSuccess: "Settings saved successfully!",
    },
  },

  ta: {
    appName: "WeatherGPT",
    tagline: "பூமி அறிவியல் அமைச்சகம் (MoES) / இந்திய வானிலை ஆய்வுத் துறை (IMD)",
    nav: {
      dashboard: "முகப்பு",
      chat: "வானிலை AI அரட்டை",
      forecast: "முன்னறிவிப்பு",
      alerts: "எச்சரிக்கைகள்",
      climate: "காலநிலை பகுப்பாய்வு",
      map: "வானிலை வரைபடம்",
      savedLocations: "சேமிக்கப்பட்ட இடங்கள்",
      settings: "அமைப்புகள்",
      nwpStatus: "NWP மாதிரி நிலை",
      login: "உள்நுழை",
      register: "பதிவு செய்",
      logout: "வெளியேறு",
    },
    dashboard: {
      currentWeather: "தற்போதைய வானிலை",
      feelsLike: "உணரப்படுவது",
      humidity: "காற்றின் ஈரப்பதம்",
      windSpeed: "காற்றின் வேகம்",
      pressure: "வளிமண்டல அழுத்தம்",
      visibility: "பார்வைத்திறன்",
      uvIndex: "புற ஊதா குறியீடு (UV)",
      sunrise: "சூரிய உதயம்",
      sunset: "சூரிய அஸ்தமனம்",
      hourlyForecast: "24-மணி நேர முன்னறிவிப்பு",
      sevenDayForecast: "7-நாள் வானிலை கண்ணோட்டம்",
      weatherHighlights: "இன்றைய முக்கிய வானிலை அளவீடுகள்",
      activeAlertsBanner: "வானிலை பேரிடர் எச்சரிக்கைகள் உள்ளன",
      searchPlaceholder: "நகரத்தைத் தேடுங்கள் (எ.கா: சென்னை, மதுரை, கோவை)...",
      useMyLocation: "எனது இருப்பிடத்தைக் கண்டறி",
      advisoryOverview: "விவசாயம் மற்றும் அன்றாட பாதுகாப்பு ஆலோசனைகள்",
    },
    chat: {
      welcomeTitle: "WeatherGPT AI வானிலை உதவியாளர்",
      welcomeSubtitle: "நேரடி வானிலை, 7-நாள் முன்னறிவிப்பு, விவசாய ஆலோசனைகள் மற்றும் நகர ஒப்பீடுகள் குறித்து கேளுங்கள்.",
      placeholder: "எ.கா: சென்னையில் நாளை மழை பெய்யுமா? குடை எடுத்துச் செல்ல வேண்டுமா?...",
      send: "அனுப்பு",
      listening: "கேட்கிறது... பேசுங்கள்",
      speak: "குரல் உள்ளீடு",
      stopSpeaking: "நிறுத்து",
      groundedContext: "சரிபார்க்கப்பட்ட வானிலை தரவு ஆதாரம்",
      suggestedQueries: "பரிந்துரைக்கப்பட்ட கேள்விகள்",
      uncertaintyNotice: "வானிலை முன்னறிவிப்பு குறிப்பு",
    },
    alerts: {
      title: "வானிலை எச்சரிக்கைகள் & பேரிடர் மேலாண்மை",
      subtitle: "IMD முன்னெச்சரிக்கை வழிகாட்டுதல்களின்படி கடுமையான வானிலை நிலவரங்கள்.",
      filterAll: "அனைத்து எச்சரிக்கைகள்",
      filterMinor: "குறைவானது",
      filterModerate: "மஞ்சள் எச்சரிக்கை",
      filterSevere: "ஆரஞ்சு எச்சரிக்கை",
      filterExtreme: "சிவப்பு எச்சரிக்கை",
      simulatedTag: "கல்வி உருவகப்படுத்துதல்",
      instructions: "பரிந்துரைக்கப்பட்ட முன்னெச்சரிக்கை நடவடிக்கை",
      noAlerts: "தற்போது கடுமையான எச்சரிக்கைகள் எதுவும் இல்லை.",
    },
    climate: {
      title: "வரலாற்று வானிலை & காலநிலை பகுப்பாய்வு",
      subtitle: "நீண்ட கால வானிலை போக்குகள், மழைப்பொழிவு மற்றும் வெப்பநிலை மாற்றங்களை ஆராயுங்கள்.",
      startDate: "தொடக்க தேதி",
      endDate: "முடிவு தேதி",
      exportCsv: "CSV அறிக்கையைப் பதிவிறக்கு",
      temperatureTrends: "வெப்பநிலை போக்குகள் (°C)",
      rainfallTrends: "தினசரி மழைப்பொழிவு (மி.மீ)",
      meanTemp: "சராசரி வெப்பநிலை",
      recordMax: "அதிகபட்ச பதிவு",
      recordMin: "குறைந்தபட்ச பதிவு",
      totalRainfall: "மொத்த மழைப்பொழிவு",
      rainyDays: "மழை நாட்கள் (≥2.5மி.மீ)",
    },
    map: {
      title: "நேரடி வானிலை வரைபடம்",
      subtitle: "முக்கிய இந்திய நகரங்களின் நேரடி வானிலை அளவீடுகளின் வரைபடக் காட்சி.",
      selectCity: "நகரத்தை தேர்வு செய்யவும்",
      compareCities: "நகரங்களை ஒப்பிடுங்கள்",
    },
    settings: {
      title: "பயன்பாட்டு அமைப்புகள்",
      temperatureUnit: "வெப்பநிலை அலகு",
      celsius: "செல்சியஸ் (°C)",
      fahrenheit: "பாரன்ஹீட் (°F)",
      windSpeedUnit: "காற்றின் வேக அலகு",
      language: "மொழி",
      theme: "வண்ண தீம்",
      dark: "இருண்ட பயன்முறை (Dark)",
      light: "ஒளிரும் பயன்முறை (Light)",
      savePreferences: "அமைப்புகளைச் சேமிக்கவும்",
      savedSuccess: "அமைப்புகள் வெற்றிகரமாகச் சேமிக்கப்பட்டன!",
    },
  },

  hi: {
    appName: "WeatherGPT",
    tagline: "पृथ्वी विज्ञान मंत्रालय (MoES) / भारत मौसम विज्ञान विभाग (IMD)",
    nav: {
      dashboard: "डैशबोर्ड",
      chat: "AI मौसम चैट",
      forecast: "पूर्वानुमान",
      alerts: "मौसम अलर्ट",
      climate: "जलवायु अंतर्दृष्टि",
      map: "मौसम मानचित्र",
      savedLocations: "सहेजे गए स्थान",
      settings: "सेटिंग्स",
      nwpStatus: "NWP मॉडल स्थिति",
      login: "लॉग इन",
      register: "पंजीकरण",
      logout: "लॉग आउट",
    },
    dashboard: {
      currentWeather: "वर्तमान मौसम",
      feelsLike: "महसूस तापमान",
      humidity: "आर्द्रता",
      windSpeed: "हवा की गति",
      pressure: "वायुमंडलीय दबाव",
      visibility: "दृश्यता",
      uvIndex: "यूवी सूचकांक",
      sunrise: "सूर्योदय",
      sunset: "सूर्यास्त",
      hourlyForecast: "24-घंटे का प्रति घंटा पूर्वानुमान",
      sevenDayForecast: "7-दिवसीय दृष्टिकोण",
      weatherHighlights: "आज की मौसम संबंधी मुख्य विशेषताएं",
      activeAlertsBanner: "सक्रिय आपदा चेतावनी का पता चला",
      searchPlaceholder: "शहर खोजें (उदा: दिल्ली, चेन्नई, मुंबई, बेंगलुरु)...",
      useMyLocation: "मेरा स्थान पहचानें",
      advisoryOverview: "स्थान-आधारित सुरक्षा और कृषि परामर्श",
    },
    chat: {
      welcomeTitle: "WeatherGPT इंटेलिजेंस सहायक",
      welcomeSubtitle: "रीयल-टाइम मौसम, 7-दिवसीय पूर्वानुमान, आपदा परामर्श, या कृषि सलाह के बारे में पूछें।",
      placeholder: "उदा: क्या कल चेन्नई में बारिश होगी? क्या मुझे छाता ले जाना चाहिए?...",
      send: "भेजें",
      listening: "सुन रहा हूँ... बोलिए",
      speak: "आवाज इनपुट",
      stopSpeaking: "बोलना रोकें",
      groundedContext: "सत्यापित मौसम डेटा साक्ष्य",
      suggestedQueries: "सुझाए गए प्रश्न",
      uncertaintyNotice: "मौसम संबंधी आत्मविश्वास नोट",
    },
    alerts: {
      title: "मौसम अलर्ट एवं आपदा चेतावनियाँ",
      subtitle: "IMD प्रारंभिक चेतावनी प्रोटोकॉल के अनुरूप गंभीर मौसम की निगरानी।",
      filterAll: "सभी अलर्ट",
      filterMinor: "मामूली",
      filterModerate: "मध्यम (पीला अलर्ट)",
      filterSevere: "गंभीर (नारंगी अलर्ट)",
      filterExtreme: "अत्यधिक गंभीर (लाल अलर्ट)",
      simulatedTag: "शैक्षणिक सिमुलेशन डेमो",
      instructions: "अनुशंसित एहतियाती कार्रवाई",
      noAlerts: "इस चयन के लिए कोई सक्रिय गंभीर चेतावनी नहीं है।",
    },
    climate: {
      title: "ऐतिहासिक मौसम एवं जलवायु विश्लेषण",
      subtitle: "दीर्घकालिक मौसम प्रवृत्तियों, वर्षा संचय और तापमान विचलनों का अन्वेषण करें।",
      startDate: "प्रारंभ तिथि",
      endDate: "समाप्ति तिथि",
      exportCsv: "CSV रिपोर्ट डाउनलोड करें",
      temperatureTrends: "तापमान रुझान (°C)",
      rainfallTrends: "दैनिक वर्षा (मिमी)",
      meanTemp: "औसत तापमान",
      recordMax: "उच्चतम रिकॉर्ड",
      recordMin: "न्यूनतम रिकॉर्ड",
      totalRainfall: "कुल वर्षा",
      rainyDays: "वर्षा के दिन (≥2.5मिमी)",
    },
    map: {
      title: "इंटरैक्टिव मौसम मानचित्र",
      subtitle: "प्रमुख भारतीय महानगरों और स्टेशनों का ओपनस्ट्रीटमैप अवलोकन।",
      selectCity: "शहर मार्कर चुनें",
      compareCities: "कई शहरों की तुलना करें",
    },
    settings: {
      title: "एप्लिकेशन एवं इकाई सेटिंग्स",
      temperatureUnit: "तापमान इकाई",
      celsius: "सेल्सियस (°C)",
      fahrenheit: "फ़ारेनहाइट (°F)",
      windSpeedUnit: "हवा की गति इकाई",
      language: "इंटरफ़ेस भाषा",
      theme: "थीम",
      dark: "डार्क मोड",
      light: "लाइट मोड",
      savePreferences: "सेटिंग्स सहेजें",
      savedSuccess: "सेटिंग्स सफलतापूर्वक सहेजी गईं!",
    },
  },
};
