import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/context/AuthContext";
import { GoogleLogin } from "@react-oauth/google";
import { authApi } from "@/lib/api/auth";
import { storeAuthToken } from "@/lib/axiosInterceptor";
import { toast } from "sonner";

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

  return (
    <div className="w-full">
      <GoogleLogin
        width="100%"
        theme="outline"
        size="large"
        text={mode === 'signin' ? "signin_with" : "signup_with"}
        onSuccess={async (credentialResponse) => {
          try {
            if (!credentialResponse.credential) {
              throw new Error('No credential received');
            }

            const response = await handleGoogleAuth(credentialResponse.credential, mode);
            
            storeAuthToken(response.access_token);
            localStorage.setItem("user", JSON.stringify(response.user));
            setUser(response.user);
            
            navigate("/home");
          } catch (error) {
            console.error("Google auth failed:", error);
            toast.error("Failed to authenticate with Google");
          }
        }}
        onError={() => {
          console.error("Google auth failed");
          toast.error("Failed to authenticate with Google");
        }}
      />
    </div>
  );
}; 