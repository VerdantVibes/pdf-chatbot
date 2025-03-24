import { ScrollArea } from "@/components/ui/scroll-area";
import { AtSign, Crop, MoveRight, RotateCw, Share2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { sendChatMessage } from "@/lib/api/chat";
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const ChatView = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>();
  const chatContentRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!location.state?.faissIndexPath) {
      toast.error("No chat index found");
      navigate("/private-assets");
    }
  }, [location.state, navigate]);

  useEffect(() => {
    if (chatContentRef.current) {
      chatContentRef.current.scrollTo({
        top: chatContentRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !location.state?.faissIndexPath || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setInput('');
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    setIsLoading(true);

    try {
      const response = await sendChatMessage({
        conversation_id: conversationId || "",
        faiss_index_path: location.state.faissIndexPath,
        content: input.trim(),
        pdf_ids: location.state.selectedRows
      });

      setConversationId(response.conversation_id);
      
      const cleanContent = response.content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: cleanContent,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("Failed to send message");
    } finally {
      setIsTyping(false);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Top Controls - Fixed */}
      <div className="w-full h-12 flex justify-end items-center gap-4 bg-white z-10 border-b px-4">
        <button 
          className="text-stone-600 hover:text-stone-900 transition-colors"
          onClick={() => {/* Add share functionality */}}
        >
          <Share2 width={16} />
        </button>
        <button 
          className="text-stone-600 hover:text-stone-900 transition-colors"
          onClick={() => window.location.reload()}
        >
          <RotateCw width={16} />
        </button>
      </div>

      {/* Chat Messages - Scrollable Area */}
      <ScrollArea 
        ref={chatContentRef}
        className="flex-1"
        style={{ height: 'calc(100vh - 200px)' }}
      >
        <div className="px-4 py-6 space-y-4">
          {messages.map((message, i) => (
            <div
              key={i}
              className={cn(
                "flex w-full",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "rounded-lg px-4 py-2 max-w-[85%]",
                  message.role === "user"
                    ? "bg-gray-900 text-white"
                    : "bg-stone-100 text-stone-900"
                )}
              >
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-stone-100 rounded-lg px-4 py-2">
                <RotateCw className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Chat Input Box - Fixed at Bottom */}
      <div className="w-full bg-white border-t border-stone-200 py-4 px-4">
        <div className="border border-stone-300 rounded-xl px-5 py-3 flex flex-col">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full outline-none border-0 bg-transparent text-stone-700 text-sm"
            placeholder="Ask your question here... (use @ to mention a paper)"
            disabled={isLoading}
          />

          {/* Input Controls */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-4">
              <button 
                className="text-stone-600 hover:text-stone-900 transition-colors"
                disabled={isLoading}
              >
                <AtSign width={16} />
              </button>
              <button 
                className="text-stone-600 hover:text-stone-900 transition-colors"
                disabled={isLoading}
              >
                <Crop width={16} />
              </button>
            </div>
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className={cn(
                "p-2 rounded-md bg-gray-900 text-white",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              <MoveRight width={16} height={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatView; 