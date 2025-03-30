import { apiRequest } from './queryClient';

export interface WeatherCondition {
  text: string;
  icon: string;
}

export interface CurrentWeather {
  temp_c: number;
  condition: WeatherCondition;
  humidity: number;
  wind_kph: number;
}

export interface ForecastDay {
  date: string;
  day: {
    maxtemp_c: number;
    mintemp_c: number;
    condition: WeatherCondition;
  };
}

export interface WeatherForecast {
  forecastday: ForecastDay[];
}

export interface WeatherData {
  location: string;
  current: CurrentWeather;
  forecast: WeatherForecast;
}

export async function getWeatherData(location: string): Promise<WeatherData> {
  try {
    const response = await fetch(`/api/weather?location=${encodeURIComponent(location)}`);
    if (!response.ok) {
      throw new Error('Failed to fetch weather data');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
}

// Map weather condition to Material Icons
export function getWeatherIcon(condition: string): string {
  const conditionLower = condition.toLowerCase();
  if (conditionLower.includes('sunny') || conditionLower.includes('clear')) {
    return 'wb_sunny';
  } else if (conditionLower.includes('partly cloudy')) {
    return 'partly_cloudy_day';
  } else if (conditionLower.includes('cloudy')) {
    return 'cloud';
  } else if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
    return 'grain';
  } else if (conditionLower.includes('thunder')) {
    return 'thunderstorm';
  } else if (conditionLower.includes('snow') || conditionLower.includes('sleet')) {
    return 'ac_unit';
  } else if (conditionLower.includes('fog') || conditionLower.includes('mist')) {
    return 'cloud';
  } else {
    return 'wb_sunny';
  }
}

// Get day of week from date string
export function getDayOfWeek(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

// Generate a farmer's tip based on weather
export function generateFarmerTip(weatherData: WeatherData): string {
  const current = weatherData.current;
  const forecast = weatherData.forecast.forecastday;
  
  let tip = '';
  
  // Check for rain in forecast
  const hasRain = forecast.some(day => 
    day.day.condition.text.toLowerCase().includes('rain') || 
    day.day.condition.text.toLowerCase().includes('thunder')
  );
  
  // Check for hot weather
  const isHot = current.temp_c > 30;
  
  // Check for very humid conditions
  const isHumid = current.humidity > 70;
  
  if (hasRain) {
    const rainDay = forecast.findIndex(day => 
      day.day.condition.text.toLowerCase().includes('rain') || 
      day.day.condition.text.toLowerCase().includes('thunder')
    );
    
    if (rainDay === 0) {
      tip = "Rain expected today. Consider postponing any outdoor spraying activities and ensure proper drainage in your fields.";
    } else {
      const day = getDayOfWeek(forecast[rainDay].date);
      tip = `Rain expected on ${day}. Plan your harvesting and field work accordingly to avoid the wet conditions.`;
    }
  } else if (isHot) {
    tip = "Hot weather conditions detected. Ensure adequate irrigation for your crops, preferably during early morning or evening to minimize evaporation.";
  } else if (isHumid) {
    tip = "High humidity levels can increase risk of fungal diseases. Monitor your crops closely and ensure good air circulation through proper spacing.";
  } else {
    tip = "Weather conditions look favorable for general farming activities. A good time for harvesting or planting depending on your crop cycle.";
  }
  
  return tip;
}
