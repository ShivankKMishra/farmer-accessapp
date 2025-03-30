import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/lib/auth';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AuthFormProps {
  isLoginMode: boolean;
}

const phoneSchema = z.object({
  phone: z.string().min(10, { message: "Phone number must be at least 10 digits" }),
});

const loginSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const registerSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 digits" }),
  email: z.string().email({ message: "Please enter a valid email address" }).optional().or(z.literal('')),
  role: z.enum(["farmer", "buyer", "expert"]),
  location: z.string().optional(),
});

export default function AuthForm({ isLoginMode }: AuthFormProps) {
  const [, navigate] = useLocation();
  const { login, phoneLogin, register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState<'regular' | 'phone'>('regular');
  const [selectedRole, setSelectedRole] = useState<'farmer' | 'buyer' | 'expert'>('farmer');

  // Regular login form
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  // Phone login form
  const phoneForm = useForm<z.infer<typeof phoneSchema>>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phone: '',
    },
  });

  // Register form
  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      password: '',
      name: '',
      phone: '',
      email: '',
      role: 'farmer',
      location: '',
    },
  });

  const onLoginSubmit = async (data: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    const success = await login(data.username, data.password);
    setIsLoading(false);
    
    if (success) {
      navigate('/');
    }
  };

  const onPhoneLoginSubmit = async (data: z.infer<typeof phoneSchema>) => {
    setIsLoading(true);
    const success = await phoneLogin(data.phone);
    setIsLoading(false);
    
    if (success) {
      navigate('/');
    }
  };

  const onRegisterSubmit = async (data: z.infer<typeof registerSchema>) => {
    setIsLoading(true);
    const success = await register({
      ...data,
      role: selectedRole,
    });
    setIsLoading(false);
    
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-[#4caf50] bg-opacity-20 w-16 h-16 rounded-full mb-4">
            <span className="material-icons text-3xl text-[#2E7D32]">eco</span>
          </div>
          <h2 className="text-2xl font-poppins font-semibold text-neutral-800">
            Welcome to FarmerAccess
          </h2>
          <p className="text-neutral-600 mt-1">
            {isLoginMode ? 'Sign in to continue' : 'Create a new account'}
          </p>
        </div>
        
        <div className="space-y-6">
          {isLoginMode ? (
            <Tabs defaultValue="regular" onValueChange={(value) => setAuthMethod(value as 'regular' | 'phone')}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="regular">Username & Password</TabsTrigger>
                <TabsTrigger value="phone">Phone Number</TabsTrigger>
              </TabsList>
              
              <TabsContent value="regular">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" className="w-full bg-[#2E7D32] hover:bg-[#1b5e20]" disabled={isLoading}>
                      {isLoading ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
              
              <TabsContent value="phone">
                <Form {...phoneForm}>
                  <form onSubmit={phoneForm.handleSubmit(onPhoneLoginSubmit)} className="space-y-4">
                    <FormField
                      control={phoneForm.control}
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
                    
                    <Button type="submit" className="w-full bg-[#2E7D32] hover:bg-[#1b5e20]" disabled={isLoading}>
                      {isLoading ? "Sending OTP..." : "Send OTP"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          ) : (
            <Form {...registerForm}>
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                <FormField
                  control={registerForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={registerForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={registerForm.control}
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
                
                <FormField
                  control={registerForm.control}
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
                  control={registerForm.control}
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
                
                <FormField
                  control={registerForm.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="City, State" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full bg-[#2E7D32] hover:bg-[#1b5e20]" disabled={isLoading}>
                  {isLoading ? "Creating Account..." : "Register"}
                </Button>
              </form>
            </Form>
          )}
          
          <div className="text-center text-sm text-neutral-600">
            {isLoginMode ? (
              <p>New to FarmerAccess? <a href="/register" className="font-medium text-[#2E7D32] hover:text-[#1b5e20]">Register now</a></p>
            ) : (
              <p>Already have an account? <a href="/login" className="font-medium text-[#2E7D32] hover:text-[#1b5e20]">Log in</a></p>
            )}
          </div>
        </div>
      </div>
      
      <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200">
        <div className="flex justify-center space-x-4">
          <span className="text-sm text-neutral-600">Choose your role:</span>
          <div className="flex space-x-3">
            <span 
              className={`text-sm ${selectedRole === 'farmer' ? 'text-[#2E7D32] font-medium' : 'text-neutral-600 cursor-pointer'}`}
              onClick={() => setSelectedRole('farmer')}
            >
              Farmer
            </span>
            <span 
              className={`text-sm ${selectedRole === 'buyer' ? 'text-[#2E7D32] font-medium' : 'text-neutral-600 cursor-pointer'}`}
              onClick={() => setSelectedRole('buyer')}
            >
              Buyer
            </span>
            <span 
              className={`text-sm ${selectedRole === 'expert' ? 'text-[#2E7D32] font-medium' : 'text-neutral-600 cursor-pointer'}`}
              onClick={() => setSelectedRole('expert')}
            >
              Expert
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
