// Serverless weather API endpoint for Vercel deployment
const axios = require('axios');

// WeatherAPI.com implementation
async function fetchWeatherData(location) {
  try {
    const apiKey = process.env.WEATHER_API_KEY;
    if (!apiKey) {
      throw new Error('WEATHER_API_KEY environment variable is not set');
    }

    // Make request to WeatherAPI.com
    const response = await axios.get(`https://api.weatherapi.com/v1/forecast.json`, {
      params: {
        key: apiKey,
        q: location,
        days: 7,
        aqi: 'no',
        alerts: 'no'
      }
    });

    // Format the response to match our frontend expectations
    return {
      location: response.data.location.name,
      current: {
        temp_c: response.data.current.temp_c,
        condition: {
          text: response.data.current.condition.text,
          icon: response.data.current.condition.icon
        },
        humidity: response.data.current.humidity,
        wind_kph: response.data.current.wind_kph
      },
      forecast: {
        forecastday: response.data.forecast.forecastday.map(day => ({
          date: day.date,
          day: {
            maxtemp_c: day.day.maxtemp_c,
            mintemp_c: day.day.mintemp_c,
            condition: {
              text: day.day.condition.text,
              icon: day.day.condition.icon
            }
          }
        }))
      }
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    
    // If we're in development or have no API key, return fallback data
    if (process.env.NODE_ENV !== 'production' || !process.env.WEATHER_API_KEY) {
      return generateFallbackWeatherData(location);
    }
    
    throw error;
  }
}

// Fallback data for development only
function generateFallbackWeatherData(location) {
  return {
    location: location,
    current: {
      temp_c: 28,
      condition: {
        text: "Partly cloudy",
        icon: "//cdn.weatherapi.com/weather/64x64/day/116.png"
      },
      humidity: 65,
      wind_kph: 12
    },
    forecast: {
      forecastday: [
        {
          date: new Date().toISOString().split('T')[0],
          day: {
            maxtemp_c: 32,
            mintemp_c: 24,
            condition: {
              text: "Sunny",
              icon: "//cdn.weatherapi.com/weather/64x64/day/113.png"
            }
          }
        },
        {
          date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          day: {
            maxtemp_c: 29,
            mintemp_c: 22,
            condition: {
              text: "Patchy rain possible",
              icon: "//cdn.weatherapi.com/weather/64x64/day/176.png"
            }
          }
        },
        {
          date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
          day: {
            maxtemp_c: 27,
            mintemp_c: 21,
            condition: {
              text: "Thunderstorms",
              icon: "//cdn.weatherapi.com/weather/64x64/day/200.png"
            }
          }
        },
        {
          date: new Date(Date.now() + 259200000).toISOString().split('T')[0],
          day: {
            maxtemp_c: 30,
            mintemp_c: 23,
            condition: {
              text: "Sunny",
              icon: "//cdn.weatherapi.com/weather/64x64/day/113.png"
            }
          }
        }
      ]
    }
  };
}

// Express route handler
module.exports = async (req, res) => {
  try {
    const { location } = req.query;
    
    if (!location) {
      return res.status(400).json({ message: "Location is required" });
    }
    
    const weatherData = await fetchWeatherData(location);
    res.json(weatherData);
  } catch (error) {
    console.error('Weather API error:', error);
    res.status(500).json({ 
      message: "Error fetching weather data", 
      error: process.env.NODE_ENV === 'production' ? undefined : error.message 
    });
  }
};