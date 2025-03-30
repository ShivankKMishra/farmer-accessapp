import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

const profileSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().min(10, { message: "Phone number must be at least 10 digits" }),
  location: z.string().min(2, { message: "Location must be at least 2 characters" }),
  farmSize: z.string().optional(),
  cropTypes: z.string().optional(),
  bio: z.string().max(300, { message: "Bio must be less than 300 characters" }).optional(),
});

export default function Profile() {
  const { user, isAuthenticated, isLoading, updateProfile } = useAuth();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  
  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      location: user?.location || '',
      farmSize: user?.farmSize || '',
      cropTypes: user?.cropTypes || '',
      bio: user?.bio || '',
    },
  });
  
  const onSubmit = async (data: z.infer<typeof profileSchema>) => {
    setIsUpdating(true);
    const success = await updateProfile(data);
    setIsUpdating(false);
    
    if (success) {
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
    }
  };
  
  // If not authenticated, show login prompt
  if (!isAuthenticated && !isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-poppins">Profile</CardTitle>
            <CardDescription>
              Login to view and edit your profile information.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <div className="inline-flex items-center justify-center bg-[#4caf50] bg-opacity-20 w-16 h-16 rounded-full">
              <span className="material-icons text-3xl text-[#2E7D32]">person</span>
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
  
  // If loading user data, show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-poppins">Loading Profile...</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <div className="inline-flex items-center justify-center bg-[#4caf50] bg-opacity-20 w-16 h-16 rounded-full">
              <span className="material-icons text-3xl text-[#2E7D32] animate-spin">refresh</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-poppins font-semibold text-neutral-800 mb-2">Your Profile</h1>
        <p className="text-neutral-600">Manage your account information and preferences</p>
      </div>
      
      <Tabs defaultValue="general" className="max-w-2xl mx-auto">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="general">General Information</TabsTrigger>
          <TabsTrigger value="farming">Farming Details</TabsTrigger>
        </TabsList>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle>General Information</CardTitle>
                  <CardDescription>Update your basic account information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-center mb-4">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full overflow-hidden bg-neutral-200 flex items-center justify-center">
                        {user?.profile_pic ? (
                          <img 
                            src={user.profile_pic} 
                            alt={user.name || 'Profile'} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="material-icons text-5xl text-neutral-400">person</span>
                        )}
                      </div>
                      <div className="absolute bottom-0 right-0 bg-[#2E7D32] rounded-full p-1 cursor-pointer">
                        <span className="material-icons text-white text-base">edit</span>
                      </div>
                    </div>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="+91 9876543210" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="email@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="City, State" {...field} />
                        </FormControl>
                        <FormDescription>
                          Your location helps us provide relevant weather and market information
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell us a bit about yourself and your farming experience" 
                            {...field} 
                            className="min-h-[100px]"
                          />
                        </FormControl>
                        <FormDescription>
                          Maximum 300 characters
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="farming">
              <Card>
                <CardHeader>
                  <CardTitle>Farming Details</CardTitle>
                  <CardDescription>Information about your farm and agricultural activities</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="farmSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Farm Size (in acres)</FormLabel>
                          <FormControl>
                            <Input type="text" placeholder="e.g. 5" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="cropTypes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Main Crops</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Wheat, Rice, Tomatoes" {...field} />
                          </FormControl>
                          <FormDescription>
                            Separate multiple crops with commas
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div>
                    <FormLabel>Farming Type</FormLabel>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select farming type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="traditional">Traditional</SelectItem>
                        <SelectItem value="organic">Organic</SelectItem>
                        <SelectItem value="mixed">Mixed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Farming Experience</h3>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select experience level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner (0-2 years)</SelectItem>
                        <SelectItem value="intermediate">Intermediate (3-5 years)</SelectItem>
                        <SelectItem value="experienced">Experienced (6-10 years)</SelectItem>
                        <SelectItem value="expert">Expert (10+ years)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <div className="mt-6 flex justify-end">
              <Button 
                type="submit" 
                className="bg-[#2E7D32] hover:bg-[#1b5e20]"
                disabled={isUpdating}
              >
                {isUpdating ? "Saving Changes..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </Tabs>
    </div>
  );
}
