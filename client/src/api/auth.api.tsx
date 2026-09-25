import React, { createContext, useContext, useState, useEffect } from "react";
import { apiClient } from "./client";
import { User, AuthResponse } from "../types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    fullName: string;
    farmName?: string;
    locationRegion?: string;
    preferredUnits: "METRIC" | "IMPERIAL";
  }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profile: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("agrigenius_token"));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load user profile on mount if token exists
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await apiClient<{ success: boolean; user: User }>("/auth/me");
        if (res.user) {
          setUser(res.user);
        }
      } catch (err) {
        console.error("Session verification failed:", err);
        localStorage.removeItem("agrigenius_token");
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentUser();
  }, [token]);

  const login = async (credentials: { email: string; password: string }) => {
    const res = await apiClient<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    if (res.token && res.user) {
      localStorage.setItem("agrigenius_token", res.token);
      setToken(res.token);
      setUser(res.user);
    }
  };

  const register = async (data: {
    email: string;
    password: string;
    fullName: string;
    farmName?: string;
    locationRegion?: string;
    preferredUnits: "METRIC" | "IMPERIAL";
  }) => {
    const res = await apiClient<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (res.token && res.user) {
      localStorage.setItem("agrigenius_token", res.token);
      setToken(res.token);
      setUser(res.user);
    }
  };

  const logout = async () => {
    try {
      await apiClient("/auth/logout", { method: "POST" });
    } catch (err) {
      console.warn("Logout request failed:", err);
    } finally {
      localStorage.removeItem("agrigenius_token");
      setToken(null);
      setUser(null);
    }
  };

  const updateProfile = async (profileData: Partial<User>) => {
    const res = await apiClient<{ success: boolean; user: User; token?: string }>("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });

    if (res.user) {
      setUser(res.user);
    }
    if (res.token) {
      localStorage.setItem("agrigenius_token", res.token);
      setToken(res.token);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
