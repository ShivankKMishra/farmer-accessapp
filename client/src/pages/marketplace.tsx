import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/lib/auth';

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

export default function Marketplace() {
  const { isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [location, setLocation] = useState('');
  
  // Construct the query string based on filters
  const constructQueryString = () => {
    let query = '/api/products';
    const params = [];
    
    if (category && category !== 'all') {
      params.push(`category=${encodeURIComponent(category)}`);
    }
    if (location) {
      params.push(`location=${encodeURIComponent(location)}`);
    }
    
    if (params.length > 0) {
      query += '?' + params.join('&');
    }
    
    return query;
  };
  
  const { data: products, isLoading, refetch } = useQuery<Product[]>({
    queryKey: [constructQueryString()],
  });
  
  // Apply search filter to products (client-side)
  const filteredProducts = (products || []).filter(product => 
    searchTerm ? 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) 
    : true
  );
  
  useEffect(() => {
    refetch();
  }, [category, location, refetch]);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-poppins font-semibold text-neutral-800 mb-2">Marketplace</h1>
        <p className="text-neutral-600">Buy and sell agricultural products, seeds, tools, and more</p>
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-5 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <Input
              placeholder="Search for products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div className="w-full md:w-48">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="crops">Crops</SelectItem>
                <SelectItem value="seeds">Seeds</SelectItem>
                <SelectItem value="fertilizers">Fertilizers</SelectItem>
                <SelectItem value="tools">Tools & Equipment</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full md:w-48">
            <Input
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          
          {isAuthenticated && (
            <div className="shrink-0">
              <Link href="/marketplace/new">
                <Button className="w-full md:w-auto bg-[#2E7D32] hover:bg-[#1b5e20]">
                  <span className="material-icons text-sm mr-1">add</span>
                  Add Product
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
      
      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
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
        <>
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
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
            </div>
          ) : (
            <Card className="p-8 text-center">
              <CardContent className="pt-6">
                <div className="inline-flex items-center justify-center bg-[#4caf50] bg-opacity-20 w-16 h-16 rounded-full mb-4">
                  <span className="material-icons text-3xl text-[#2E7D32]">search_off</span>
                </div>
                <h3 className="text-xl font-poppins font-semibold text-neutral-800 mb-2">No products found</h3>
                <p className="text-neutral-600 mb-6">
                  {searchTerm ? 
                    `No products matching "${searchTerm}" found in our marketplace.` :
                    'No products available with the selected filters.'
                  }
                </p>
                <Button variant="outline" onClick={() => {
                  setSearchTerm('');
                  setCategory('all');
                  setLocation('');
                }}>
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
