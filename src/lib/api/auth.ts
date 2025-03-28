import { axiosInstance } from "../axiosInterceptor";
import { LoginRequest, RegisterRequest, GoogleLoginRequest } from "../types/auth";

// interface ApiError {
//   detail: string;
// }

// const handleApiError = (error: any, defaultMessage: string) => {
//   console.error("API Error:", error);
//
//   if (error.message === "Network Error") {
//     throw new Error("Unable to connect to the server.");
//   }
//
//   const data = error.response?.data as ApiError | undefined;
//   throw new Error(data?.detail || defaultMessage);
// };

export const authApi = {
  login: async (data: LoginRequest) => {
    const response = await axiosInstance.post("/auth/login", data);
    return response.data;
  },

  register: async (data: RegisterRequest) => {
    const response = await axiosInstance.post("/auth/register", data);
    return response.data;
  },

  googleLogin: async (data: GoogleLoginRequest) => {
    const response = await axiosInstance.post("/auth/google/login", data);
    return response.data;
  }
};
