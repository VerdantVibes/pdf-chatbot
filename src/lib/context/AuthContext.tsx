import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { authApi } from "../api/auth";
import { toast } from "sonner";
import { AUTH_ERROR_EVENT } from "../axiosInterceptor";

const COOKIE_TOKEN_NAME = "auth_token";
const COOKIE_OPTIONS = {
  expires: 7,
  path: "/",
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
};

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
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get(COOKIE_TOKEN_NAME);
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse user data:", error);
        Cookies.remove(COOKIE_TOKEN_NAME, { path: "/" });
        localStorage.removeItem("user");
      }
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    const handleAuthError = (event: Event) => {
      console.log("Auth error event received in AuthContext");
      const customEvent = event as CustomEvent;
      const message = customEvent.detail?.message || "Your session has expired. Please log in again.";

      if (user) {
        console.log("User is authenticated, logging out due to token expiration");

        Cookies.remove(COOKIE_TOKEN_NAME, { path: "/" });
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
    setIsLoading(true);
    try {
      const response = await authApi.login({ email, password });

      Cookies.set(COOKIE_TOKEN_NAME, response.access_token, COOKIE_OPTIONS);

      localStorage.setItem("user", JSON.stringify(response.user));

      setUser(response.user);
      navigate("/home");
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.register({ email, password, name });

      Cookies.set(COOKIE_TOKEN_NAME, response.access_token, COOKIE_OPTIONS);

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

  const logout = () => {
    Cookies.remove(COOKIE_TOKEN_NAME, { path: "/" });

    localStorage.removeItem("user");

    setUser(null);

    navigate("/signin");
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
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
