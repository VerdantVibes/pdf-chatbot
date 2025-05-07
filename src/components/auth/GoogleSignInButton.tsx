import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/context/AuthContext";
import { useGoogleLogin } from "@react-oauth/google";
import { authApi } from "@/lib/api/auth";
import { storeAuthToken } from "@/lib/axiosInterceptor";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface GoogleSignInButtonProps {
  mode: 'signin' | 'signup';
}

export const GoogleSignInButton = ({ mode }: GoogleSignInButtonProps) => {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleGoogleAuth = async (credential: string, initialMode: 'signin' | 'signup') => {
    try {
      // First attempt with the initial mode
      try {
        const response = await authApi.googleLogin({
          credential,
          mode: initialMode
        });
        return response;
      } catch (error: any) {
        // If initial mode fails, try the opposite mode
        if (error?.response?.status === 401) {
          const oppositeMode = initialMode === 'signin' ? 'signup' : 'signin';
          const response = await authApi.googleLogin({
            credential,
            mode: oppositeMode
          });
          
          // Show appropriate message for mode switch
          if (initialMode === 'signin') {
            toast.success("New account created with Google");
          } else {
            toast.success("Signed in with existing account");
          }
          
          return response;
        }
        throw error;
      }
    } catch (error) {
      console.error("Google auth failed:", error);
      throw error;
    }
  };

  const login = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        const { access_token } = response;
        if (!access_token) {
          throw new Error('No credential received');
        }

        const authResponse = await handleGoogleAuth(access_token, mode);
        
        storeAuthToken(authResponse.access_token);
        localStorage.setItem("user", JSON.stringify(authResponse.user));
        setUser(authResponse.user);
        
        navigate("/home");
      } catch (error) {
        console.error("Google auth failed:", error);
        toast.error("Failed to authenticate with Google");
      }
    },
    onError: () => {
      console.error("Google auth failed");
      toast.error("Failed to authenticate with Google");
    }
  });

  return (
    <Button 
      variant="outline" 
      className="w-full" 
      onClick={() => login()}
    >
      <img src="/gmail.svg" alt="Google" className="mr-2 h-7 w-7" />
      {mode === 'signin' ? "Connect with Gmail" : "Sign up with Google"}
    </Button>
  );
}; 