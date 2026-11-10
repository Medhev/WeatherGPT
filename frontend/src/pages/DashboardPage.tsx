import React from 'react';
import { useWeather } from '../context/WeatherContext';
import { CurrentWeatherCard } from '../components/dashboard/CurrentWeatherCard';
import { HourlyForecastCard } from '../components/dashboard/HourlyForecastCard';
import { DailyForecastCard } from '../components/dashboard/DailyForecastCard';
import { HighlightsGrid } from '../components/dashboard/HighlightsGrid';
import { AdvisorySummaryCard } from '../components/dashboard/AdvisorySummaryCard';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorBanner } from '../components/common/ErrorBanner';

export const DashboardPage: React.FC = () => {
  const { weather, locationName, loading, error, fetchWeatherByCity } = useWeather();

  if (loading && !weather) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton rows={4} />
      </div>
    );
  }

  if (error && !weather) {
    return (
      <div className="space-y-6">
        <ErrorBanner message={error} onRetry={() => fetchWeatherByCity(locationName)} />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {error && (
        <ErrorBanner message={error} onRetry={() => fetchWeatherByCity(locationName)} />
      )}

      {weather && (
        <>
          {/* Main Hero Weather Card */}
          <CurrentWeatherCard weather={weather} />

          {/* Hourly 24-Hour Forecast */}
          <HourlyForecastCard hourly={weather.hourly} />

          {/* Grid: Highlights & 7-Day Forecast */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <HighlightsGrid highlights={weather.highlights} current={weather.current} />
            <DailyForecastCard daily={weather.daily} />
          </div>

          {/* Location-Based Disaster & Safety Advisories */}
          <AdvisorySummaryCard />
        </>
      )}
    </div>
  );
};
