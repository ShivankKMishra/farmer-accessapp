import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getWeatherData, getWeatherIcon, getDayOfWeek, generateFarmerTip, type WeatherData } from '@/lib/weather';
import { useAuth } from '@/lib/auth';

export default function WeatherForecast() {
  const { user } = useAuth();
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchWeather() {
      try {
        setIsLoading(true);
        // Use user's location or default to a city
        const location = user?.location || 'Pune, Maharashtra';
        const data = await getWeatherData(location);
        setWeatherData(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch weather data:', err);
        setError('Unable to fetch weather data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchWeather();
  }, [user?.location]);
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
          </div>
          
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center">
              <Skeleton className="h-12 w-12 rounded-full mr-2" />
              <div>
                <Skeleton className="h-8 w-20 mb-1" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <div className="text-right">
              <Skeleton className="h-4 w-28 mb-1" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-2 border-t border-neutral-200 pt-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="text-center">
                <Skeleton className="h-4 w-8 mx-auto mb-1" />
                <Skeleton className="h-6 w-6 mx-auto my-1 rounded-full" />
                <Skeleton className="h-4 w-10 mx-auto" />
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-neutral-200">
            <Skeleton className="h-4 w-40 mb-3" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error || !weatherData) {
    return (
      <Card>
        <CardContent className="p-5 text-center py-10">
          <span className="material-icons text-4xl text-neutral-400 mb-2">cloud_off</span>
          <h3 className="font-poppins font-medium text-neutral-700 mb-1">Weather data unavailable</h3>
          <p className="text-neutral-600 text-sm">{error || "Unable to load weather forecast"}</p>
        </CardContent>
      </Card>
    );
  }
  
  const location = weatherData.location;
  const current = weatherData.current;
  const forecast = weatherData.forecast.forecastday;
  const farmerTip = generateFarmerTip(weatherData);
  
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-poppins font-semibold text-neutral-800">Weather Forecast</h2>
          <span className="text-sm text-neutral-600">{location}</span>
        </div>
        
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center">
            <span className="material-icons text-4xl text-yellow-500 mr-2">
              {getWeatherIcon(current.condition.text)}
            </span>
            <div>
              <div className="text-3xl font-poppins font-semibold">{Math.round(current.temp_c)}°C</div>
              <div className="text-neutral-600">{current.condition.text}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-neutral-800">Humidity: {current.humidity}%</div>
            <div className="text-neutral-800">Wind: {Math.round(current.wind_kph)} km/h</div>
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-2 border-t border-neutral-200 pt-4">
          {forecast.slice(0, 4).map((day, index) => (
            <div key={index} className="text-center">
              <div className="text-sm text-neutral-600">{getDayOfWeek(day.date)}</div>
              <div className="material-icons text-yellow-500 my-1">
                {getWeatherIcon(day.day.condition.text)}
              </div>
              <div className="font-medium">{Math.round(day.day.maxtemp_c)}°C</div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t border-neutral-200">
          <div className="text-neutral-800 font-medium mb-2">Farmer's Tip:</div>
          <p className="text-sm text-neutral-700">{farmerTip}</p>
        </div>
      </CardContent>
    </Card>
  );
}
