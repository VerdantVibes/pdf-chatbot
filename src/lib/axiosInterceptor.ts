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
  localStorage.removeItem(COOKIE_TOKEN_NAME);
  localStorage.removeItem("user");

  const errorMessage = "Your session has expired. Please log in again.";
  window.dispatchEvent(createAuthErrorEvent(errorMessage));
};

const logTokenStatus = () => {
  const token = Cookies.get(COOKIE_TOKEN_NAME);
  if (!token) {
    console.warn("No authentication token found in cookies");

    const cookieString = document.cookie;
    console.log("Document cookies:", cookieString);

    if (cookieString.includes(COOKIE_TOKEN_NAME)) {
      console.log("Token found in document.cookie but may be inaccessible via js-cookie");
    }
  } else {
    console.log("Token found in cookies:", token.substring(0, 15) + "...");
  }
};

logTokenStatus();

export const storeAuthToken = (token: string) => {
  Cookies.set(COOKIE_TOKEN_NAME, token, {
    path: "/",
    sameSite: "lax",
    secure: window.location.protocol === "https:",
  });

  localStorage.setItem(COOKIE_TOKEN_NAME, token);

  console.log("Auth token stored successfully");
};

export const getAuthToken = (): string | undefined => {
  let token = Cookies.get(COOKIE_TOKEN_NAME);

  if (!token) {
    const localToken = localStorage.getItem(COOKIE_TOKEN_NAME);

    if (localToken) {
      console.log("Restoring token from localStorage to cookie");
      Cookies.set(COOKIE_TOKEN_NAME, localToken, {
        path: "/",
        sameSite: "lax",
        secure: window.location.protocol === "https:",
      });
      token = localToken;
    }
  }

  return token;
};

export const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAuthToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;

      console.log(`Added token to request: ${config.url}`);
    } else {
      console.warn(`No token found for request to ${config.url}`);

      const cookieString = document.cookie;
      const tokenMatch = cookieString.match(new RegExp(`${COOKIE_TOKEN_NAME}=([^;]+)`));

      if (tokenMatch && tokenMatch[1]) {
        const extractedToken = tokenMatch[1];
        console.log(`Found token in document.cookie for ${config.url}`);
        config.headers.Authorization = `Bearer ${extractedToken}`;

        storeAuthToken(extractedToken);
      }
    }

    console.debug("Request headers:", config.headers);

    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    console.error("API Error:", error.message, error.response?.status, error.config?.url);

    const isUnauthorized = error.response?.status === 401;

    const responseData = error.response?.data as Record<string, unknown> | undefined;
    const errorDetail = responseData?.detail;
    const hasInvalidToken =
      errorDetail === "Invalid token" || (typeof errorDetail === "string" && errorDetail.includes("token"));

    const isCORS = error.message.includes("Network Error") || error.message.includes("CORS");

    if (isUnauthorized || hasInvalidToken) {
      console.log("Auth error detected:", {
        isUnauthorized,
        hasInvalidToken,
        errorData: error.response?.data,
        errorMessage: error.message,
      });

      handleSessionExpiration();
    } else if (isCORS) {
      console.error("CORS error detected. Please check your API configuration and Vite proxy settings.");
    }

    return Promise.reject(error);
  }
);
