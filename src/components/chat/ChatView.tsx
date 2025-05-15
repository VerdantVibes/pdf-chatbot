import { ScrollArea } from "@/components/ui/scroll-area";
import { AtSign, BrainCircuit, Crop, MoveRight, RotateCw, Share2 } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { MessageContent } from "./MessageContent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChatWebSocket, ChatProgress } from "@/hooks/useChatWebSocket";
import { ChatMessage, CHAT_STEPS } from "@/lib/websocket/chatWebSocketService";

type WebSocketChatMessage = ChatMessage;

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStepProgress?: boolean;
  stepDetails?: ChatProgress;
  animationId?: string;
  isThinking?: boolean;
  finalContent?: string;
}

interface ChatViewProps {
  onPdfChange?: (pdfId: string, page: number) => void;
}

const ResponseArrived = ({ onComplete }: { onComplete: () => void }) => {
  onComplete();
  return null;
};

const getStepIcon = (step: keyof typeof CHAT_STEPS) => {
  switch (step) {
    case "INITIALIZING":
      return <RotateCw className="h-4 w-4 animate-spin text-blue-500" />;
    case "LOADING_FAISS":
      return <BrainCircuit className="h-4 w-4 text-purple-500" />;
    case "GENERATING_QUERIES":
      return <Share2 className="h-4 w-4 text-amber-500" />;
    case "SEARCHING_CHUNKS":
      return <AtSign className="h-4 w-4 text-green-500" />;
    case "PREPARING_CONTEXT":
      return <Crop className="h-4 w-4 text-indigo-500" />;
    case "GENERATING_RESPONSE":
      return <MoveRight className="h-4 w-4 animate-pulse text-blue-600" />;
    default:
      return <RotateCw className="h-4 w-4 animate-spin text-blue-500" />;
  }
};

const getStepProgressBarStyle = (currentStepKey: keyof typeof CHAT_STEPS) => {
  const steps = Object.keys(CHAT_STEPS) as Array<keyof typeof CHAT_STEPS>;
  const currentIndex = steps.indexOf(currentStepKey);
  const total = steps.length - 2; 
  const progress = Math.max(0, Math.min(100, (currentIndex / Math.max(1, total - 1)) * 100));

  const baseColor =
    currentStepKey === "GENERATING_RESPONSE"
      ? "#3B82F6"
      : currentStepKey === "PREPARING_CONTEXT"
      ? "#6366F1"
      : currentStepKey === "SEARCHING_CHUNKS"
      ? "#10B981"
      : currentStepKey === "GENERATING_QUERIES"
      ? "#F59E0B"
      : "#8B5CF6";

  return {
    width: `${progress}%`,
    backgroundImage: `linear-gradient(to right, ${baseColor}, ${baseColor}E6)`,
    animation: progress < 100 && progress > 0 ? "progressPulse 2s infinite ease-in-out" : "none",
  };
};

interface StepDisplayProps {
  stepKey: keyof typeof CHAT_STEPS;
  stepLabel: string;
  stepContent: string[] | null;
  isCurrent: boolean;
  isCompleted: boolean;
  isLast: boolean;
}

const StepDisplay: React.FC<StepDisplayProps> = ({
  stepKey,
  stepLabel,
  stepContent,
  isCurrent,
  isCompleted,
  isLast,
}) => {
  const Icon = getStepIcon(stepKey);
  const hasContent = stepContent && stepContent.length > 0;
  const [isExpanded, setIsExpanded] = useState(isCurrent);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setIsExpanded(isCurrent);
  }, [isCurrent]);

  const getBgGradient = () => {
    if (isCompleted) return "bg-gradient-to-r from-emerald-500 to-green-500";
    if (isCurrent) return "bg-gradient-to-r from-blue-500 to-indigo-500";
    return "bg-gradient-to-r from-gray-300 to-gray-400";
  };

  return (
    <div
      className="mb-3 last:mb-1 transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start">
        <div className="relative">
          <div
            className={`flex items-center justify-center rounded-full w-5 h-5 ${getBgGradient()} 
              transition-all duration-300 ${isCurrent ? "scale-110" : ""} shadow-md z-10`}
          >
            {isCompleted ? (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              React.cloneElement(Icon, { className: "w-3 h-3 text-white" })
            )}

            {isCurrent && (
              <span className="absolute w-9 h-9 rounded-full -top-2 -left-2 bg-blue-400 opacity-20 animate-ping" />
            )}
          </div>

          {!isLast && (
            <div
              className={`absolute top-5 left-2.5 w-0.5 -translate-x-1/2 h-full 
                ${isCompleted ? "bg-green-300" : "bg-gray-200"} transition-colors duration-500`}
            />
          )}
        </div>

        <div className="ml-4 flex-1">
          <div
            onClick={() => hasContent && setIsExpanded(!isExpanded)}
            className={`relative flex items-center py-1 transition-all duration-200 rounded-md px-2
              ${hasContent ? "cursor-pointer" : ""} group
              ${isHovered && hasContent ? "bg-gray-50" : ""}`}
          >
            <h4
              className={`text-xs font-medium transition-all duration-300
              ${isCompleted ? "text-green-700" : isCurrent ? "text-blue-700" : "text-gray-600"}`}
            >
              {stepLabel}
            </h4>

            {hasContent && (
              <button
                className={`ml-auto p-1 rounded-full transition-all duration-300
                  ${isHovered ? "bg-gray-100 text-gray-700" : "text-gray-400"}`}
              >
                <div className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : "rotate-0"}`}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
              </button>
            )}

            {isCurrent && (
              <div className="absolute -right-1 -top-1 px-1.5 py-0.5 bg-blue-500 rounded-sm text-[9px] text-white font-medium shadow-sm">
                Current
              </div>
            )}
          </div>

          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out
              ${isExpanded ? "max-h-80 opacity-100 mt-2" : "max-h-0 opacity-0 mt-0"}`}
          >
            {hasContent && (
              <div
                className={`pl-3 pr-2 py-2 rounded-md bg-gradient-to-br from-gray-50 to-white
                  border-l-2 ${isCurrent ? "border-blue-400" : isCompleted ? "border-green-400" : "border-gray-300"}`}
              >
                {stepContent.map((item, itemIdx) => (
                  <div
                    key={itemIdx}
                    className={`whitespace-pre-wrap text-[0.7rem] leading-relaxed text-gray-700
                      ${stepContent.length > 1 && itemIdx < stepContent.length - 1 ? "mb-2" : ""}`}
                  >
                    {item}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export function ChatView({ onPdfChange }: ChatViewProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>();
  const [animatingMessageIds, setAnimatingMessageIds] = useState<Set<string>>(new Set());
  const [accumulatedSteps, setAccumulatedSteps] = useState<ChatProgress[]>([]);

  const chatContentRef = useRef<HTMLDivElement>(null);
  const processedMessageIds = useRef<Set<string>>(new Set());
  const processedDocumentRef = useRef<string[]>([]);
  const messageAfterThinkingRef = useRef<{ id: string; ref: HTMLDivElement | null }>({ id: "", ref: null });

  const location = useLocation();
  const navigate = useNavigate();

  const {
    sendMessage: sendWebSocketMessage,
    isTyping: isWsTyping,
    messageProgress,
    conversationId: wsConversationId,
    resetConversation,
  } = useChatWebSocket();

  useEffect(() => {
    if (!location.state?.faissIndexPath) {
      toast.error("No chat index found");
      navigate("/knowledge-base/general");
    }
  }, [location.state, navigate]);

  useEffect(() => {
    if (wsConversationId && wsConversationId !== conversationId) {
      setConversationId(wsConversationId);
    }
    if (!wsConversationId && conversationId) {
      setConversationId(undefined);
    }
  }, [wsConversationId, conversationId]);

  useEffect(() => {
    const scrollToBottom = () => {
      if (chatContentRef.current) {
        const scrollContainer = chatContentRef.current.querySelector("[data-radix-scroll-area-viewport]");
        if (scrollContainer) {
          setTimeout(() => {
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
          }, 50);
        }
      }
    };

    scrollToBottom();

    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === "user") {
      scrollToBottom();
    }
  }, [messages]);

  useEffect(() => {
    if (isWsTyping && messageProgress) {
      setAccumulatedSteps((prevSteps) => {
        const existingStepIndex = prevSteps.findIndex((s) => s.step === messageProgress.step);
        let newSteps = [...prevSteps];

        if (existingStepIndex !== -1) {
          newSteps[existingStepIndex] = {
            ...newSteps[existingStepIndex],
            content: messageProgress.content || [],
          };
        } else if (messageProgress.step !== CHAT_STEPS.COMPLETED && messageProgress.step !== CHAT_STEPS.ERROR) {
          newSteps.push({
            ...messageProgress,
            content: messageProgress.content || [],
          });
        }
        return newSteps;
      });

      setMessages((prevMessages) => {
        const lastMessage = prevMessages[prevMessages.length - 1];
        if (!lastMessage || lastMessage.role === "user" || !lastMessage.isStepProgress) {
          return [
            ...prevMessages,
            {
              role: "assistant",
              content: "", 
              timestamp: new Date(),
              isStepProgress: true,
              stepDetails: messageProgress,
            },
          ];
        } else {
          return prevMessages.map((msg, index) =>
            index === prevMessages.length - 1 ? { ...msg, stepDetails: messageProgress } : msg
          );
        }
      });
    }
  }, [isWsTyping, messageProgress]);

  useEffect(() => {
    if (location.state?.selectedRows?.length) {
      const currentSelection = [...location.state.selectedRows].sort().join(",");
      const prevSelection = processedDocumentRef.current.sort().join(",");

      if (currentSelection !== prevSelection) {
        resetConversation();
        processedMessageIds.current.clear();
        setAccumulatedSteps([]);
        processedDocumentRef.current = [...location.state.selectedRows];
      }
    }
  }, [location.state?.selectedRows, resetConversation]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !location.state?.faissIndexPath || isLoading) return;
    setAccumulatedSteps([]); 

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setInput("");
    setMessages((prev) => [...prev.filter((m) => !m.isStepProgress), userMessage]);
    setIsLoading(true);

    setTimeout(() => {
      if (chatContentRef.current) {
        const scrollContainer = chatContentRef.current.querySelector("[data-radix-scroll-area-viewport]");
        if (scrollContainer) {
          scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
      }
    }, 100);

    try {
      const selectedPdfIds = location.state?.selectedRows || [];

      let chatConversationId = conversationId || "";

      const currentSelection = [...selectedPdfIds].sort().join(",");
      const prevSelection = processedDocumentRef.current.sort().join(",");

      if (prevSelection !== currentSelection) {
        chatConversationId = "";
        resetConversation();
        processedMessageIds.current.clear();
        processedDocumentRef.current = [...selectedPdfIds];
      }

      const chatMessage: WebSocketChatMessage = {
        conversation_id: chatConversationId,
        content: input.trim(),
        pdf_ids: selectedPdfIds,
        faiss_index_path: location.state.faissIndexPath || "",
      };

      await sendWebSocketMessage(chatMessage, (data) => {
        if ((data.status === "completed" || data.step === CHAT_STEPS.COMPLETED) && data.message_id) {
          if (!processedMessageIds.current.has(data.message_id)) {
            processedMessageIds.current.add(data.message_id);
            setIsLoading(false);

            let thinkContent = "";
            let actualContent = "";

            if (data.content && data.content.length > 0) {
              const thinkMatch = data.content[0].match(/<think>([\s\S]*?)<\/think>/);
              thinkContent = thinkMatch ? thinkMatch[1].trim() : "";
              actualContent = data.content[0].replace(/<think>[\s\S]*?<\/think>/, "").trim();
            }

            if (thinkContent) {
              const animationId = data.message_id;
              setAnimatingMessageIds((prev) => new Set(prev).add(animationId));

              const thinkingMessage: Message = {
                role: "assistant",
                content: thinkContent,
                timestamp: new Date(),
                isStepProgress: false,
                isThinking: true,
                animationId: animationId,
                finalContent: actualContent, 
              };

              setMessages((prev) => prev.filter((m) => !m.isStepProgress).concat(thinkingMessage));
            } else {
              const assistantMessage: Message = {
                role: "assistant",
                content: actualContent,
                timestamp: new Date(),
                isStepProgress: false,
              };
              setMessages((prev) => prev.filter((m) => !m.isStepProgress).concat(assistantMessage));
            }
          }
        } else if (data.status === "error") {
          setIsLoading(false);
          toast.error(data.error || "Failed to get response from AI assistant");
          setMessages((prev) => prev.filter((m) => !m.isStepProgress));
        }
      });
    } catch (error) {
      setIsLoading(false);
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
      setMessages((prev) => prev.filter((m) => !m.isStepProgress));
    }
  };

  const handleAnimationComplete = (animationId: string) => {
    setAnimatingMessageIds((prev) => {
      const updated = new Set(prev);
      updated.delete(animationId);
      return updated;
    });

    setMessages((prev) => {
      return prev.map((message) => {
        if (message.animationId === animationId && message.isThinking && message.finalContent) {
          messageAfterThinkingRef.current.id = message.animationId;

          return {
            ...message,
            content: message.finalContent,
            isThinking: false,
            animationId: undefined,
            finalContent: undefined,
          };
        }
        return message;
      });
    });

    setTimeout(() => {
      requestAnimationFrame(() => {
        const scrollViewport = document.querySelector("[data-radix-scroll-area-viewport]");
        if (!scrollViewport) return;

        const latestMessageContainer = document.querySelector(
          `.ai-response-message[data-message-id="${messageAfterThinkingRef.current.id}"]`
        );
        let targetElement;

        if (!latestMessageContainer) {
          const assistantMessages = document.querySelectorAll(".ai-response-message");
          if (assistantMessages.length > 0) {
            const lastMessage = assistantMessages[assistantMessages.length - 1];
            const badgeElement = lastMessage.querySelector(".ai-assistant-badge");
            targetElement = badgeElement || lastMessage;
          }
        } else {
          const badgeElement = latestMessageContainer.querySelector(".ai-assistant-badge");
          targetElement = badgeElement || latestMessageContainer;
        }

        if (targetElement) {
          const viewportRect = scrollViewport.getBoundingClientRect();
          const targetRect = targetElement.getBoundingClientRect();

          const offset = 15;
          const newScrollTop = scrollViewport.scrollTop + (targetRect.top - viewportRect.top) - offset;

          scrollViewport.scrollTo({
            top: newScrollTop,
            behavior: "smooth",
          });
        }
      });
    }, 950);
  };

  const onPageClick = (pdfId: string, page: number) => {
    if ((onPdfChange && location.state?.selectedRows?.includes(pdfId)) || pdfId === "current") {
      const targetPdfId = pdfId === "current" ? location.state?.selectedRows[0] : pdfId;
      if (targetPdfId) {
        onPdfChange?.(targetPdfId, page);
      }
    } else if (!location.state?.selectedRows?.includes(pdfId) && pdfId !== "current") {
      toast.info("This PDF reference isn't in your current selection. Select this document to view it.");
    }
  };

  // Add animation styles to document head
  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.textContent = `
      @keyframes shimmer {
        0% {
          background-position: -200% 0;
        }
        100% {
          background-position: 200% 0;
        }
      }
      @keyframes progressPulse {
        0% {
          opacity: 0.8;
        }
        50% {
          opacity: 1;
        }
        100% {
          opacity: 0.8;
        }
      }
    `;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  return (
    <div className="flex flex-col h-full relative">
      <div className="sticky top-0 w-full h-12 flex justify-end items-center gap-4 bg-white z-10 border-b px-4">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => {
          }}
        >
          <Share2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => window.location.reload()}>
          <RotateCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-[calc(100vh-16rem)]" ref={chatContentRef}>
          <div className="px-4 py-6 space-y-4">
            {messages.map((message, i) => {
              if (message.isStepProgress && message.stepDetails) {
                const currentStepDetail = message.stepDetails;
                const currentStepKey = currentStepDetail.step as keyof typeof CHAT_STEPS;

                return (
                  <div key={`step-progress-container-${i}`} className="flex items-start space-x-3 w-full mb-4 pb-4">
                    <div className="w-8 h-8 rounded-full bg-green-200 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-sm font-semibold">AI</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium mb-2 ai-assistant-badge">AI Assistant</div>
                      <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 space-y-0">
                        <div className="w-full h-1 bg-gray-100 rounded-full mb-2 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-400 to-purple-500 transition-all duration-500 ease-out"
                            style={getStepProgressBarStyle(currentStepKey)}
                          ></div>
                        </div>

                        <div className="space-y-0">
                          {accumulatedSteps.map((step, idx) => {
                            const stepKey = step.step as keyof typeof CHAT_STEPS;
                            const isCurrent = step.step === currentStepDetail.step;

                            const CHAT_STEP_VALUES = Object.values(CHAT_STEPS);
                            const currentGlobalStepIndex = CHAT_STEP_VALUES.indexOf(currentStepDetail.step);
                            const thisStepGlobalIndex = CHAT_STEP_VALUES.indexOf(step.step);

                            if (thisStepGlobalIndex > currentGlobalStepIndex) {
                              return null; 
                            }

                            let isCompleted = thisStepGlobalIndex < currentGlobalStepIndex;
                            if (
                              currentStepDetail.step === CHAT_STEPS.COMPLETED ||
                              currentStepDetail.step === CHAT_STEPS.ERROR
                            ) {
                              isCompleted = true; 
                            }

                            if (
                              isCurrent &&
                              currentStepDetail.step !== CHAT_STEPS.COMPLETED &&
                              currentStepDetail.step !== CHAT_STEPS.ERROR
                            ) {
                              isCompleted = false;
                            }

                            const isLast = thisStepGlobalIndex === currentGlobalStepIndex;

                            return (
                              <StepDisplay
                                key={`acc-step-${idx}`}
                                stepKey={stepKey}
                                stepLabel={CHAT_STEPS[stepKey] || step.step}
                                stepContent={step.content}
                                isCurrent={isCurrent}
                                isCompleted={isCompleted}
                                isLast={isLast}
                              />
                            );
                          })}
                        </div>

                        {currentStepKey === CHAT_STEPS.GENERATING_RESPONSE && accumulatedSteps.length <= 1 && (
                          <div className="flex items-start space-x-3 py-2">
                            <div className="flex flex-col items-center">
                              <div className="w-5 h-5 rounded-full flex items-center justify-center bg-blue-500 ring-4 ring-blue-200 ring-opacity-50 transition-all duration-300">
                                <MoveRight className="w-3 h-3 text-white" />
                              </div>
                            </div>
                            <div className="pb-4 flex-1 min-h-[3.5rem]">
                              <p className="text-sm text-blue-700 font-semibold">Generating response</p>
                              <div className="mt-1 p-2 bg-gray-50 rounded-md border border-gray-200">
                                <p className="text-xs font-medium text-gray-700 mb-0.5">Status:</p>
                                <div className="flex items-center space-x-1.5">
                                  <div className="w-2 h-2 bg-gradient-to-br from-blue-500 to-sky-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                  <div className="w-2 h-2 bg-gradient-to-br from-blue-500 to-sky-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                  <div className="w-2 h-2 bg-gradient-to-br from-blue-500 to-sky-400 rounded-full animate-bounce"></div>
                                  <span className="text-xs text-gray-600 italic">
                                    AI is preparing your response... This may take a moment.
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              } else if (!message.isStepProgress) {
                return (
                  <div
                    key={i}
                    className={`flex items-start space-x-3 ${
                      message.role === "assistant" && !message.isThinking ? "ai-response-message" : ""
                    }`}
                    data-message-id={message.animationId || ""}
                    ref={(el) => {
                      if (
                        el &&
                        (message.animationId === messageAfterThinkingRef.current.id ||
                          (message.role === "assistant" &&
                            !message.isThinking &&
                            messageAfterThinkingRef.current.id &&
                            i === messages.length - 1))
                      ) {
                        messageAfterThinkingRef.current.ref = el;
                      }
                    }}
                  >
                    <div
                      className={`w-8 h-8 rounded-full ${
                        message.role === "assistant" ? "bg-green-200" : "bg-black"
                      } flex items-center justify-center flex-shrink-0`}
                    >
                      <span
                        className={`${
                          message.role === "assistant" ? "text-sm font-semibold" : "text-[9px] font-semibold text-white"
                        }`}
                      >
                        {message.role === "assistant" ? "AI" : "YOU"}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div
                        className="font-medium mb-2 ai-assistant-badge"
                        style={{
                          color: "var(--base-accent-secondary, #18181B)",
                          fontSize: "var(--typography-base-sizes-small-font-size, 14px)",
                          fontStyle: "normal",
                          fontWeight: "var(--font-weight-bold, 500)",
                          lineHeight: "100%",
                        }}
                      >
                        {message.role === "assistant" ? "AI Assistant" : "You"}
                      </div>
                      <div
                        className={`flex p-2 px-3 items-start gap-[10px] flex-shrink-0 self-stretch rounded-md border border-[#E4E4E7] bg-[#FCFBFC] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] text-sm ${
                          message.role === "assistant" ? "text-gray-600" : "text-neutral-800 font-semibold"
                        }`}
                      >
                        {message.role === "assistant" &&
                        message.isThinking &&
                        message.animationId &&
                        animatingMessageIds.has(message.animationId) ? (
                          <div className="w-full">
                            <ResponseArrived
                              onComplete={() => handleAnimationComplete(message.animationId as string)}
                            />
                          </div>
                        ) : (
                          <MessageContent content={message.content} onPageClick={onPageClick} />
                        )}
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </ScrollArea>
      </div>

      <div className="sticky bottom-0 w-full bg-white border-t border-stone-200 py-4 px-4 chat-input-area">
        <div className="border border-stone-300 rounded-xl px-5 py-3 flex flex-col">
          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            className="w-full border-0 shadow-none focus-visible:ring-0 bg-transparent text-stone-700 text-sm px-0"
            placeholder="Ask your question here... (use @ to mention a paper)"
            disabled={isLoading}
          />

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-stone-600 hover:text-stone-900"
                disabled={isLoading}
              >
                <AtSign className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-stone-600 hover:text-stone-900"
                disabled={isLoading}
              >
                <Crop className="h-4 w-4" />
              </Button>
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading || !location.state?.faissIndexPath}
              variant="default"
              size="icon"
              className="h-9 w-9 rounded-md bg-gray-900 text-white"
            >
              <MoveRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
