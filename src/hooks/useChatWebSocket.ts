import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { ChatWebSocketService, ChatMessage, ChatResponse, CHAT_STEPS } from "@/lib/websocket/chatWebSocketService";
import { toast } from "sonner";
import Cookies from "js-cookie";

export interface ChatProgress {
  status: "in_progress" | "completed" | "error";
  step: string;
  content: string[];
  conversation_id: string | null;
  message_id: string | null;
}

export function useChatWebSocket() {
  const { user } = useAuth();
  const token = Cookies.get("auth_token") || localStorage.getItem("auth_token");
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [messageProgress, setMessageProgress] = useState<ChatProgress | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const shouldMaintainConnection = useRef(false);
  const activeResponseRef = useRef<boolean>(false);

  const getWebSocketService = useCallback(() => {
    try {
      if (!token) {
        console.error("No auth token available for WebSocket connection");
        return null;
      }
      return ChatWebSocketService.getInstance(token);
    } catch (error) {
      console.error("Error getting WebSocket service:", error);
      return null;
    }
  }, [token]);

  const disconnectWebSocket = useCallback(() => {
    shouldMaintainConnection.current = false;
    activeResponseRef.current = false;

    try {
      const wsService = getWebSocketService();
      if (wsService) {
        console.log("Disconnecting Chat WebSocket...");
        wsService.disconnect();
      }

      ChatWebSocketService.resetInstance();
      setIsConnected(false);
    } catch (error) {
      console.error("Error disconnecting WebSocket:", error);
    }
  }, [getWebSocketService]);

  const connectWebSocket = useCallback(async (): Promise<boolean> => {
    if (isConnected) return true;

    setIsConnecting(true);

    try {
      if (!getWebSocketService()) {
        console.log("No WebSocket service available");
        setIsConnected(false);
        return false;
      }

      console.log("Connecting to Chat WebSocket...");

      getWebSocketService()?.onOpen(() => {
        console.log("Chat WebSocket connected successfully");
        setIsConnected(true);
        setIsConnecting(false);
        setRetryCount(0);
      });

      getWebSocketService()?.onError((error: unknown) => {
        console.error("Chat WebSocket connection error:", error);

        if (retryCount < maxRetries) {
          if (retryCount > 1) {
            toast.error("Connection error. Retrying...");
          }
        } else {
          toast.error("Failed to connect to server. Please try again later.");
          setIsConnecting(false);
          activeResponseRef.current = false;
          setIsTyping(false);
        }
      });

      getWebSocketService()?.onClose(() => {
        console.log("Chat WebSocket connection closed");
        setIsConnected(false);
        if (activeResponseRef.current) {
          setIsTyping(false);
          activeResponseRef.current = false;
        }
      });

      await getWebSocketService()?.connect();

      return true;
    } catch (error) {
      console.error("Error connecting to WebSocket:", error);
      setRetryCount((prev) => prev + 1);

      if (retryCount < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
        console.log(`Retrying connection in ${delay}ms (attempt ${retryCount + 1}/${maxRetries})`);

        await new Promise((resolve) => setTimeout(resolve, delay));
        return connectWebSocket();
      } else {
        toast.error("Failed to connect to server. Please try again later.");
        setIsConnecting(false);
        activeResponseRef.current = false;
        setIsTyping(false);
        return false;
      }
    }
  }, [getWebSocketService, retryCount, maxRetries, isConnected]);

  useEffect(() => {
    return () => {
      if (shouldMaintainConnection.current) {
        console.log("Component unmounting, cleaning up WebSocket");
        disconnectWebSocket();
      }
    };
  }, [disconnectWebSocket]);

  const sendMessage = useCallback(
    async (message: ChatMessage, progressHandler: (data: ChatResponse) => void) => {
      if (!message.content.trim()) {
        toast.error("Message content cannot be empty");
        return false;
      }

      try {
        shouldMaintainConnection.current = true;
        activeResponseRef.current = true;
        setIsTyping(true);

        const connected = await connectWebSocket();
        if (!connected) {
          toast.error("Failed to establish connection for chat");
          shouldMaintainConnection.current = false;
          activeResponseRef.current = false;
          setIsTyping(false);
          return false;
        }

        const handleProgress = (data: ChatResponse) => {
          console.log("Chat progress update received:", data);

          setMessageProgress({
            status: data.status,
            step: data.step,
            content: data.content,
            conversation_id: data.conversation_id,
            message_id: data.message_id,
          });

          if (data.conversation_id && (!conversationId || conversationId !== data.conversation_id)) {
            console.log("Setting conversation ID in WebSocket hook:", data.conversation_id);
            setConversationId(data.conversation_id);
          }

          progressHandler(data);

          if (data.status === "completed" || data.status === "error" || data.step === "Completed") {
            activeResponseRef.current = false;
            setIsTyping(false);

            setTimeout(() => {
              console.log("Auto-disconnecting WebSocket after completion");
              disconnectWebSocket();
            }, 1000);
          }
        };

        getWebSocketService()?.onProgress(handleProgress);

        getWebSocketService()?.onError((error) => {
          console.error("Error during chat:", error);
          toast.error(`Chat error: ${error instanceof Error ? error.message : "Unknown error"}`);
          activeResponseRef.current = false;
          setIsTyping(false);
        });

        if (conversationId) {
          message.conversation_id = conversationId;
        }

        getWebSocketService()?.sendMessage(message);
        console.log("Message sent successfully");
        return true;
      } catch (error) {
        console.error("Error sending message:", error);
        setIsTyping(false);
        activeResponseRef.current = false;
        toast.error(`Error: ${error instanceof Error ? error.message : "Failed to send message"}`);
        return false;
      }
    },
    [connectWebSocket, disconnectWebSocket, getWebSocketService, conversationId]
  );

  const resetConversation = useCallback(() => {
    setConversationId(null);
    setMessageProgress(null);
    disconnectWebSocket();
  }, [disconnectWebSocket]);

  return {
    isConnected,
    isConnecting,
    isTyping,
    sendMessage,
    messageProgress,
    conversationId,
    connectWebSocket,
    disconnectWebSocket,
    resetConversation,
  };
}
