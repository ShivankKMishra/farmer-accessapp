import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import WelcomeBanner from '@/components/home/welcome-banner';
import QuickActions from '@/components/home/quick-actions';
import MarketplacePreview from '@/components/home/marketplace-preview';
import WeatherForecast from '@/components/home/weather-forecast';
import CommunityPreview from '@/components/home/community-preview';
import FarmSummary from '@/components/home/farm-summary';
import BiddingPreview from '@/components/home/bidding-preview';
import AuthForm from '@/components/auth/auth-form';
import { getWeatherData } from '@/lib/weather';

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const [weatherSummary, setWeatherSummary] = useState<{ temp: number; condition: string } | null>(null);
  
  useEffect(() => {
    if (isAuthenticated && user?.location) {
      // Fetch basic weather information for the welcome banner
      const fetchWeatherSummary = async () => {
        try {
          const data = await getWeatherData(user.location || 'Pune, Maharashtra');
          setWeatherSummary({
            temp: Math.round(data.current.temp_c),
            condition: data.current.condition.text
          });
        } catch (error) {
          console.error('Failed to fetch weather summary:', error);
        }
      };
      
      fetchWeatherSummary();
    }
  }, [isAuthenticated, user]);
  
  // If not authenticated, show login form
  if (!isAuthenticated) {
    return (
      <section className="container mx-auto px-4 py-8 md:py-16">
        <AuthForm isLoginMode={true} />
      </section>
    );
  }
  
  // If authenticated, show dashboard
  return (
    <section className="container mx-auto px-4 py-8">
      <WelcomeBanner weatherData={weatherSummary || undefined} />
      
      <QuickActions />
      
      <MarketplacePreview />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <WeatherForecast />
        <CommunityPreview />
      </div>
      
      <FarmSummary />
      
      <BiddingPreview />
    </section>
  );
}
