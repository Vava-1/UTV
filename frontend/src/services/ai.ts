import { api } from "./api";

export const aiApi = {
  chat: async (message: string, sessionId?: string, language?: string): Promise<{ response: string; session_id: string }> => {
    const { data } = await api.post("/ai/chat", { message, session_id: sessionId, language });
    return data;
  },

  getHistory: async (sessionId: string): Promise<{ messages: Array<{ role: string; content: string; timestamp: string }> }> => {
    const { data } = await api.get(`/ai/chat/history/${sessionId}`);
    return data;
  },

  clearHistory: async (sessionId: string): Promise<void> => {
    await api.delete(`/ai/chat/history/${sessionId}`);
  },
};
