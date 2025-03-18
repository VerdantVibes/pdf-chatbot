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

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

const handleApiError = async (error: any, defaultMessage: string) => {
  console.error("API Error:", error);

  if (error instanceof TypeError && error.message === "Failed to fetch") {
    throw new Error(
      "Unable to connect to the server. Please check if the backend is running."
    );
  }

  try {
    const data = (await error.response?.json()) as ApiError;
    throw new Error(data?.detail || defaultMessage);
  } catch (e) {
    throw new Error(defaultMessage);
  }
};

const getAuthHeaders = () => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  return headers;
};

export const authApi = {
  login: async (credentials: {
    email: string;
    password: string;
  }): Promise<LoginResponse> => {
    try {
      console.log("Attempting login to:", `${API_URL}/auth/login`);
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(credentials),
        credentials: "include",
      });

      if (!response.ok) {
        throw response;
      }

      const data = await response.json();
      return data as LoginResponse;
    } catch (error) {
      throw await handleApiError(error, "Login failed");
    }
  },

  register: async (userData: {
    email: string;
    password: string;
    name: string;
  }): Promise<RegisterResponse> => {
    try {
      console.log("Attempting registration to:", `${API_URL}/auth/register`);
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(userData),
        credentials: "include",
      });

      if (!response.ok) {
        throw response;
      }

      const data = await response.json();
      return data as RegisterResponse;
    } catch (error) {
      throw await handleApiError(error, "Registration failed");
    }
  },

  validateToken: async (): Promise<User> => {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        method: "GET",
        headers: getAuthHeaders(),
        credentials: "include",
      });

      if (!response.ok) {
        throw response;
      }

      const data = await response.json();
      return data as User;
    } catch (error) {
      throw await handleApiError(error, "Token validation failed");
    }
  },

  logout: async (): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
      });

      if (!response.ok) {
        throw response;
      }
    } catch (error) {
      throw await handleApiError(error, "Logout failed");
    }
  },
};
