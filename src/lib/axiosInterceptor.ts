import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";

const COOKIE_TOKEN_NAME = "auth_token";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

export const AUTH_ERROR_EVENT = "auth_error";
export const createAuthErrorEvent = (message: string) => {
  return new CustomEvent(AUTH_ERROR_EVENT, {
    detail: { message },
  });
};

export const handleSessionExpiration = () => {
  console.log("Handling session expiration");

  Cookies.remove(COOKIE_TOKEN_NAME, { path: "/" });
  localStorage.removeItem("user");

  const errorMessage = "Your session has expired. Please log in again.";
  window.dispatchEvent(createAuthErrorEvent(errorMessage));
};

export const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = Cookies.get(COOKIE_TOKEN_NAME);
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const isUnauthorized = error.response?.status === 401;

    const responseData = error.response?.data as Record<string, unknown> | undefined;
    const errorDetail = responseData?.detail;
    const hasInvalidToken =
      errorDetail === "Invalid token" || (typeof errorDetail === "string" && errorDetail.includes("token"));

    const isCORS = error.message.includes("Network Error") || error.message.includes("CORS");

    if (isUnauthorized || hasInvalidToken || (isCORS && Cookies.get(COOKIE_TOKEN_NAME))) {
      console.log("Auth error detected:", {
        isUnauthorized,
        hasInvalidToken,
        isCORS,
        errorData: error.response?.data,
        errorMessage: error.message,
      });

      handleSessionExpiration();
    }

    return Promise.reject(error);
  }
);
