import { api } from "./api";
import type { Order, Event, Ticket, PaginatedResponse } from "@/types";

export const ordersApi = {
  list: async (params?: { page?: number; size?: number }): Promise<PaginatedResponse<Order>> => {
    const { data } = await api.get("/orders/", { params });
    return data;
  },

  get: async (id: string): Promise<Order> => {
    const { data } = await api.get(`/orders/${id}`);
    return data;
  },

  createCheckout: async (items: { item_type: string; item_id: string; quantity: number }[]): Promise<{ url: string }> => {
    const { data } = await api.post("/checkout/create-session", items);
    return data;
  },

  checkoutSuccess: async (sessionId: string): Promise<{ success: boolean; downloads: Array<{ type: string; url: string }> }> => {
    const { data } = await api.get("/checkout/success", { params: { session_id: sessionId } });
    return data;
  },
};

export const eventsApi = {
  list: async (params?: {
    page?: number;
    size?: number;
    city?: string;
    from_date?: string;
    to_date?: string;
  }): Promise<PaginatedResponse<Event>> => {
    const { data } = await api.get("/events/", { params });
    return data;
  },

  get: async (id: string): Promise<Event> => {
    const { data } = await api.get(`/events/${id}`);
    return data;
  },
};

export const ticketsApi = {
  list: async (): Promise<Ticket[]> => {
    const { data } = await api.get("/tickets/");
    return data;
  },

  get: async (id: string): Promise<Ticket> => {
    const { data } = await api.get(`/tickets/${id}`);
    return data;
  },

  verify: async (code: string): Promise<{ valid: boolean; message: string }> => {
    const { data } = await api.post(`/tickets/verify/${code}`);
    return data;
  },
};
