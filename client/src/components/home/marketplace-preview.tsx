import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  unit: string;
  location: string;
  image: string;
  is_organic: boolean;
  seller: {
    id: number;
    name: string;
    profile_pic: string;
  };
}

export default function MarketplacePreview() {
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products?limit=3'],
  });

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-poppins font-semibold text-neutral-800">Recent Marketplace Listings</h2>
        <Link href="/marketplace">
          <a className="text-[#2E7D32] hover:text-[#1b5e20] flex items-center text-sm font-medium">
            View all <span className="material-icons text-sm ml-1">arrow_forward</span>
          </a>
        </Link>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <div className="flex justify-between pt-2">
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-6 w-1/4" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(products || []).slice(0, 3).map((product) => (
            <Link key={product.id} href={`/products/${product.id}`}>
              <a className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                {product.image ? (
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="h-48 w-full object-cover"
                  />
                ) : (
                  <div className="h-48 w-full bg-neutral-200 flex items-center justify-center">
                    <span className="material-icons text-4xl text-neutral-400">image</span>
                  </div>
                )}
                
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-poppins font-medium text-neutral-800">{product.name}</h3>
                      <p className="text-neutral-600 text-sm">
                        {product.is_organic && 'Organic | '}{product.quantity} {product.unit} available
                      </p>
                    </div>
                    <span className="font-poppins font-semibold text-[#2E7D32]">₹{product.price}/{product.unit}</span>
                  </div>
                  
                  <div className="flex items-center mt-3 text-sm text-neutral-600">
                    <span className="material-icons text-sm mr-1">location_on</span>
                    <span>{product.location}</span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center text-sm">
                      <img 
                        src={product.seller.profile_pic || 'https://randomuser.me/api/portraits/men/32.jpg'} 
                        alt={product.seller.name} 
                        className="h-6 w-6 rounded-full mr-2"
                      />
                      <span>{product.seller.name}</span>
                    </div>
                    <button className="text-[#2E7D32] hover:text-[#1b5e20] text-sm font-medium">Contact</button>
                  </div>
                </div>
              </a>
            </Link>
          ))}
          
          {/* If no products are available, show placeholder */}
          {(!products || products.length === 0) && (
            <div className="col-span-1 md:col-span-3 bg-white rounded-lg shadow-sm p-8 text-center">
              <span className="material-icons text-4xl text-neutral-400 mb-2">shopping_basket</span>
              <h3 className="font-poppins font-medium text-neutral-700 mb-1">No products available</h3>
              <p className="text-neutral-600 text-sm mb-4">Be the first to list your products in the marketplace</p>
              <Link href="/marketplace/new">
                <a className="inline-flex items-center text-[#2E7D32] hover:text-[#1b5e20] font-medium">
                  <span className="material-icons text-sm mr-1">add</span>
                  Add Product
                </a>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
