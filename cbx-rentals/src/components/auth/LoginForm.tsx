import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { useToast } from '../ui/use-toast';
import { LockIcon } from 'lucide-react';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const { toast } = useToast();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    
    try {
      const success = await login(data.username, data.password);
      
      if (success) {
        toast({
          title: 'Success',
          description: 'You have been logged in successfully.',
        });
        
        // Check if user is an attendee and hasn't checked in
        const authState = useAuthStore.getState();
        if (authState.userType === 'attendee' && authState.attendeeData && !authState.attendeeData.checked_in) {
          navigate('/check-in');
        } else {
          navigate('/');
        }
      } else {
        toast({
          title: 'Login failed',
          description: 'Invalid username or password.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Login error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    }
    
    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-md bg-[#303030] border-[#303030]">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-[#e50914] rounded-full">
            <LockIcon className="h-6 w-6 text-white" />
          </div>
        </div>
        <CardTitle className="text-2xl text-center text-white">CBX Rentals Admin</CardTitle>
        <CardDescription className="text-center text-gray-400">
          Enter your credentials to access the dashboard
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Username / Last Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Admin: cbxadmin | Attendee: Last name"
                      type="text"
                      autoComplete="username"
                      disabled={isLoading}
                      className="bg-black border-[#505050] text-white placeholder:text-gray-500"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Password / Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Admin: password | Attendee: 10-digit phone"
                      type="text"
                      autoComplete="current-password"
                      disabled={isLoading}
                      className="bg-black border-[#505050] text-white placeholder:text-gray-500"
                      {...field}
                      onChange={(e) => {
                        // For phone numbers, only allow digits
                        const value = e.target.value;
                        // If it looks like a phone number (starts with digit), only allow digits
                        if (value.length > 0 && /^\d/.test(value[0])) {
                          const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
                          field.onChange(digitsOnly);
                        } else {
                          // Allow regular password input for admin
                          field.onChange(value);
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full bg-[#e50914] hover:bg-[#b90710] text-white" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}