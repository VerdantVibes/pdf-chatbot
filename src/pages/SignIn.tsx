import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/lib/context/AuthContext";
import { Loader2 } from "lucide-react";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { MicrosoftSignInButton } from "@/components/auth/MicrosoftSignInButton";

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

export function SignIn() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      return login(values.email, values.password);
    },
    onSuccess: () => {
      toast.success("Sign in successful");
      navigate("/home");
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : "Failed to sign in");
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    loginMutation.mutate(values);
  }

  return (
    <div className="grid lg:grid-cols-2 min-h-screen relative">
      {/* Logo positioned absolutely at the top */}
      <div className="absolute top-8 left-8 lg:block hidden">
        <div className="flex items-center justify-center gap-2 rounded-[6px]">
          <img 
            src="/delphis.svg" 
            alt="Delphis AI"
            className="w-5 h-5" 
          />
          <span className="text-[14px] leading-none font-semibold text-[#18181B] font-sans truncate">
            Delphis AI
          </span>
        </div>
      </div>

      {/* Mobile Logo */}
      <div className="lg:hidden flex justify-center pt-8 mb-4">
        <div className="flex items-center gap-2">
          <img 
            src="/delphis.svg" 
            alt="Delphis AI"
            className="w-5 h-5" 
          />
          <span className="text-[14px] leading-none font-semibold text-[#18181B] font-sans">
            Delphis AI
          </span>
        </div>
      </div>

      {/* Left Column - Login Form */}
      <div className="flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-[400px] space-y-6">
          {/* Login Form Section */}
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold tracking-tight">Login to your account</h1>
              <p className="text-sm text-muted-foreground mt-2">
                Enter your email below to login to your account
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="name@example.com" 
                          type="email"
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
                      <div className="flex justify-between items-center">
                        <FormLabel>Password</FormLabel>
                        <Link 
                          to="/forgot-password"
                          className="text-sm text-primary hover:underline"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <FormControl>
                        <Input 
                          type="password"
                          placeholder="Enter your password" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </form>
            </Form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="grid gap-3">
              <GoogleSignInButton mode="signin" />
              <MicrosoftSignInButton mode="signin" />
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-primary hover:underline font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Column - Image/Illustration */}
      <div className="hidden lg:block bg-muted">
        <div className="h-full w-full flex items-center justify-center p-8">
          <div className="relative w-full max-w-[600px] aspect-square">
          </div>
        </div>
      </div>
    </div>
  );
}
