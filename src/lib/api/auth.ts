import { axiosInstance } from "../axiosInterceptor";

interface User {
  id: string;
  email: string;
  name: string;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

interface RegisterResponse {
  access_token: string;
  token_type: string;
  user: User;
}

interface ApiError {
  detail: string;
}

const handleApiError = (error: any, defaultMessage: string) => {
  console.error("API Error:", error);

  if (error.message === "Network Error") {
    throw new Error("Unable to connect to the server.");
  }

  const data = error.response?.data as ApiError | undefined;
  throw new Error(data?.detail || defaultMessage);
};

export const authApi = {
  login: async (credentials: { email: string; password: string }): Promise<LoginResponse> => {
    try {
      console.log("Attempting login");
      const response = await axiosInstance.post("/auth/login", credentials);
      return response.data as LoginResponse;
    } catch (error) {
      throw handleApiError(error, "Login failed");
    }
  },

  register: async (userData: { email: string; password: string; name: string }): Promise<RegisterResponse> => {
    try {
      console.log("Attempting registration");
      const response = await axiosInstance.post("/auth/register", userData);
      return response.data as RegisterResponse;
    } catch (error) {
      throw handleApiError(error, "Registration failed");
    }
  },
};
