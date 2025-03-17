import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { authApi } from "@/lib/api/auth"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Link } from "react-router-dom"
import { toast } from "sonner"

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
})

export function SignIn() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    
    try {
      const data = await authApi.login(values);
      
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      toast("Signed in successfully", {
        description: "Welcome back!"
      });
      
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      form.setError('root', { 
        message: error instanceof Error ? error.message : 'Login failed. Please try again.' 
      });
      
      toast("Login failed", {
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="mx-auto w-full max-w-[350px] space-y-6">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Sign in to your account
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your email and password to sign in
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="name@example.com" {...field} />
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
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading && (
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent" />
              )}
              Sign In
            </Button>
          </form>
        </Form>

        <p className="px-8 text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="underline underline-offset-4 hover:text-primary"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
