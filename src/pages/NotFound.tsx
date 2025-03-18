import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/context/AuthContext";
import { ArrowLeft, Home } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { motion } from "framer-motion";

export function NotFound() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Card className="border shadow-sm bg-card overflow-hidden">
          <CardContent className="flex flex-col items-center justify-center pt-10 pb-6">
            <div className="rounded-full bg-muted p-6 mb-6">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-foreground"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.3-4.3"></path>
                </svg>
              </motion.div>
            </div>

            <CardTitle className="text-6xl font-bold text-foreground mb-2">
              404
            </CardTitle>
            <CardDescription className="text-xl font-medium mb-4">
              Page Not Found
            </CardDescription>

            <p className="text-muted-foreground text-center mb-6">
              The page you're looking for doesn't exist or has been moved.
            </p>

            <div className="h-px w-12 bg-border mb-6"></div>
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row justify-center gap-4 px-6 pb-6">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="gap-2 w-full sm:w-auto"
              size="lg"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>

            <Button
              onClick={() => navigate(isAuthenticated ? "/home" : "/signin")}
              className="gap-2 w-full sm:w-auto"
              size="lg"
              variant="default"
            >
              <Home className="h-4 w-4" />
              {isAuthenticated ? "Dashboard" : "Sign In"}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
