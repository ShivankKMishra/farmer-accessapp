import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

interface Crop {
  id: number;
  name: string;
  variety: string;
  area: number;
  area_unit: string;
  planting_date: string;
  expected_harvest_date: string;
  status: string;
  notes: string;
}

interface Expense {
  id: number;
  title: string;
  amount: number;
  category: string;
  date: string;
  notes: string;
}

const cropSchema = z.object({
  name: z.string().min(1, { message: "Crop name is required" }),
  variety: z.string().optional(),
  area: z.number().min(0.1, { message: "Area must be greater than 0" }),
  area_unit: z.string().default("acres"),
  planting_date: z.string().min(1, { message: "Planting date is required" }),
  expected_harvest_date: z.string().optional(),
  notes: z.string().optional(),
});

const expenseSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  amount: z.number().min(1, { message: "Amount must be greater than 0" }),
  category: z.string().min(1, { message: "Category is required" }),
  date: z.string().min(1, { message: "Date is required" }),
  notes: z.string().optional(),
});

export default function FarmManagement() {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("crops");
  const [addCropOpen, setAddCropOpen] = useState(false);
  const [addExpenseOpen, setAddExpenseOpen] = useState(false);
  
  // Fetch crops data
  const { 
    data: crops, 
    isLoading: isLoadingCrops 
  } = useQuery<Crop[]>({
    queryKey: ['/api/crops'],
    enabled: isAuthenticated,
  });
  
  // Fetch expenses data
  const { 
    data: expenses, 
    isLoading: isLoadingExpenses 
  } = useQuery<Expense[]>({
    queryKey: ['/api/expenses'],
    enabled: isAuthenticated,
  });
  
  // Add crop mutation
  const addCropMutation = useMutation({
    mutationFn: (newCrop: z.infer<typeof cropSchema>) => {
      return apiRequest('POST', '/api/crops', newCrop);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crops'] });
      setAddCropOpen(false);
      toast({
        title: "Crop added successfully",
        description: "Your crop has been added to your farm management system",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to add crop",
        description: "There was an error adding your crop. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Add expense mutation
  const addExpenseMutation = useMutation({
    mutationFn: (newExpense: z.infer<typeof expenseSchema>) => {
      return apiRequest('POST', '/api/expenses', newExpense);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/expenses'] });
      setAddExpenseOpen(false);
      toast({
        title: "Expense recorded successfully",
        description: "Your expense has been added to your records",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to record expense",
        description: "There was an error recording your expense. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Form for adding a new crop
  const cropForm = useForm<z.infer<typeof cropSchema>>({
    resolver: zodResolver(cropSchema),
    defaultValues: {
      name: "",
      variety: "",
      area: 1,
      area_unit: "acres",
      planting_date: new Date().toISOString().slice(0, 10),
      expected_harvest_date: "",
      notes: "",
    },
  });
  
  // Form for adding a new expense
  const expenseForm = useForm<z.infer<typeof expenseSchema>>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      title: "",
      amount: 0,
      category: "",
      date: new Date().toISOString().slice(0, 10),
      notes: "",
    },
  });
  
  // Handle crop form submission
  const onCropSubmit = (data: z.infer<typeof cropSchema>) => {
    addCropMutation.mutate(data);
  };
  
  // Handle expense form submission
  const onExpenseSubmit = (data: z.infer<typeof expenseSchema>) => {
    addExpenseMutation.mutate(data);
  };
  
  // Calculate crop progress
  const calculateCropProgress = (plantingDate: string, harvestDate: string | undefined) => {
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
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  // If not authenticated, show login prompt
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-poppins">Farm Management</CardTitle>
            <CardDescription>
              Login to access farm management tools and track your crops and expenses.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <div className="inline-flex items-center justify-center bg-[#4caf50] bg-opacity-20 w-16 h-16 rounded-full">
              <span className="material-icons text-3xl text-[#2E7D32]">grass</span>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button className="bg-[#2E7D32] hover:bg-[#1b5e20]" asChild>
              <a href="/login">Login to Continue</a>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-poppins font-semibold text-neutral-800 mb-2">Farm Management</h1>
        <p className="text-neutral-600">Track your crops, record expenses, and manage your agricultural activities</p>
      </div>
      
      <Tabs defaultValue="crops" value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="crops">Crops</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
        </TabsList>
        
        <TabsContent value="crops">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-poppins font-medium text-neutral-800">Active Crops</h2>
            
            <Dialog open={addCropOpen} onOpenChange={setAddCropOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#2E7D32] hover:bg-[#1b5e20]">
                  <span className="material-icons text-sm mr-1">add</span>
                  Add Crop
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Crop</DialogTitle>
                </DialogHeader>
                
                <Form {...cropForm}>
                  <form onSubmit={cropForm.handleSubmit(onCropSubmit)} className="space-y-4 pt-4">
                    <FormField
                      control={cropForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Crop Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Wheat, Rice, Tomatoes" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={cropForm.control}
                      name="variety"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Variety (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Roma, Basmati" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={cropForm.control}
                        name="area"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Area</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="0.1" 
                                step="0.1" 
                                {...field}
                                onChange={e => field.onChange(parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={cropForm.control}
                        name="area_unit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Unit</FormLabel>
                            <Select 
                              defaultValue={field.value} 
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select unit" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="acres">Acres</SelectItem>
                                <SelectItem value="hectares">Hectares</SelectItem>
                                <SelectItem value="bigha">Bigha</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={cropForm.control}
                        name="planting_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Planting Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={cropForm.control}
                        name="expected_harvest_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Expected Harvest (Optional)</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={cropForm.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes (Optional)</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Any additional information about this crop" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end space-x-4 pt-2">
                      <Button type="button" variant="outline" onClick={() => setAddCropOpen(false)}>
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        className="bg-[#2E7D32] hover:bg-[#1b5e20]"
                        disabled={addCropMutation.isPending}
                      >
                        {addCropMutation.isPending ? "Adding..." : "Add Crop"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          
          {isLoadingCrops ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-4">
                  <div className="flex items-center">
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
                </Card>
              ))}
            </div>
          ) : (
            <>
              {crops && crops.length > 0 ? (
                <div className="space-y-4">
                  {crops.map((crop) => {
                    const progress = crop.expected_harvest_date ? 
                      calculateCropProgress(crop.planting_date, crop.expected_harvest_date) : 0;
                    
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
                      <Card key={crop.id} className="p-4">
                        <div className="flex items-center">
                          <div className="bg-[#9CCC65] bg-opacity-20 p-2 rounded mr-3">
                            <span className="material-icons text-[#8BC34A]">grass</span>
                          </div>
                          <div className="flex-grow">
                            <div className="flex justify-between items-center">
                              <h4 className="font-medium text-neutral-800">
                                {crop.name} {crop.variety ? `(${crop.variety})` : ''} - {crop.area} {crop.area_unit}
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
                            <div className="flex justify-between mt-2 text-xs text-neutral-600">
                              <span>Planted: {formatDate(crop.planting_date)}</span>
                              {crop.expected_harvest_date && (
                                <span>Expected harvest: {formatDate(crop.expected_harvest_date)}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Card className="p-8 text-center">
                  <CardContent className="pt-6">
                    <div className="inline-flex items-center justify-center bg-[#9CCC65] bg-opacity-20 w-16 h-16 rounded-full mb-4">
                      <span className="material-icons text-3xl text-[#8BC34A]">grass</span>
                    </div>
                    <h3 className="text-xl font-poppins font-semibold text-neutral-800 mb-2">No crops added yet</h3>
                    <p className="text-neutral-600 mb-6">
                      Start tracking your farm's activities by adding your first crop.
                    </p>
                    <Button 
                      className="bg-[#2E7D32] hover:bg-[#1b5e20]" 
                      onClick={() => setAddCropOpen(true)}
                    >
                      <span className="material-icons text-sm mr-1">add</span>
                      Add Your First Crop
                    </Button>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>
        
        <TabsContent value="expenses">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-poppins font-medium text-neutral-800">Expense Records</h2>
            
            <Dialog open={addExpenseOpen} onOpenChange={setAddExpenseOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#2E7D32] hover:bg-[#1b5e20]">
                  <span className="material-icons text-sm mr-1">add</span>
                  Record Expense
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Record New Expense</DialogTitle>
                </DialogHeader>
                
                <Form {...expenseForm}>
                  <form onSubmit={expenseForm.handleSubmit(onExpenseSubmit)} className="space-y-4 pt-4">
                    <FormField
                      control={expenseForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expense Title</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Fertilizer Purchase" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={expenseForm.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount (₹)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1" 
                              {...field}
                              onChange={e => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={expenseForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select 
                            defaultValue={field.value} 
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="seeds">Seeds</SelectItem>
                              <SelectItem value="fertilizers">Fertilizers</SelectItem>
                              <SelectItem value="pesticides">Pesticides</SelectItem>
                              <SelectItem value="labor">Labor Wages</SelectItem>
                              <SelectItem value="equipment">Equipment</SelectItem>
                              <SelectItem value="irrigation">Irrigation</SelectItem>
                              <SelectItem value="transport">Transportation</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={expenseForm.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={expenseForm.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes (Optional)</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Any additional details about this expense" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end space-x-4 pt-2">
                      <Button type="button" variant="outline" onClick={() => setAddExpenseOpen(false)}>
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        className="bg-[#2E7D32] hover:bg-[#1b5e20]"
                        disabled={addExpenseMutation.isPending}
                      >
                        {addExpenseMutation.isPending ? "Recording..." : "Record Expense"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          
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
            <>
              {expenses && expenses.length > 0 ? (
                <div className="space-y-3">
                  {expenses.map((expense) => (
                    <div key={expense.id} className="flex justify-between items-center pb-3 border-b border-neutral-200">
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
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center">
                  <CardContent className="pt-6">
                    <div className="inline-flex items-center justify-center bg-[#A1887F] bg-opacity-20 w-16 h-16 rounded-full mb-4">
                      <span className="material-icons text-3xl text-[#795548]">receipt_long</span>
                    </div>
                    <h3 className="text-xl font-poppins font-semibold text-neutral-800 mb-2">No expenses recorded yet</h3>
                    <p className="text-neutral-600 mb-6">
                      Keep track of your farm expenses by recording your first expense.
                    </p>
                    <Button 
                      className="bg-[#2E7D32] hover:bg-[#1b5e20]" 
                      onClick={() => setAddExpenseOpen(true)}
                    >
                      <span className="material-icons text-sm mr-1">add</span>
                      Record Your First Expense
                    </Button>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
