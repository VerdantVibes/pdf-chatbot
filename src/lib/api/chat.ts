import { axiosInstance as Axios } from "../axiosInterceptor";

interface ChatMessage {
  conversation_id?: string;
  faiss_index_path: string;
  content: string;
  pdf_ids: string[];
}

interface ChatResponse {
  conversation_id: string;
  message_id: string;
  content: string;
  pdf_ids: string[];
}

export async function buildChatIndex(documentIds: string[]) {
  const response = await Axios.post("/faiss/build-index", documentIds);
  return response.data;
}

export async function sendChatMessage(message: ChatMessage): Promise<ChatResponse> {
  const response = await Axios.post("/chat/message", message);
  return response.data;
} 