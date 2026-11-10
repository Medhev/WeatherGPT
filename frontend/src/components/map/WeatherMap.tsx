import React, { useState, useEffect, useCallback } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  useMap, 
  useMapEvents,
  ZoomControl
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Search, 
  Crosshair, 
  MapPin, 
  Wind, 
  Droplets, 
  Gauge, 
  Sun, 
  Check, 
  Bookmark, 
  MessageSquare, 
  Loader2, 
  AlertTriangle,
  X,
  Compass,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWeather } from '../../context/WeatherContext';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../services/api';
import { WeatherResponse, LocationSearchResult } from '../../types';

// Key synoptic meteorological observatories in India
const SYNOPTIC_STATIONS = [
  { name: 'Chennai', lat: 13.0827, lon: 80.2707, state: 'Tamil Nadu' },
  { name: 'New Delhi', lat: 28.6139, lon: 77.2090, state: 'Delhi NCR' },
  { name: 'Mumbai', lat: 19.0760, lon: 72.8777, state: 'Maharashtra' },
  { name: 'Kolkata', lat: 22.5726, lon: 88.3639, state: 'West Bengal' },
  { name: 'Bengaluru', lat: 12.9716, lon: 77.5946, state: 'Karnataka' },
  { name: 'Hyderabad', lat: 17.3850, lon: 78.4867, state: 'Telangana' },
  { name: 'Ahmedabad', lat: 23.0225, lon: 72.5714, state: 'Gujarat' },
  { name: 'Kochi', lat: 9.9312, lon: 76.2673, state: 'Kerala' },
  { name: 'Guwahati', lat: 26.1445, lon: 91.7362, state: 'Assam' },
  { name: 'Bhubaneswar', lat: 20.2961, lon: 85.8245, state: 'Odisha' },
  { name: 'Shimla', lat: 31.1048, lon: 77.1734, state: 'Himachal Pradesh' },
  { name: 'Nagpur', lat: 21.1458, lon: 79.0882, state: 'Maharashtra' },
  { name: 'Patna', lat: 25.5941, lon: 85.1376, state: 'Bihar' },
  { name: 'Jaipur', lat: 26.9124, lon: 75.7873, state: 'Rajasthan' },
  { name: 'Srinagar', lat: 34.0837, lon: 74.7973, state: 'Jammu & Kashmir' },
  { name: 'Thiruvananthapuram', lat: 8.5241, lon: 76.9366, state: 'Kerala' }
];

// Custom vector icons for stations and active target pin
const stationIcon = L.divIcon({
  className: 'custom-weather-station-marker',
  html: `
    <div style="background-color: #0284c7; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 8px rgba(2,132,199,0.9); cursor: pointer;"></div>
  `,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const activePinIcon = L.divIcon({
  className: 'active-pin-marker',
  html: `
    <div style="background-color: #f43f5e; width: 18px; height: 18px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 14px rgba(244,63,94,0.9);"></div>
  `,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

// Map Viewport Controller to handle flying to coordinates & container resize
function MapViewController({ 
  targetCoords, 
  zoomLevel 
}: { 
  targetCoords: [number, number] | null; 
  zoomLevel?: number; 
}) {
  const map = useMap();

  useEffect(() => {
    // Invalidate map size after container mounts to avoid gray/unrendered tiles
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);
    return () => clearTimeout(timer);
  }, [map]);

  useEffect(() => {
    if (targetCoords) {
      map.flyTo(targetCoords, zoomLevel || 8, { duration: 1.2 });
    }
  }, [targetCoords, zoomLevel, map]);

  return null;
}

// Map Click Listener to inspect ANY coordinate
function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lon: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export const WeatherMap: React.FC = () => {
  const navigate = useNavigate();
  const { formatTemp, formatWind, fetchWeatherByCoords } = useWeather();
  const { isAuthenticated, token } = useAuth();

  // Active coordinates & pin
  const [activeCoords, setActiveCoords] = useState<[number, number]>([13.0827, 80.2707]); // Default Chennai
  const [targetFlyCoords, setTargetFlyCoords] = useState<[number, number] | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // Selected telemetry state
  const [selectedWeather, setSelectedWeather] = useState<WeatherResponse | null>(null);
  const [telemetryLoading, setTelemetryLoading] = useState(false);
  const [telemetryError, setTelemetryError] = useState<string | null>(null);
  const [geoNotice, setGeoNotice] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeSetSuccess, setActiveSetSuccess] = useState(false);

  // Helper to fetch weather for coordinates and update telemetry drawer
  const inspectWeatherAtCoords = useCallback(async (lat: number, lon: number, customName?: string) => {
    setTelemetryLoading(true);
    setTelemetryError(null);
    setSavedSuccess(false);
    setActiveSetSuccess(false);
    setActiveCoords([lat, lon]);

    try {
      const res = await apiClient.get<WeatherResponse>('/weather/current', {
        params: { 
          lat, 
          lon, 
          ...(customName && customName !== 'My Current Location' ? { city: customName } : {}) 
        },
      });
      setSelectedWeather(res.data);
    } catch (err: any) {
      setTelemetryError(err.response?.data?.detail || "Could not retrieve meteorological telemetry for this location.");
    } finally {
      setTelemetryLoading(false);
    }
  }, []);

  // Initial load for default active city
  useEffect(() => {
    inspectWeatherAtCoords(13.0827, 80.2707, 'Chennai');
  }, [inspectWeatherAtCoords]);

  // Geocoding city search with debouncing
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      setSearchError(null);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchLoading(true);
      setSearchError(null);
      try {
        const res = await apiClient.get<LocationSearchResult[]>('/locations/search', {
          params: { q: searchQuery.trim() },
          timeout: 8000
        });
        const results = res.data || [];
        setSearchResults(results);
        setShowDropdown(true);
        if (results.length === 0) {
          setSearchError(`No locations found matching "${searchQuery.trim()}".`);
        }
      } catch (err: any) {
        setSearchResults([]);
        setSearchError("Geocoding service unavailable or network timed out.");
      } finally {
        setSearchLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle Enter key on search form
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    if (searchResults.length > 0) {
      handleSelectSearchResult(searchResults[0]);
      return;
    }

    setSearchLoading(true);
    setSearchError(null);
    try {
      const res = await apiClient.get<LocationSearchResult[]>('/locations/search', {
        params: { q: query },
        timeout: 8000
      });
      const results = res.data || [];
      if (results.length > 0) {
        handleSelectSearchResult(results[0]);
      } else {
        setSearchError(`Could not resolve location for "${query}". Please check spelling.`);
      }
    } catch (err: any) {
      setSearchError("Search timed out. Please check your internet connection.");
    } finally {
      setSearchLoading(false);
    }
  };

  // Select a city from search
  const handleSelectSearchResult = (loc: LocationSearchResult) => {
    setSearchQuery(`${loc.name}${loc.admin1 ? `, ${loc.admin1}` : ''}`);
    setShowDropdown(false);
    setSearchError(null);
    setTargetFlyCoords([loc.latitude, loc.longitude]);
    inspectWeatherAtCoords(loc.latitude, loc.longitude, loc.name);
  };

  // Map Click Handler
  const handleMapClick = (lat: number, lon: number) => {
    setTargetFlyCoords(null); // Keep user's zoom/pan
    inspectWeatherAtCoords(lat, lon);
  };

  // Browser Geolocation Detection with explicit user trigger
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setGeoNotice("Browser geolocation is not supported in this browser. Please use the search bar above.");
      return;
    }

    setGeoNotice("Requesting browser location permission...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeoNotice(null);
        const { latitude, longitude } = position.coords;
        setTargetFlyCoords([latitude, longitude]);
        inspectWeatherAtCoords(latitude, longitude); // Do not pass "My Current Location" as city param
      },
      (err) => {
        let msg = "Could not detect your location.";
        if (err.code === err.PERMISSION_DENIED) {
          msg = "Location permission denied. Please allow location access in your browser or search for your city above.";
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = "Location telemetry is currently unavailable on your device. Please use manual city search.";
        } else if (err.code === err.TIMEOUT) {
          msg = "Location request timed out. Please try again or search manually.";
        }
        setGeoNotice(msg);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Set as Active Dashboard Location
  const handleSetActiveDashboardCity = async () => {
    if (!selectedWeather) return;
    try {
      await fetchWeatherByCoords(
        selectedWeather.location.latitude,
        selectedWeather.location.longitude,
        selectedWeather.location.name
      );
      setActiveSetSuccess(true);
      setTimeout(() => setActiveSetSuccess(false), 3000);
    } catch (e) {
      // Handled in context
    }
  };

  // Save to Favorites
  const handleSaveLocation = async () => {
    if (!selectedWeather) return;
    try {
      if (isAuthenticated && token) {
        await apiClient.post('/locations/saved', {
          name: selectedWeather.location.name,
          latitude: selectedWeather.location.latitude,
          longitude: selectedWeather.location.longitude,
          country: selectedWeather.location.country,
          admin1: selectedWeather.location.admin1,
          is_favorite: true,
        });
      } else {
        // Guest local storage fallback
        const existing = JSON.parse(localStorage.getItem('weathergpt_saved_locations') || '[]');
        if (!existing.some((item: any) => item.name === selectedWeather.location.name)) {
          existing.push({
            id: Date.now(),
            name: selectedWeather.location.name,
            latitude: selectedWeather.location.latitude,
            longitude: selectedWeather.location.longitude,
            admin1: selectedWeather.location.admin1,
            is_favorite: true,
          });
          localStorage.setItem('weathergpt_saved_locations', JSON.stringify(existing));
        }
      }
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert("Unable to save location: " + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div className="relative w-full h-[620px] min-h-[500px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl z-0 flex flex-col md:flex-row">
      
      {/* Top Search & Geolocation Controls Bar */}
      <div className="absolute top-4 left-4 z-[1000] flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-md w-[calc(100%-2rem)] sm:w-auto">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <div className="flex items-center bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl px-3 py-2 shadow-lg">
            <Search className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
              placeholder="Search city across India or world..."
              className="bg-transparent text-xs text-slate-100 placeholder-slate-400 focus:outline-none w-full sm:w-64"
            />
            {searchLoading && <Loader2 className="w-3.5 h-3.5 text-sky-400 animate-spin ml-1" />}
            {searchQuery && (
              <button 
                type="button"
                onClick={() => { setSearchQuery(''); setShowDropdown(false); setSearchError(null); }} 
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search suggestions dropdown */}
          {showDropdown && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl shadow-2xl max-h-56 overflow-y-auto z-[1001] divide-y divide-slate-800">
              {searchResults.map((loc, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => handleSelectSearchResult(loc)}
                  className="w-full text-left px-3.5 py-2.5 text-xs text-slate-200 hover:bg-sky-500/20 hover:text-sky-300 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-2 truncate">
                    <MapPin className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                    <span className="font-medium truncate">{loc.name}</span>
                    <span className="text-[11px] text-slate-400 truncate">
                      {loc.admin1 ? `${loc.admin1}, ` : ''}{loc.country || ''}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono ml-2">
                    {loc.latitude.toFixed(2)}°, {loc.longitude.toFixed(2)}°
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Search error badge */}
          {searchError && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900/95 border border-red-500/40 text-red-300 text-[11px] p-2 rounded-xl shadow-xl flex items-center gap-1.5 z-[1001]">
              <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
              <span>{searchError}</span>
            </div>
          )}
        </form>

        {/* Detect Location Button */}
        <button
          type="button"
          onClick={handleDetectLocation}
          title="Detect My Location"
          className="bg-slate-900/90 hover:bg-slate-800 backdrop-blur-md border border-slate-700/80 text-sky-400 hover:text-sky-300 px-3 py-2 rounded-xl text-xs font-medium shadow-lg flex items-center justify-center gap-1.5 transition-colors flex-shrink-0"
        >
          <Crosshair className="w-4 h-4" />
          <span>My Location</span>
        </button>
      </div>

      {/* Geolocation Notification Toast */}
      {geoNotice && (
        <div className="absolute top-16 left-4 z-[1000] bg-slate-900/95 border border-amber-500/40 text-amber-300 px-3.5 py-2 rounded-xl text-xs shadow-xl flex items-center gap-2 max-w-sm animate-fadeIn">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-400" />
          <span className="flex-1">{geoNotice}</span>
          <button onClick={() => setGeoNotice(null)} className="text-slate-400 hover:text-slate-200">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* React Leaflet Map Container */}
      <div className="w-full h-full relative" style={{ minHeight: '500px' }}>
        <MapContainer
          center={[21.7679, 78.8718]}
          zoom={5}
          minZoom={4}
          maxZoom={18}
          zoomControl={false}
          style={{ height: '100%', width: '100%', backgroundColor: '#0f172a' }}
        >
          {/* Standard OpenStreetMap Tile Provider with Required Attribution */}
          <TileLayer
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'
            maxZoom={19}
          />

          <ZoomControl position="bottomright" />
          <MapViewController targetCoords={targetFlyCoords} />
          <MapClickHandler onMapClick={handleMapClick} />

          {/* Synoptic Observatories Across India */}
          {SYNOPTIC_STATIONS.map((station) => (
            <Marker
              key={station.name}
              position={[station.lat, station.lon]}
              icon={stationIcon}
              eventHandlers={{
                click: () => {
                  setTargetFlyCoords([station.lat, station.lon]);
                  inspectWeatherAtCoords(station.lat, station.lon, station.name);
                },
              }}
            />
          ))}

          {/* Active Coordinate Inspection Pin */}
          {activeCoords && (
            <Marker position={activeCoords} icon={activePinIcon} />
          )}
        </MapContainer>
      </div>

      {/* Real-Time Meteorological Telemetry Slide-over Drawer */}
      <div className="absolute bottom-4 right-4 md:top-4 md:bottom-4 z-[1000] w-[calc(100%-2rem)] md:w-80 max-h-[85%] overflow-y-auto bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-4 shadow-2xl flex flex-col justify-between text-xs text-slate-200 space-y-3 pointer-events-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-2.5">
          <div>
            <div className="flex items-center gap-1.5 text-sky-400 font-bold text-sm">
              <Compass className="w-4 h-4 text-sky-400" />
              <span>Synoptic Telemetry</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Click anywhere on map to inspect coordinates
            </p>
          </div>
          {telemetryLoading && <Loader2 className="w-4 h-4 text-sky-400 animate-spin" />}
        </div>

        {/* Telemetry Error */}
        {telemetryError && (
          <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-[11px]">
            {telemetryError}
          </div>
        )}

        {/* Telemetry Body */}
        {selectedWeather && !telemetryLoading ? (
          <div className="space-y-3 flex-1">
            
            {/* Location & Temp Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-100 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  <span>{selectedWeather.location.name}</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  {selectedWeather.location.admin1 ? `${selectedWeather.location.admin1}, ` : ''}{selectedWeather.location.country || 'India'}
                </p>
                <p className="text-[10px] text-slate-500 font-mono">
                  {selectedWeather.location.latitude.toFixed(2)}°N, {selectedWeather.location.longitude.toFixed(2)}°E
                </p>
              </div>

              <div className="text-right">
                <div className="text-2xl font-extrabold text-slate-100">
                  {formatTemp(selectedWeather.current.temperature)}
                </div>
                <div className="text-[11px] text-sky-300 font-medium capitalize">
                  {selectedWeather.current.weather_description}
                </div>
                <div className="text-[10px] text-slate-400">
                  Feels like {formatTemp(selectedWeather.current.apparent_temperature)}
                </div>
              </div>
            </div>

            {/* Meteorological Telemetry Grid */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center gap-2">
                <Droplets className="w-4 h-4 text-sky-400" />
                <div>
                  <div className="text-[10px] text-slate-400">Humidity</div>
                  <div className="font-bold text-slate-200">{selectedWeather.current.relative_humidity}%</div>
                </div>
              </div>

              <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center gap-2">
                <Wind className="w-4 h-4 text-teal-400" />
                <div>
                  <div className="text-[10px] text-slate-400">Wind</div>
                  <div className="font-bold text-slate-200">{formatWind(selectedWeather.current.wind_speed)}</div>
                </div>
              </div>

              <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center gap-2">
                <Gauge className="w-4 h-4 text-purple-400" />
                <div>
                  <div className="text-[10px] text-slate-400">Pressure</div>
                  <div className="font-bold text-slate-200">{Math.round(selectedWeather.current.pressure_msl)} hPa</div>
                </div>
              </div>

              <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-400" />
                <div>
                  <div className="text-[10px] text-slate-400">UV Index</div>
                  <div className="font-bold text-slate-200">{selectedWeather.current.uv_index ?? 'Low'}</div>
                </div>
              </div>
            </div>

            {/* 3-Day Forecast Preview */}
            {selectedWeather.daily && selectedWeather.daily.length > 0 && (
              <div className="pt-2 border-t border-slate-800">
                <div className="text-[11px] font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>3-Day Synoptic Outlook</span>
                  <span className="text-[10px] text-slate-500">Harmonized IMD/NWP</span>
                </div>
                <div className="space-y-1.5">
                  {selectedWeather.daily.slice(0, 3).map((day, dIdx) => (
                    <div
                      key={dIdx}
                      className="flex items-center justify-between p-1.5 rounded-lg bg-slate-800/40 text-[11px]"
                    >
                      <span className="text-slate-300 font-medium">
                        {dIdx === 0 ? 'Today' : new Date(day.date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                      <span className="text-slate-400 text-[10px] truncate max-w-[100px]">
                        {day.weather_description}
                      </span>
                      <div className="font-mono text-slate-200">
                        <span className="text-rose-300 font-bold">{formatTemp(day.temperature_max)}</span>
                        <span className="text-slate-500 mx-1">/</span>
                        <span className="text-sky-300">{formatTemp(day.temperature_min)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <button
                onClick={handleSetActiveDashboardCity}
                className={`w-full py-2 px-3 rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 transition-all ${
                  activeSetSuccess
                    ? 'bg-emerald-600 text-white'
                    : 'bg-sky-500 hover:bg-sky-600 text-white shadow-md shadow-sky-500/20'
                }`}
              >
                {activeSetSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Set as Active Dashboard City!</span>
                  </>
                ) : (
                  <>
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Set as Active Dashboard City</span>
                  </>
                )}
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleSaveLocation}
                  className={`py-1.5 px-2.5 rounded-xl font-medium text-xs border flex items-center justify-center gap-1 transition-all ${
                    savedSuccess
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-800 hover:bg-slate-700/80 border-slate-700 text-slate-300'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                  <span>{savedSuccess ? 'Saved!' : 'Favorite'}</span>
                </button>

                <button
                  onClick={() => navigate('/chat')}
                  className="py-1.5 px-2.5 rounded-xl font-medium text-xs bg-slate-800 hover:bg-purple-900/40 border border-slate-700 hover:border-purple-500/40 text-purple-300 flex items-center justify-center gap-1 transition-all"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                  <span>Ask AI</span>
                </button>
              </div>
            </div>

          </div>
        ) : (
          <div className="py-8 text-center text-slate-400 space-y-2">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-sky-400" />
            <p className="text-xs">Fetching meteorological telemetry...</p>
          </div>
        )}

        {/* Footer Attribution Note */}
        <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 text-center">
          Data: Open-Meteo & IMD · Tiles: &copy; OpenStreetMap contributors
        </div>

      </div>

    </div>
  );
};
