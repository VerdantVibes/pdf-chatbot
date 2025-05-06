import { Link } from "react-router-dom";
import { Mail } from "lucide-react";

export function ResetPasswordSuccess() {
  return (
    <div className="min-h-screen w-full bg-background">
      <div className="flex flex-col items-center justify-center min-h-screen max-w-[400px] mx-auto px-4">
        <div className="w-full space-y-6">
          {/* Email Icon */}
          <div className="flex justify-center">
            <Mail className="w-8 h-8 text-muted-foreground" />
          </div>

          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">
              Check your e-mail for next steps!
            </h1>
            <p className="text-sm text-muted-foreground">
              Need to go back?{" "}
              <Link to="/signin" className="text-primary hover:underline">
                Back to Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 