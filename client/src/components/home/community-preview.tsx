import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

interface Discussion {
  id: number;
  title: string;
  author: {
    id: number;
    name: string;
    username: string;
    profile_pic: string;
  };
  created_at: string;
  commentCount: number;
}

export default function CommunityPreview() {
  const { data: discussions, isLoading } = useQuery<Discussion[]>({
    queryKey: ['/api/discussions?limit=3'],
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
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-poppins font-semibold text-neutral-800">Community Discussions</h2>
          <Link href="/community">
            <a className="text-[#2E7D32] hover:text-[#1b5e20] text-sm font-medium">View all</a>
          </Link>
        </div>
        
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border-b border-neutral-200 pb-4 last:border-0">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <div className="flex items-center mt-2">
                  <Skeleton className="h-5 w-5 rounded-full mr-2" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {(discussions || []).slice(0, 3).map((discussion) => (
              <div key={discussion.id} className="border-b border-neutral-200 pb-4 last:border-0">
                <Link href={`/discussions/${discussion.id}`}>
                  <a className="block">
                    <h3 className="font-medium text-neutral-800 hover:text-[#2E7D32]">{discussion.title}</h3>
                    <div className="flex items-center mt-2 text-sm text-neutral-600">
                      <img 
                        src={discussion.author.profile_pic || 'https://randomuser.me/api/portraits/men/32.jpg'} 
                        alt={discussion.author.name} 
                        className="h-5 w-5 rounded-full mr-2"
                      />
                      <span>{discussion.author.name}</span>
                      <span className="mx-2">•</span>
                      <span>{formatTime(discussion.created_at)}</span>
                      <span className="mx-2">•</span>
                      <span className="flex items-center">
                        <span className="material-icons text-xs mr-1">chat</span> {discussion.commentCount}
                      </span>
                    </div>
                  </a>
                </Link>
              </div>
            ))}
            
            {/* If no discussions are available, show placeholder */}
            {(!discussions || discussions.length === 0) && (
              <div className="text-center py-6">
                <span className="material-icons text-4xl text-neutral-400 mb-2">forum</span>
                <h3 className="font-poppins font-medium text-neutral-700 mb-1">No discussions yet</h3>
                <p className="text-neutral-600 text-sm mb-4">Be the first to start a discussion</p>
              </div>
            )}
          </div>
        )}
        
        <div className="mt-4 pt-3">
          <Link href="/community/new">
            <Button variant="outline" className="w-full">
              <span className="material-icons text-sm mr-1">add</span>
              <span>Start a New Discussion</span>
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
