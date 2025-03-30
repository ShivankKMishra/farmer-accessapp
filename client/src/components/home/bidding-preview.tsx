import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/lib/auth';

interface Auction {
  id: number;
  title: string;
  crop_name: string;
  quantity: number;
  unit: string;
  min_price: number;
  end_time: string;
  seller: {
    id: number;
    name: string;
    profile_pic: string;
  };
  highestBid: number | null;
  bidCount: number;
}

export default function BiddingPreview() {
  const { isAuthenticated } = useAuth();
  
  const { data: auctions, isLoading } = useQuery<Auction[]>({
    queryKey: ['/api/auctions?status=active'],
    enabled: isAuthenticated,
  });
  
  // Calculate time remaining
  const calculateTimeRemaining = (endTimeString: string) => {
    const endTime = new Date(endTimeString).getTime();
    const now = new Date().getTime();
    const timeRemaining = endTime - now;
    
    if (timeRemaining <= 0) return 'Ended';
    
    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} ${days === 1 ? 'day' : 'days'}`;
    if (hours > 0) return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
    
    return 'Less than 1 hour';
  };
  
  if (!isAuthenticated) {
    return (
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-poppins font-semibold text-neutral-800">Bulk Crop Auctions</h2>
            <Link href="/login">
              <a className="text-[#2E7D32] hover:text-[#1b5e20] text-sm font-medium">Login to access</a>
            </Link>
          </div>
          
          <div className="text-center py-10">
            <div className="inline-flex items-center justify-center bg-[#1976d2] bg-opacity-20 w-16 h-16 rounded-full mb-4">
              <span className="material-icons text-3xl text-[#1976d2]">gavel</span>
            </div>
            <h3 className="text-lg font-poppins font-medium text-neutral-800 mb-2">Crop Auction Platform</h3>
            <p className="text-neutral-600 max-w-md mx-auto mb-6">
              Buy and sell crops in bulk through our bidding system.
              Login to participate in auctions.
            </p>
            <Button className="bg-[#2E7D32] hover:bg-[#1b5e20]" asChild>
              <Link href="/login">
                <a>Login to Continue</a>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-poppins font-semibold text-neutral-800">Bulk Crop Auctions</h2>
          <Link href="/bidding">
            <a className="text-[#2E7D32] hover:text-[#1b5e20] text-sm font-medium">View all auctions</a>
          </Link>
        </div>
        
        {isLoading ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200">
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Crop</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Quantity</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Current Bid</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Ends In</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Seller</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {[1, 2, 3].map((i) => (
                  <tr key={i}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <Skeleton className="h-6 w-6 rounded-full mr-2" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Skeleton className="h-4 w-16" />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Skeleton className="h-4 w-16" />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Skeleton className="h-4 w-12" />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <Skeleton className="h-6 w-6 rounded-full mr-2" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Skeleton className="h-8 w-16 rounded" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <>
            {auctions && auctions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-neutral-50 border-b border-neutral-200">
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Crop</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Quantity</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Current Bid</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Ends In</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Seller</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-neutral-200">
                    {auctions.slice(0, 3).map((auction) => (
                      <tr key={auction.id}>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="material-icons text-[#8BC34A] mr-2">grass</span>
                            <span className="font-medium text-neutral-800">{auction.crop_name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-neutral-800">
                          {auction.quantity} {auction.unit}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap font-medium text-[#43a047]">
                          {auction.highestBid ? `₹${auction.highestBid}/${auction.unit}` : `₹${auction.min_price}/${auction.unit}`}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-neutral-800">
                          {calculateTimeRemaining(auction.end_time)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <img 
                              src={auction.seller.profile_pic || 'https://randomuser.me/api/portraits/men/32.jpg'} 
                              alt={auction.seller.name} 
                              className="h-6 w-6 rounded-full mr-2" 
                            />
                            <span className="text-neutral-800">{auction.seller.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <Link href={`/bidding/${auction.id}`}>
                            <Button className="bg-[#2E7D32] text-white px-3 py-1 h-auto text-sm">
                              Place Bid
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center bg-[#1976d2] bg-opacity-20 w-16 h-16 rounded-full mb-4">
                  <span className="material-icons text-3xl text-[#1976d2]">gavel</span>
                </div>
                <h3 className="text-lg font-poppins font-medium text-neutral-800 mb-2">No active auctions</h3>
                <p className="text-neutral-600 max-w-md mx-auto mb-6">
                  There are currently no active crop auctions. Create one or check back later.
                </p>
              </div>
            )}
            
            <div className="mt-4 flex justify-between">
              <Link href="/bidding/create">
                <Button variant="outline">
                  <span className="material-icons text-sm mr-1">add</span>
                  Create Auction
                </Button>
              </Link>
              
              <Link href="/bidding/my-bids">
                <Button variant="outline">
                  <span className="material-icons text-sm mr-1">history</span>
                  View My Bids
                </Button>
              </Link>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
