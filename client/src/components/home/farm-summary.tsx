import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';

interface Crop {
  id: number;
  name: string;
  area: number;
  area_unit: string;
  planting_date: string;
  expected_harvest_date: string;
}

interface Expense {
  id: number;
  title: string;
  amount: number;
  category: string;
  date: string;
}

export default function FarmSummary() {
  const { isAuthenticated } = useAuth();
  
  const { data: crops, isLoading: isLoadingCrops } = useQuery<Crop[]>({
    queryKey: ['/api/crops'],
    enabled: isAuthenticated,
  });
  
  const { data: expenses, isLoading: isLoadingExpenses } = useQuery<Expense[]>({
    queryKey: ['/api/expenses'],
    enabled: isAuthenticated,
  });
  
  // Calculate crop progress
  const calculateProgress = (plantingDate: string, harvestDate: string | undefined) => {
    if (!harvestDate) return 0;
    
    const start = new Date(plantingDate).getTime();
    const end = new Date(harvestDate).getTime();
    const now = new Date().getTime();
    
    if (now >= end) return 100;
    if (now <= start) return 0;
    
    const total = end - start;
    const current = now - start;
    return Math.round((current / total) * 100);
  };
  
  // Format date to display only day and month
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
  };
  
  if (!isAuthenticated) {
    return (
      <Card className="mb-8">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-poppins font-semibold text-neutral-800">Farm Management</h2>
            <Link href="/login">
              <a className="text-[#2E7D32] hover:text-[#1b5e20] text-sm font-medium">Login to access</a>
            </Link>
          </div>
          
          <div className="text-center py-10">
            <div className="inline-flex items-center justify-center bg-[#4caf50] bg-opacity-20 w-16 h-16 rounded-full mb-4">
              <span className="material-icons text-3xl text-[#2E7D32]">grass</span>
            </div>
            <h3 className="text-lg font-poppins font-medium text-neutral-800 mb-2">Farm Management Tools</h3>
            <p className="text-neutral-600 max-w-md mx-auto mb-6">
              Track your crops, record expenses, and manage your farm efficiently.
              Login to access these tools.
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
    <Card className="mb-8">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-poppins font-semibold text-neutral-800">Farm Management</h2>
          <Link href="/farm-management">
            <a className="text-[#2E7D32] hover:text-[#1b5e20] text-sm font-medium">View details</a>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-neutral-800 font-medium mb-3">Active Crops</h3>
            
            {isLoadingCrops ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center">
                    <div className="mr-3">
                      <Skeleton className="h-10 w-10 rounded" />
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-center mb-1">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                      <Skeleton className="h-2 w-full rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {crops && crops.length > 0 ? (
                  crops.slice(0, 3).map((crop) => {
                    const progress = crop.expected_harvest_date ? 
                      calculateProgress(crop.planting_date, crop.expected_harvest_date) : 0;
                    
                    // Calculate days remaining
                    let daysRemaining = 0;
                    let totalDays = 0;
                    
                    if (crop.expected_harvest_date) {
                      const plantDate = new Date(crop.planting_date).getTime();
                      const harvestDate = new Date(crop.expected_harvest_date).getTime();
                      const now = new Date().getTime();
                      
                      totalDays = Math.round((harvestDate - plantDate) / (1000 * 60 * 60 * 24));
                      daysRemaining = Math.max(0, Math.round((harvestDate - now) / (1000 * 60 * 60 * 24)));
                    }
                    
                    return (
                      <div key={crop.id} className="flex items-center">
                        <div className="bg-[#9CCC65] bg-opacity-20 p-2 rounded mr-3">
                          <span className="material-icons text-[#8BC34A]">grass</span>
                        </div>
                        <div className="flex-grow">
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium text-neutral-800">
                              {crop.name} ({crop.area} {crop.area_unit})
                            </h4>
                            {crop.expected_harvest_date && (
                              <span className="text-sm text-neutral-600">
                                Day {totalDays - daysRemaining}/{totalDays}
                              </span>
                            )}
                          </div>
                          <div className="w-full bg-neutral-200 rounded-full h-2 mt-1">
                            <div
                              className="bg-[#8BC34A] h-2 rounded-full"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-4">
                    <p className="text-neutral-600 mb-3">No active crops found</p>
                    <Link href="/farm-management">
                      <Button variant="outline" className="text-[#2E7D32] border-[#2E7D32]" size="sm">
                        <span className="material-icons text-sm mr-1">add</span>
                        Add crop
                      </Button>
                    </Link>
                  </div>
                )}
                
                {crops && crops.length > 0 && (
                  <div className="mt-4">
                    <Link href="/farm-management">
                      <a className="text-[#2E7D32] hover:text-[#1b5e20] text-sm font-medium flex items-center">
                        <span className="material-icons text-sm mr-1">add</span>
                        <span>Add new crop</span>
                      </a>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div>
            <h3 className="text-neutral-800 font-medium mb-3">Recent Expenses</h3>
            
            {isLoadingExpenses ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex justify-between items-center pb-2 border-b border-neutral-200">
                    <div className="flex items-center">
                      <Skeleton className="h-8 w-8 rounded-full mr-2" />
                      <div>
                        <Skeleton className="h-4 w-32 mb-1" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-5 w-16" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {expenses && expenses.length > 0 ? (
                  expenses.slice(0, 3).map((expense) => (
                    <div key={expense.id} className="flex justify-between items-center pb-2 border-b border-neutral-200">
                      <div className="flex items-center">
                        <span className="material-icons text-[#795548] mr-2">
                          {expense.category === 'seeds' ? 'spa' :
                           expense.category === 'fertilizers' ? 'compost' :
                           expense.category === 'pesticides' ? 'bug_report' :
                           expense.category === 'labor' ? 'people' :
                           expense.category === 'equipment' ? 'construction' :
                           expense.category === 'irrigation' ? 'water_drop' :
                           expense.category === 'transport' ? 'local_shipping' :
                           'receipt_long'}
                        </span>
                        <div>
                          <div className="text-neutral-800">{expense.title}</div>
                          <div className="text-xs text-neutral-600">{formatDate(expense.date)}</div>
                        </div>
                      </div>
                      <span className="font-medium text-neutral-800">₹{expense.amount.toLocaleString()}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-neutral-600 mb-3">No expenses recorded</p>
                    <Link href="/farm-management?tab=expenses">
                      <Button variant="outline" className="text-[#2E7D32] border-[#2E7D32]" size="sm">
                        <span className="material-icons text-sm mr-1">add</span>
                        Record expense
                      </Button>
                    </Link>
                  </div>
                )}
                
                {expenses && expenses.length > 0 && (
                  <div className="mt-4">
                    <Link href="/farm-management?tab=expenses">
                      <a className="text-[#2E7D32] hover:text-[#1b5e20] text-sm font-medium flex items-center">
                        <span className="material-icons text-sm mr-1">add</span>
                        <span>Record expense</span>
                      </a>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
