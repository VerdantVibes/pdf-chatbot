import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { authApi } from "../api/auth";
import { toast } from "sonner";
import { AUTH_ERROR_EVENT, storeAuthToken } from "../axiosInterceptor";

const COOKIE_TOKEN_NAME = "auth_token";

export interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (credential: string, mode: "signin" | "signup") => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // Initialize authentication state
  useEffect(() => {
    const initAuth = () => {
      try {
        // Check for token in both cookie and localStorage
        const token = Cookies.get(COOKIE_TOKEN_NAME) || localStorage.getItem(COOKIE_TOKEN_NAME);
        const storedUser = localStorage.getItem("user");

        if (!token) {
          console.warn("No authentication token found during initialization");
          setIsLoading(false);
          return;
        }

        // If token exists in localStorage but not in cookie, restore it
        if (localStorage.getItem(COOKIE_TOKEN_NAME) && !Cookies.get(COOKIE_TOKEN_NAME)) {
          console.log("Restoring token from localStorage to cookie");
          // Use storeAuthToken to ensure token is in all storage locations
          storeAuthToken(localStorage.getItem(COOKIE_TOKEN_NAME)!);
        }

        // Try to restore user from storage
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            if (userData && userData.id && userData.email) {
              setUser(userData);
              console.log("User restored from local storage");
            } else {
              console.warn("Invalid user data format in storage");
              clearAuthData();
            }
          } catch (error) {
            console.error("Failed to parse stored user data:", error);
            clearAuthData();
          }
        } else {
          console.warn("Token found but no user data available");
          clearAuthData();
        }
      } catch (error) {
        console.error("Error restoring authentication:", error);
        clearAuthData();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Helper to clear auth data
  const clearAuthData = () => {
    Cookies.remove(COOKIE_TOKEN_NAME, { path: "/" });
    localStorage.removeItem(COOKIE_TOKEN_NAME);
    localStorage.removeItem("user");
    setUser(null);
  };

  useEffect(() => {
    const handleAuthError = (event: Event) => {
      console.log("Auth error event received in AuthContext");
      const customEvent = event as CustomEvent;
      const message = customEvent.detail?.message || "Your session has expired. Please log in again.";

      if (user) {
        console.log("User is authenticated, logging out due to token expiration");

        Cookies.remove(COOKIE_TOKEN_NAME, { path: "/" });
        localStorage.removeItem(COOKIE_TOKEN_NAME);
        localStorage.removeItem("user");
        setUser(null);

        toast.error(message, {
          id: "session-expired",
          duration: 4000,
        });

        navigate("/signin", { replace: true });
      }
    };

    window.addEventListener(AUTH_ERROR_EVENT, handleAuthError);

    return () => {
      window.removeEventListener(AUTH_ERROR_EVENT, handleAuthError);
    };
  }, [navigate, user]);

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });
      storeAuthToken(response.access_token);
      localStorage.setItem("user", JSON.stringify(response.user));
      setUser(response.user);
      navigate("/home");
    } catch (error: any) {
      const errorMessage = error.response?.data?.msg || error.message;
      if (errorMessage.includes("Invalid email or password")) {
        toast.error("Incorrect email or password. Please try again.");
      } else if (errorMessage.includes("registered with Google")) {
        toast.error("This account uses Google Sign-In. Please use the 'Sign in with Google' button.");
      } else {
        toast.error("Unable to sign in. Please try again later.");
      }
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.register({ email, password, name });

      storeAuthToken(response.access_token);

      localStorage.setItem("user", JSON.stringify(response.user));

      setUser(response.user);
      navigate("/home");
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    clearAuthData();
    navigate("/signin");
  };

  const loginWithGoogle = async (credential: string, mode: "signin" | "signup") => {
    try {
      const response = await authApi.googleLogin({ credential, mode });
      storeAuthToken(response.access_token);
      localStorage.setItem("user", JSON.stringify(response.user));
      setUser(response.user);
      navigate("/home");
    } catch (error) {
      console.error("Google login error:", error);
      throw error;
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    loginWithGoogle,
    logout,
    register,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
