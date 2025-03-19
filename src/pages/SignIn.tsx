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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText, Mail, Lock, Loader2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useEffect } from "react";

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

  // Using React Query mutation for login
  const loginMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      return login(values.email, values.password);
    },
    onSuccess: () => {
      toast("Sign in successful", {
        description: "Welcome back!",
      });
      navigate("/home");
    },
    onError: (error: unknown) => {
      console.error("Login error:", error);
      toast("Sign in failed", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });

      if (error instanceof Error && error.message.includes("credentials")) {
        form.setError("email", {
          type: "manual",
          message: "Invalid email or password",
        });
        form.setError("password", {
          type: "manual",
          message: "Invalid email or password",
        });
      }
    },
  });

  // Clear error when form values change
  useEffect(() => {
    const subscription = form.watch(() => {
      if (loginMutation.isError) {
        loginMutation.reset();
      }
    });

    return () => subscription.unsubscribe();
  }, [form, loginMutation]);

  // Clear error after 5 seconds
  useEffect(() => {
    if (loginMutation.isError) {
      const timer = setTimeout(() => {
        loginMutation.reset();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [loginMutation.isError, loginMutation]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    loginMutation.mutate(values);
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-background to-background/95">
      <div className="w-full max-w-md px-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 flex flex-col items-center"
        >
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 shadow-md">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-foreground">
            PDF Chatbot
          </h1>
          <p className="text-muted-foreground">Sign in to your account</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <Card className="overflow-hidden border bg-card shadow-lg text-center">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold">
                Welcome back
              </CardTitle>
              <CardDescription>
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="space-y-2 text-left">
                        <FormLabel className="text-sm font-medium text-left block text-muted-foreground">
                          Email
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="name@example.com"
                              className="h-11 pl-10 rounded-md transition-colors focus:border-primary"
                              autoComplete="email"
                              disabled={loginMutation.isPending}
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs text-left" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="space-y-2 text-left">
                        <FormLabel className="text-sm font-medium text-left block text-muted-foreground">
                          Password
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="password"
                              className="h-11 pl-10 rounded-md transition-colors focus:border-primary"
                              autoComplete="current-password"
                              disabled={loginMutation.isPending}
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs text-left" />
                      </FormItem>
                    )}
                  />

                  {loginMutation.isError &&
                    !form.formState.errors.email &&
                    !form.formState.errors.password && (
                      <Alert variant="destructive" className="py-2">
                        <div className="flex items-center">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="text-sm ml-2 mx-auto">
                            {loginMutation.error instanceof Error
                              ? loginMutation.error.message
                              : "An error occurred. Please try again."}
                          </AlertDescription>
                        </div>
                      </Alert>
                    )}

                  <Button
                    className="mt-4 w-full h-11 font-medium"
                    type="submit"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </div>
                    ) : (
                      "Sign in"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>

            <CardFooter className="flex justify-center border-t px-6 py-4 bg-muted/30">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="font-medium text-primary hover:underline"
                >
                  Sign up
                </Link>
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
