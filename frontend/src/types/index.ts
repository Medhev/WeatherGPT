export interface User {
  id: number;
  email: string;
  username: string;
  full_name?: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in_minutes: number;
  user: User;
}

export interface UserPreferences {
  temp_unit: 'celsius' | 'fahrenheit';
  wind_speed_unit: 'kmh' | 'ms' | 'mph';
  language: 'en' | 'ta' | 'hi';
  theme: 'light' | 'dark' | 'system';
  notifications_enabled: boolean;
}

export interface LocationInfo {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
  timezone?: string;
}

export interface LocationSearchResult {
  id?: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  country_code?: string;
  admin1?: string;
  timezone?: string;
}

export interface CurrentWeather {
  temperature: number;
  apparent_temperature: number;
  relative_humidity: number;
  is_day: number;
  precipitation: number;
  rain: number;
  weather_code: number;
  weather_description: string;
  weather_icon: string;
  cloud_cover: number;
  pressure_msl: number;
  surface_pressure: number;
  wind_speed: number;
  wind_direction: number;
  wind_gusts: number;
  visibility?: number;
  uv_index?: number;
  time: string;
}

export interface HourlyForecastPoint {
  time: string;
  temperature: number;
  apparent_temperature: number;
  precipitation_probability: number;
  precipitation: number;
  weather_code: number;
  weather_description: string;
  weather_icon: string;
  relative_humidity: number;
  wind_speed: number;
  is_day: number;
}

export interface DailyForecastPoint {
  date: string;
  weather_code: number;
  weather_description: string;
  weather_icon: string;
  temperature_max: number;
  temperature_min: number;
  apparent_temperature_max: number;
  apparent_temperature_min: number;
  sunrise?: string;
  sunset?: string;
  uv_index_max?: number;
  precipitation_sum: number;
  precipitation_probability_max: number;
  wind_speed_max: number;
  wind_gusts_max: number;
}

export interface WeatherHighlights {
  humidity: number;
  wind_speed: number;
  wind_direction: number;
  visibility_km: number;
  pressure_hpa: number;
  uv_index: number;
  sunrise?: string;
  sunset?: string;
  air_quality_summary?: string;
}

export interface WeatherResponse {
  location: LocationInfo;
  current: CurrentWeather;
  hourly: HourlyForecastPoint[];
  daily: DailyForecastPoint[];
  highlights: WeatherHighlights;
  source: string;
  cached: boolean;
}

export interface CityComparisonResponse {
  city_a: WeatherResponse;
  city_b: WeatherResponse;
  comparison_summary: string;
  temp_difference: number;
  rain_comparison: string;
  wind_comparison: string;
}

export interface AlertItem {
  id: number;
  event_type: string;
  severity: 'Minor' | 'Moderate' | 'Severe' | 'Extreme';
  title: string;
  description: string;
  instruction?: string;
  location_name: string;
  latitude?: number;
  longitude?: number;
  effective_at: string;
  expires_at?: string;
  source: string;
  is_active: boolean;
  is_simulated: boolean;
}

export interface AlertListResponse {
  total: number;
  alerts: AlertItem[];
  active_count: number;
  severe_count: number;
  extreme_count: number;
  timestamp: string;
}

export interface DisasterAdvisory {
  category: string;
  level: 'Normal' | 'Caution' | 'Warning' | 'Emergency';
  headline: string;
  advice_points: string[];
  target_demographic: string;
  relevance_context: string;
}

export interface HistoricalDayData {
  date: string;
  temperature_max: number;
  temperature_min: number;
  temperature_mean: number;
  precipitation_sum: number;
  wind_speed_max: number;
  relative_humidity_mean?: number;
}

export interface ClimateSummaryStats {
  mean_max_temp: number;
  mean_min_temp: number;
  overall_avg_temp: number;
  record_max_temp: number;
  record_min_temp: number;
  total_rainfall_mm: number;
  rainy_days_count: number;
  max_single_day_rainfall: number;
  dry_spell_days: number;
  analyzed_days_count: number;
  temperature_anomaly?: number;
}

export interface ClimateTrendsResponse {
  location_name: string;
  latitude: number;
  longitude: number;
  start_date: string;
  end_date: string;
  daily_records: HistoricalDayData[];
  statistics: ClimateSummaryStats;
  data_source: string;
}

export interface GroundedDataRecord {
  tool: string;
  location?: string;
  temperature?: number;
  weather_condition?: string;
  rain_probability?: number;
  precipitation?: number;
  date_context?: string;
  advisory?: string;
}

export interface ChatMessageResponse {
  session_id: number;
  reply: string;
  intent: string;
  detected_location?: string;
  grounded_data?: GroundedDataRecord;
  tool_executed?: string;
  uncertainty_note?: string;
  language: string;
  audio_transcription?: string;
  suggested_followups: string[];
  provider?: string;
  is_fallback?: boolean;
  model_name?: string;
  warning?: string;
}

export interface SavedLocation {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
  is_favorite: boolean;
  created_at: string;
}

export interface IntegrationStatus {
  provider_name: string;
  status: string;
  description: string;
  auth_required: boolean;
  data_format: string;
  update_frequency: string;
  api_endpoint?: string;
  notes: string;
}
