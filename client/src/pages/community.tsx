import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/lib/auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Discussion {
  id: number;
  title: string;
  content: string;
  category: string;
  created_at: string;
  author: {
    id: number;
    name: string;
    username: string;
    profile_pic: string;
  };
  commentCount: number;
}

export default function Community() {
  const { isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('recent');
  
  // Construct the query string based on filters
  const constructQueryString = () => {
    let query = '/api/discussions';
    const params = [];
    
    if (category && category !== 'all') {
      params.push(`category=${encodeURIComponent(category)}`);
    }
    
    if (params.length > 0) {
      query += '?' + params.join('&');
    }
    
    return query;
  };
  
  const { data: discussions, isLoading } = useQuery<Discussion[]>({
    queryKey: [constructQueryString()],
  });
  
  // Apply search filter and sorting to discussions (client-side)
  const filteredDiscussions = (discussions || []).filter(discussion => 
    searchTerm ? 
      discussion.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      discussion.content.toLowerCase().includes(searchTerm.toLowerCase()) 
    : true
  );
  
  // Sort discussions based on active tab
  const sortedDiscussions = [...filteredDiscussions].sort((a, b) => {
    if (activeTab === 'recent') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    } else if (activeTab === 'popular') {
      return b.commentCount - a.commentCount;
    }
    return 0;
  });
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHrs / 24);
    
    if (diffHrs < 1) return 'Just now';
    if (diffHrs < 24) return `${diffHrs} ${diffHrs === 1 ? 'hour' : 'hours'} ago`;
    if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    
    return date.toLocaleDateString();
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-poppins font-semibold text-neutral-800 mb-2">Community Forum</h1>
        <p className="text-neutral-600">Join discussions, ask questions, and share knowledge with fellow farmers</p>
      </div>
      
      {/* Filters and Actions */}
      <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <Input
              placeholder="Search discussions..."
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
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="crop-cultivation">Crop Cultivation</SelectItem>
                <SelectItem value="pest-control">Pest Control</SelectItem>
                <SelectItem value="market-trends">Market Trends</SelectItem>
                <SelectItem value="technology">Technology</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {isAuthenticated && (
            <div className="shrink-0">
              <Link href="/community/new">
                <Button className="w-full md:w-auto bg-[#2E7D32] hover:bg-[#1b5e20]">
                  <span className="material-icons text-sm mr-1">add</span>
                  New Discussion
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
      
      {/* Discussions */}
      <Tabs defaultValue="recent" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="popular">Most Popular</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="p-5">
              <CardContent className="p-0">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Skeleton className="h-8 w-8 rounded-full mr-2" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-4 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {sortedDiscussions.length > 0 ? (
            <div className="space-y-4">
              {sortedDiscussions.map((discussion) => (
                <Link key={discussion.id} href={`/discussions/${discussion.id}`}>
                  <a className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-5">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-poppins font-medium text-neutral-800 hover:text-[#2E7D32]">
                        {discussion.title}
                      </h3>
                      <span className="inline-flex items-center bg-[#4caf50] bg-opacity-10 text-[#2E7D32] px-2 py-1 rounded text-xs font-medium">
                        {discussion.category}
                      </span>
                    </div>
                    
                    <p className="text-neutral-600 mb-4 line-clamp-2">
                      {discussion.content}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <img
                          src={discussion.author.profile_pic || 'https://randomuser.me/api/portraits/men/32.jpg'}
                          alt={discussion.author.name}
                          className="h-8 w-8 rounded-full mr-2"
                        />
                        <div>
                          <span className="font-medium">{discussion.author.name}</span>
                          <div className="text-neutral-500 text-xs">
                            {formatTime(discussion.created_at)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center text-neutral-600">
                        <span className="material-icons text-base mr-1">chat</span>
                        <span>{discussion.commentCount} {discussion.commentCount === 1 ? 'reply' : 'replies'}</span>
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
                  <span className="material-icons text-3xl text-[#2E7D32]">forum</span>
                </div>
                <h3 className="text-xl font-poppins font-semibold text-neutral-800 mb-2">No discussions found</h3>
                <p className="text-neutral-600 mb-6">
                  {searchTerm ? 
                    `No discussions matching "${searchTerm}" found.` :
                    'Be the first to start a discussion in this category!'
                  }
                </p>
                {isAuthenticated ? (
                  <Link href="/community/new">
                    <Button className="bg-[#2E7D32] hover:bg-[#1b5e20]">
                      <span className="material-icons text-sm mr-1">add</span>
                      Start a Discussion
                    </Button>
                  </Link>
                ) : (
                  <Link href="/login">
                    <Button className="bg-[#2E7D32] hover:bg-[#1b5e20]">
                      Log In to Participate
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
