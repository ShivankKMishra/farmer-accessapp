import { useAuth } from '@/lib/auth';

interface WelcomeBannerProps {
  weatherData?: {
    temp: number;
    condition: string;
  };
}

export default function WelcomeBanner({ weatherData }: WelcomeBannerProps) {
  const { user } = useAuth();
  
  return (
    <div className="bg-gradient-to-r from-[#2E7D32] to-[#689F38] text-white rounded-xl shadow-md mb-8">
      <div className="px-6 py-6 md:px-10 md:py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-poppins font-semibold mb-2">
              Welcome back, {user?.name || 'Farmer'}!
            </h1>
            <p className="text-neutral-100">How's your farm doing today?</p>
          </div>
          
          {weatherData && (
            <div className="mt-4 md:mt-0">
              <div className="inline-flex items-center bg-white bg-opacity-20 rounded-lg px-4 py-2">
                <span className="material-icons mr-2">wb_sunny</span>
                <span>
                  {weatherData.temp}°C - {weatherData.condition} in {user?.location || 'your area'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
