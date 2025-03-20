import axios from "axios";
import Cookies from "js-cookie";

const COOKIE_TOKEN_NAME = "auth_token";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

export const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor - adds auth token to all requests
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

// Response interceptor - handles auth errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401) {
      Cookies.remove(COOKIE_TOKEN_NAME, { path: "/" });
      localStorage.removeItem("user");
      window.location.href = "/signin";
    }

    return Promise.reject(error);
  }
);
