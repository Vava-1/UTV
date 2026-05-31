import { api } from "./api";
import type { User } from "@/types";

interface LoginResponse {
  user: User;
  access_token: string;
  refresh_token: string;
  token_type: string;
}

interface RegisterData {
  email: string;
  username: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const { data } = await api.post("/auth/login", { email, password });
    return data;
  },

  register: async (registerData: RegisterData): Promise<LoginResponse> => {
    const { data } = await api.post("/auth/register", registerData);
    return data;
  },

  logout: async (): Promise<void> => {
    await api.post("/auth/logout");
  },

  me: async (): Promise<User> => {
    const { data } = await api.get("/auth/me");
    return data;
  },

  forgotPassword: async (email: string): Promise<void> => {
    await api.post("/auth/forgot-password", { email });
  },

  resetPassword: async (token: string, new_password: string): Promise<void> => {
    await api.post("/auth/reset-password", { token, new_password });
  },
};
