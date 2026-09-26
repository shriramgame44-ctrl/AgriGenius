import React, { createContext, useContext, useState, useEffect } from "react";
import { apiClient } from "./client";
import { User, AuthResponse } from "../types";

const DEFAULT_DEMO_USER: User = {
  id: "demo-farmer-1",
  email: "farmer@agrigenius.io",
  fullName: "S. Gurpreet Singh",
  farmName: "Rampur Agricultural Zone",
  locationRegion: "Punjab Agricultural Belt",
  preferredUnits: "METRIC",
};

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
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem("agrigenius_user");
      return savedUser ? JSON.parse(savedUser) : DEFAULT_DEMO_USER;
    } catch {
      return DEFAULT_DEMO_USER;
    }
  });

  const [token, setToken] = useState<string | null>(() => localStorage.getItem("agrigenius_token") || "demo-token");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem("agrigenius_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("agrigenius_user");
    }
  }, [user]);

  const login = async (credentials: { email: string; password: string }) => {
    try {
      const res = await apiClient<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      });

      if (res.token && res.user) {
        localStorage.setItem("agrigenius_token", res.token);
        setToken(res.token);
        setUser(res.user);
        return;
      }
    } catch (e) {
      console.warn("Backend auth offline/unavailable, using local farmer session");
    }

    // Fallback demo login
    setUser({
      ...DEFAULT_DEMO_USER,
      email: credentials.email || DEFAULT_DEMO_USER.email,
    });
    setToken("demo-token");
  };

  const register = async (data: {
    email: string;
    password: string;
    fullName: string;
    farmName?: string;
    locationRegion?: string;
    preferredUnits: "METRIC" | "IMPERIAL";
  }) => {
    try {
      const res = await apiClient<AuthResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (res.token && res.user) {
        localStorage.setItem("agrigenius_token", res.token);
        setToken(res.token);
        setUser(res.user);
        return;
      }
    } catch (e) {
      console.warn("Backend auth offline/unavailable, using local registration");
    }

    const newUser: User = {
      id: "u-" + Date.now(),
      email: data.email,
      fullName: data.fullName,
      farmName: data.farmName || "My Farm",
      locationRegion: data.locationRegion || "Agricultural Zone",
      preferredUnits: data.preferredUnits,
    };
    setUser(newUser);
    setToken("demo-token");
  };

  const logout = async () => {
    try {
      await apiClient("/auth/logout", { method: "POST" });
    } catch (err) {
      console.warn("Logout request failed:", err);
    } finally {
      localStorage.removeItem("agrigenius_token");
      localStorage.removeItem("agrigenius_user");
      // Reset back to demo farmer for frictionless access
      setUser(DEFAULT_DEMO_USER);
      setToken("demo-token");
    }
  };

  const updateProfile = async (profileData: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...profileData } : DEFAULT_DEMO_USER));
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
