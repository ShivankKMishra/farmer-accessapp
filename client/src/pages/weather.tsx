import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/lib/auth';
import { 
  getWeatherData, 
  getWeatherIcon, 
  getDayOfWeek, 
  generateFarmerTip, 
  type WeatherData 
} from '@/lib/weather';

export default function Weather() {
  const { user } = useAuth();
  const [location, setLocation] = useState(user?.location || 'Pune, Maharashtra');
  const [searchLocation, setSearchLocation] = useState('');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchWeather = async (locationString: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getWeatherData(locationString);
      setWeatherData(data);
    } catch (err) {
      console.error('Failed to fetch weather data:', err);
      setError('Unable to fetch weather data for this location. Please try another location.');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchWeather(location);
  }, []);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchLocation.trim()) {
      setLocation(searchLocation);
      fetchWeather(searchLocation);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-poppins font-semibold text-neutral-800 mb-2">Weather Forecast</h1>
        <p className="text-neutral-600">Check weather conditions for planning your farm activities</p>
      </div>
      
      <Card className="mb-8">
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <Input
              placeholder="Enter location (e.g. Pune, Maharashtra)"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              className="flex-grow"
            />
            <Button 
              type="submit"
              className="bg-[#2E7D32] hover:bg-[#1b5e20]"
              disabled={isLoading || !searchLocation.trim()}
            >
              <span className="material-icons text-base mr-1">search</span>
              Search
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {isLoading ? (
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/2">
                <Skeleton className="h-8 w-1/3 mb-2" />
                <div className="flex items-center mb-6">
                  <Skeleton className="h-20 w-20 rounded-full mr-4" />
                  <div>
                    <Skeleton className="h-12 w-24 mb-2" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                </div>
              </div>
              <div className="md:w-1/2">
                <Skeleton className="h-8 w-1/3 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="mb-8">
          <CardContent className="p-8 text-center">
            <div className="inline-flex items-center justify-center bg-neutral-200 w-16 h-16 rounded-full mb-4">
              <span className="material-icons text-3xl text-neutral-500">cloud_off</span>
            </div>
            <h3 className="text-xl font-poppins font-semibold text-neutral-800 mb-2">Weather data unavailable</h3>
            <p className="text-neutral-600 mb-6">{error}</p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchLocation('');
                setLocation(user?.location || 'Pune, Maharashtra');
                fetchWeather(user?.location || 'Pune, Maharashtra');
              }}
            >
              Reset location
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {weatherData && (
            <>
              <Card className="mb-8">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="md:w-1/2">
                      <h2 className="text-2xl font-poppins font-semibold text-neutral-800 mb-4">
                        Current Weather in {location}
                      </h2>
                      
                      <div className="flex items-center mb-6">
                        <div className="flex items-center justify-center bg-[#4caf50] bg-opacity-10 w-20 h-20 rounded-full mr-4">
                          <span className="material-icons text-5xl text-[#2E7D32]">
                            {getWeatherIcon(weatherData.current.condition.text)}
                          </span>
                        </div>
                        <div>
                          <div className="text-4xl font-poppins font-semibold">
                            {Math.round(weatherData.current.temp_c)}°C
                          </div>
                          <div className="text-lg text-neutral-600">
                            {weatherData.current.condition.text}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center">
                          <span className="material-icons text-neutral-500 mr-2">water_drop</span>
                          <div>
                            <div className="text-sm text-neutral-600">Humidity</div>
                            <div className="font-medium">{weatherData.current.humidity}%</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <span className="material-icons text-neutral-500 mr-2">air</span>
                          <div>
                            <div className="text-sm text-neutral-600">Wind</div>
                            <div className="font-medium">{Math.round(weatherData.current.wind_kph)} km/h</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="md:w-1/2 md:border-l md:border-neutral-200 md:pl-6">
                      <h3 className="text-lg font-poppins font-medium text-neutral-800 mb-3">Farmer's Tip</h3>
                      <p className="text-neutral-700">
                        {generateFarmerTip(weatherData)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <h2 className="text-2xl font-poppins font-semibold text-neutral-800 mb-4">4-Day Forecast</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {weatherData.forecast.forecastday.map((day, index) => (
                  <Card key={index}>
                    <CardContent className="p-4 text-center">
                      <h3 className="font-poppins font-medium text-lg mb-3">{getDayOfWeek(day.date)}</h3>
                      <div className="inline-flex items-center justify-center bg-[#4caf50] bg-opacity-10 w-16 h-16 rounded-full mb-3">
                        <span className="material-icons text-3xl text-[#2E7D32]">
                          {getWeatherIcon(day.day.condition.text)}
                        </span>
                      </div>
                      <div className="text-2xl font-semibold mb-1">{Math.round(day.day.maxtemp_c)}°C</div>
                      <div className="text-neutral-600 text-sm">{day.day.condition.text}</div>
                      
                      <div className="mt-4 pt-4 border-t border-neutral-200 text-sm text-neutral-600">
                        <div className="flex justify-between mb-1">
                          <span>Min Temp:</span>
                          <span className="font-medium">{Math.round(day.day.mintemp_c)}°C</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-poppins font-medium text-neutral-800 mb-3">Farming Activity Recommendations</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <span className="material-icons text-[#2E7D32] mr-2 mt-0.5">check_circle</span>
                      <div>
                        <h4 className="font-medium text-neutral-800">Irrigation Planning</h4>
                        <p className="text-neutral-600">
                          {weatherData.forecast.forecastday.some(day => 
                            day.day.condition.text.toLowerCase().includes('rain')
                          ) 
                            ? "Natural rainfall expected in the forecast. Consider adjusting your irrigation schedule accordingly to conserve water."
                            : "No significant rainfall expected in the next few days. Ensure adequate irrigation for your crops, especially during early morning or evening."}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <span className="material-icons text-[#2E7D32] mr-2 mt-0.5">check_circle</span>
                      <div>
                        <h4 className="font-medium text-neutral-800">Pest Management</h4>
                        <p className="text-neutral-600">
                          {weatherData.current.humidity > 70
                            ? "High humidity levels can increase the risk of fungal diseases. Monitor your crops closely and consider preventive measures."
                            : "Current humidity levels are moderate. Continue regular pest monitoring but risk of fungal diseases is lower."}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <span className="material-icons text-[#2E7D32] mr-2 mt-0.5">check_circle</span>
                      <div>
                        <h4 className="font-medium text-neutral-800">Harvesting</h4>
                        <p className="text-neutral-600">
                          {weatherData.forecast.forecastday.slice(0, 2).some(day => 
                            day.day.condition.text.toLowerCase().includes('rain') ||
                            day.day.condition.text.toLowerCase().includes('storm')
                          ) 
                            ? "Plan your harvesting activities around the expected rainfall to avoid crop damage and quality issues."
                            : "Weather conditions look favorable for harvesting activities in the next couple of days."}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}
    </div>
  );
}
