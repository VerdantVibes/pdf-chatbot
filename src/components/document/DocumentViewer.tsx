import React, { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PdfViewer } from "./PdfViewer";
import {
  Pencil,
  Trash2,
  Loader2,
  RotateCw,
  CheckCircle,
  MessageCircleDashed,
  Database,
  Search,
  FileText,
  SparklesIcon,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  NoteResponse,
  useGetPdfNotes,
  useCreateNote,
  useUpdateNote,
  useDeleteNote,
  NoteUpdate,
} from "@/lib/api/pdf-notes";
import { v4 as uuidv4 } from "uuid";
import { Textarea } from "@/components/ui/textarea";
import { buildChatIndex } from "@/lib/api/chat";
import { MessageContent } from "@/components/chat/MessageContent";
import { toast } from "sonner";
import { useAuth } from "@/lib/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTailwindBreakpoint } from "@/hooks/use-tailwind-breakpoint";
import { useChatWebSocket, ChatProgress } from "@/hooks/useChatWebSocket";
import { ChatMessage as WebSocketChatMessage, CHAT_STEPS } from "@/lib/websocket/chatWebSocketService";

interface DocumentViewerProps {
  pdfUrl: string;
  document: any;
  sidebarOpen?: boolean;
  pdfs: any[];
  isPdfsLoading: boolean;
}

interface IconProps {
  className?: string;
}

interface Message {
  role: "assistant" | "user";
  content: string;
  timestamp: Date;
  isStepProgress?: boolean;
  stepDetails?: ChatProgress;
  animationId?: string;
  isThinking?: boolean;
  finalContent?: string;
}

const OverviewIcon = ({ className }: IconProps) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="17" height="16" viewBox="0 0 17 16" fill="none">
    <path
      d="M11.8333 4.06641H2.5"
      stroke="#18181B"
      stroke-width="1.33"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path d="M14.5 8.06641H2.5" stroke="#18181B" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M10.5667 12H2.5" stroke="#18181B" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
);

const DetailedIcon = ({ className }: IconProps) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path
      d="M14 10C14 10.3536 13.8595 10.6928 13.6095 10.9428C13.3594 11.1929 13.0203 11.3333 12.6667 11.3333H4.66667L2 14V3.33333C2 2.97971 2.14048 2.64057 2.39052 2.39052C2.64057 2.14048 2.97971 2 3.33333 2H12.6667C13.0203 2 13.3594 2.14048 13.6095 2.39052C13.8595 2.64057 14 2.97971 14 3.33333V10Z"
      stroke="#18181B"
      stroke-width="1.33"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M8.66699 5.33398H4.66699"
      stroke="#18181B"
      stroke-width="1.33"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path d="M11.3337 8H4.66699" stroke="#18181B" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
);

const NotesIcon = ({ className }: IconProps) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path
      d="M9.99935 1.33398H3.99935C3.64573 1.33398 3.30659 1.47446 3.05654 1.72451C2.80649 1.97456 2.66602 2.3137 2.66602 2.66732V13.334C2.66602 13.6876 2.80649 14.0267 3.05654 14.2768C3.30659 14.5268 3.64573 14.6673 3.99935 14.6673H11.9993C12.353 14.6673 12.6921 14.5268 12.9422 14.2768C13.1922 14.0267 13.3327 13.6876 13.3327 13.334V4.66732L9.99935 1.33398Z"
      stroke="#18181B"
      stroke-width="1.33"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M9.33398 1.33398V4.00065C9.33398 4.35427 9.47446 4.69341 9.72451 4.94346C9.97456 5.19351 10.3137 5.33398 10.6673 5.33398H13.334"
      stroke="#18181B"
      stroke-width="1.33"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
);

const ChatIcon = ({ className }: IconProps) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
    <g clip-path="url(#clip0_2294_15017)">
      <path
        d="M8.00065 4.00065V1.33398H5.33398"
        stroke="black"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M5.33268 12L2.66602 14.6667V5.33333C2.66602 4.97971 2.80649 4.64057 3.05654 4.39052C3.30659 4.14048 3.64573 4 3.99935 4H11.9993C12.353 4 12.6921 4.14048 12.9422 4.39052C13.1922 4.64057 13.3327 4.97971 13.3327 5.33333V10.6667C13.3327 11.0203 13.1922 11.3594 12.9422 11.6095C12.6921 11.8595 12.353 12 11.9993 12H5.33268Z"
        stroke="black"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path d="M1.33398 8H2.66732" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M6 7.33398V8.66732" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M10 7.33398V8.66732" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M13.334 8H14.6673" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    </g>
    <defs>
      <clipPath id="clip0_2294_15017">
        <rect width="16" height="16" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

const RotateIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="19" height="18" viewBox="0 0 19 18" fill="none">
    <path
      d="M2.375 9C2.375 10.335 2.79287 11.6401 3.57578 12.7501C4.35868 13.8601 5.47146 14.7253 6.77338 15.2362C8.0753 15.7471 9.5079 15.8808 10.89 15.6203C12.2721 15.3599 13.5417 14.717 14.5381 13.773C15.5346 12.829 16.2132 11.6262 16.4881 10.3169C16.763 9.00749 16.6219 7.65029 16.0826 6.41689C15.5434 5.18349 14.6301 4.12928 13.4584 3.38758C12.2867 2.64588 10.9092 2.25 9.5 2.25C7.50813 2.2571 5.59627 2.99342 4.16417 4.305L2.375 6"
      stroke="black"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M2.375 2.25V6H6.33333" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PasteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="19" height="18" viewBox="0 0 19 18" fill="none">
    <g clip-path="url(#clip0_2294_15075)">
      <path
        d="M15.834 6H7.91732C7.04287 6 6.33398 6.67157 6.33398 7.5V15C6.33398 15.8284 7.04287 16.5 7.91732 16.5H15.834C16.7084 16.5 17.4173 15.8284 17.4173 15V7.5C17.4173 6.67157 16.7084 6 15.834 6Z"
        stroke="black"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M3.16732 12C2.29648 12 1.58398 11.325 1.58398 10.5V3C1.58398 2.175 2.29648 1.5 3.16732 1.5H11.084C11.9548 1.5 12.6673 2.175 12.6673 3"
        stroke="black"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_2294_15075">
        <rect width="19" height="18" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

const SaveIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="19" height="18" viewBox="0 0 19 18" fill="none">
    <path
      d="M12.0333 2.25C12.451 2.25564 12.8493 2.41738 13.1417 2.7L16.15 5.55C16.4483 5.82695 16.6191 6.20435 16.625 6.6V14.25C16.625 14.6478 16.4582 15.0294 16.1613 15.3107C15.8643 15.592 15.4616 15.75 15.0417 15.75H3.95833C3.53841 15.75 3.13568 15.592 2.83875 15.3107C2.54181 15.0294 2.375 14.6478 2.375 14.25V3.75C2.375 3.35218 2.54181 2.97064 2.83875 2.68934C3.13568 2.40804 3.53841 2.25 3.95833 2.25H12.0333Z"
      stroke="black"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M13.4577 15.75V10.5C13.4577 10.3011 13.3743 10.1103 13.2258 9.96967C13.0773 9.82902 12.876 9.75 12.666 9.75H6.33268C6.12272 9.75 5.92136 9.82902 5.77289 9.96967C5.62442 10.1103 5.54102 10.3011 5.54102 10.5V15.75"
      stroke="black"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5.54102 2.25V5.25C5.54102 5.44891 5.62442 5.63968 5.77289 5.78033C5.92136 5.92098 6.12272 6 6.33268 6H11.8743"
      stroke="black"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const DiveDeeperIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
    <g clipPath="url(#clip0_2294_15114)">
      <path
        d="M6.6243 10.3342C6.56478 10.1034 6.44453 9.89289 6.27605 9.72441C6.10757 9.55593 5.89702 9.43567 5.6663 9.37615L1.5763 8.32148C1.50652 8.30168 1.44511 8.25965 1.40138 8.20178C1.35765 8.14391 1.33398 8.07335 1.33398 8.00082C1.33398 7.92828 1.35765 7.85773 1.40138 7.79985C1.44511 7.74198 1.50652 7.69996 1.5763 7.68015L5.6663 6.62482C5.89693 6.56536 6.10743 6.4452 6.2759 6.27684C6.44438 6.10849 6.56468 5.89808 6.6243 5.66748L7.67897 1.57748C7.69857 1.50743 7.74056 1.44571 7.79851 1.40175C7.85647 1.35778 7.92722 1.33398 7.99997 1.33398C8.07271 1.33398 8.14346 1.35778 8.20142 1.40175C8.25938 1.44571 8.30136 1.50743 8.32097 1.57748L9.37497 5.66748C9.43449 5.8982 9.55474 6.10875 9.72322 6.27723C9.8917 6.44571 10.1023 6.56597 10.333 6.62548L14.423 7.67948C14.4933 7.69888 14.5553 7.74082 14.5995 7.79887C14.6437 7.85691 14.6677 7.92786 14.6677 8.00082C14.6677 8.07378 14.6437 8.14472 14.5995 8.20277C14.5553 8.26081 14.4933 8.30275 14.423 8.32215L10.333 9.37615C10.1023 9.43567 9.8917 9.55593 9.72322 9.72441C9.55474 9.89289 9.43449 10.1034 9.37497 10.3342L8.3203 14.4242C8.3007 14.4942 8.25871 14.5559 8.20075 14.5999C8.1428 14.6439 8.07205 14.6677 7.9993 14.6677C7.92656 14.6677 7.85581 14.6439 7.79785 14.5999C7.73989 14.5559 7.69791 14.4942 7.6783 14.4242L6.6243 10.3342Z"
        stroke="black"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M13.334 2V4.66667" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14.6667 3.33398H12" stroke="black" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2.66602 11.334V12.6673" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3.33333 12H2" stroke="black" strokeLinecap="round" strokeLinejoin="round" />
    </g>
    <defs>
      <clipPath id="clip0_2294_15114">
        <rect width="16" height="16" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

const AtSignIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
    <g clip-path="url(#clip0_2294_15042)">
      <path
        d="M6.99935 9.33268C8.28801 9.33268 9.33268 8.28801 9.33268 6.99935C9.33268 5.71068 8.28801 4.66602 6.99935 4.66602C5.71068 4.66602 4.66602 5.71068 4.66602 6.99935C4.66602 8.28801 5.71068 9.33268 6.99935 9.33268Z"
        stroke="black"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M9.33269 4.66602V7.58269C9.33269 8.04682 9.51706 8.49194 9.84525 8.82012C10.1734 9.14831 10.6186 9.33269 11.0827 9.33269C11.5468 9.33269 11.9919 9.14831 12.3201 8.82012C12.6483 8.49194 12.8327 8.04682 12.8327 7.58269V6.99935C12.8327 5.68528 12.389 4.4097 11.5735 3.37929C10.758 2.34887 9.6185 1.62398 8.33958 1.32207C7.06066 1.02016 5.71727 1.15891 4.52705 1.71584C3.33684 2.27278 2.36954 3.21527 1.78186 4.39061C1.19419 5.56595 1.02058 6.90529 1.28916 8.19162C1.55775 9.47795 2.25278 10.6359 3.26166 11.4779C4.27054 12.3199 5.53416 12.7966 6.84779 12.8307C8.16142 12.8649 9.4481 12.4545 10.4994 11.666"
        stroke="black"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_2294_15042">
        <rect width="14" height="14" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path
      d="M8.52062 12.8117C8.54341 12.8685 8.58303 12.917 8.63417 12.9506C8.6853 12.9843 8.7455 13.0015 8.80669 12.9999C8.86787 12.9983 8.92712 12.9781 8.97646 12.9419C9.02581 12.9057 9.0629 12.8552 9.08275 12.7973L12.9823 1.39865C13.0015 1.34549 13.0052 1.28797 12.9929 1.2328C12.9806 1.17764 12.9528 1.12712 12.9128 1.08716C12.8729 1.04719 12.8224 1.01943 12.7672 1.00713C12.712 0.994832 12.6545 0.998496 12.6013 1.0177L1.20266 4.91725C1.14476 4.9371 1.09433 4.97419 1.05812 5.02354C1.02191 5.07288 1.00167 5.13213 1.0001 5.19331C0.998531 5.2545 1.01572 5.3147 1.04935 5.36583C1.08299 5.41697 1.13146 5.45659 1.18826 5.47938L5.94571 7.38716C6.09611 7.44738 6.23275 7.53742 6.34741 7.65187C6.46206 7.76632 6.55235 7.9028 6.61284 8.05309L8.52062 12.8117Z"
      stroke="white"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path d="M12.9109 1.08984L6.34766 7.65249" stroke="white" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
);

const getInitials = (name?: string | null): string => {
  if (!name) return "AU";
  const parts = name.split(" ");
  if (parts.length === 0 || parts[0] === "") return "AU";
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + (parts[parts.length - 1][0] || "")).toUpperCase();
};

const formatTime = (dateTimeString?: string): string => {
  if (!dateTimeString) return "";
  try {
    const date = new Date(dateTimeString);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch (e) {
    return "";
  }
};

const ResponseArrived = ({ onComplete }: { onComplete: () => void }) => {
  onComplete();
  return null;
};

const getStepIcon = (step: keyof typeof CHAT_STEPS) => {
  switch (step) {
    case "INITIALIZING":
      return <RotateCw className="h-4 w-4 animate-spin text-blue-500" />;
    case "LOADING_FAISS":
      return <Database className="h-4 w-4 text-purple-500" />;
    case "GENERATING_QUERIES":
      return <SparklesIcon className="h-4 w-4 text-amber-500" />;
    case "SEARCHING_CHUNKS":
      return <Search className="h-4 w-4 text-green-500" />;
    case "PREPARING_CONTEXT":
      return <FileText className="h-4 w-4 text-indigo-500" />;
    case "GENERATING_RESPONSE":
      return <MessageCircleDashed className="h-4 w-4 animate-pulse text-blue-600" />;
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
              <CheckCircle className="w-3 h-3 text-white" />
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
                  <ChevronDown size={14} />
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

export function DocumentViewer({
  pdfs,
  isPdfsLoading,
  pdfUrl,
  document: documentData,
  sidebarOpen = false,
}: DocumentViewerProps) {
  const { analysis = {} } = documentData || {};
  const { ai_summary } = analysis;
  const { user } = useAuth();
  const { atLeastMd, atMostSm } = useTailwindBreakpoint();

  const [newNoteContent, setNewNoteContent] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editNoteContent, setEditNoteContent] = useState("");
  const [localNotes, setLocalNotes] = useState<NoteResponse[]>([]);
  const [selectedNoteIds, setSelectedNoteIds] = useState<string[]>([]);
  const [isMultiSelectActive, _setIsMultiSelectActive] = useState(false);
  const [isIndexBuilt, setIsIndexBuilt] = useState(false);
  const [isIndexLoading, setIsIndexLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("detailed");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>();
  const processedDocumentRef = useRef<string | null>(null);
  const processedMessageIds = useRef<Set<string>>(new Set());
  const [animatingMessageIds, setAnimatingMessageIds] = useState<Set<string>>(new Set());

  const {
    sendMessage: sendWebSocketMessage,
    isTyping: isWsTyping,
    messageProgress,
    conversationId: wsConversationId,
    resetConversation,
  } = useChatWebSocket();

  const allTabs = [
    { id: "detailed", label: "Detailed Summary", icon: DetailedIcon },
    { id: "overview", label: "Overview Summary", icon: OverviewIcon },
    { id: "notes", label: "Notes", icon: NotesIcon },
    { id: "ai-chat", label: "AI Chat", icon: ChatIcon },
  ];

  const maxVisibleTabs = atMostSm ? 2 : 3;
  const [visibleTabsStart, setVisibleTabsStart] = useState(0);

  const chatContentRef = useRef<HTMLDivElement>(null);

  const { data: serverNotes = [], isLoading: isLoadingNotes, refetch: refetchNotes } = useGetPdfNotes(documentData?.id);
  const createNoteMutation = useCreateNote();
  const updateNoteMutation = useUpdateNote();
  const deleteNoteMutation = useDeleteNote();

  const messageAfterThinkingRef = useRef<{ id: string; ref: HTMLDivElement | null }>({ id: "", ref: null });

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

  const handleTabNavigation = (direction: "prev" | "next") => {
    if (direction === "prev") {
      setVisibleTabsStart(Math.max(0, visibleTabsStart - 1));
    } else {
      setVisibleTabsStart(Math.min(allTabs.length - maxVisibleTabs, visibleTabsStart + 1));
    }
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);

    const newTabIndex = allTabs.findIndex((tab) => tab.id === tabId);

    if (!atLeastMd && newTabIndex >= 0) {
      if (newTabIndex < visibleTabsStart || newTabIndex >= visibleTabsStart + maxVisibleTabs) {
        setVisibleTabsStart(Math.min(newTabIndex, allTabs.length - maxVisibleTabs));
      }
    }
  };

  const visibleTabs = !atLeastMd ? allTabs.slice(visibleTabsStart, visibleTabsStart + maxVisibleTabs) : allTabs;

  const showLeftEllipsis = !atLeastMd && visibleTabsStart > 0;
  const showRightEllipsis = !atLeastMd && visibleTabsStart + maxVisibleTabs < allTabs.length;

  useEffect(() => {
    if (documentData?.id) {
      setLocalNotes([]);
      setNewNoteContent("");
      setEditingNoteId(null);
      setEditNoteContent("");
      setSelectedNoteIds([]);
      setMessages([]);
      setInput("");
      setCurrentPage(1);
      resetConversation();
      processedMessageIds.current.clear();
    }
  }, [documentData?.id, resetConversation]);

  useEffect(() => {
    if (serverNotes) {
      setLocalNotes(serverNotes);
    }
  }, [serverNotes]);

  useEffect(() => {
    const handleHighlightCreated = () => {
      setTimeout(() => {
        refetchNotes();
      }, 500);
    };

    window.document.addEventListener("highlightCreated", handleHighlightCreated as EventListener);

    return () => {
      window.document.removeEventListener("highlightCreated", handleHighlightCreated as EventListener);
    };
  }, [refetchNotes]);

  useEffect(() => {
    const buildIndex = async () => {
      if (!documentData?.id) return;

      if (processedDocumentRef.current === documentData.id) {
        return;
      }

      processedDocumentRef.current = documentData.id;

      const builtIndices = JSON.parse(localStorage.getItem("builtIndices") || "{}");
      if (builtIndices[documentData.id]) {
        setIsIndexBuilt(true);
        setIsIndexLoading(false);
        documentData.faiss_index_path = builtIndices[documentData.id];
        return;
      }

      try {
        setIsIndexLoading(true);
        const response = await buildChatIndex([documentData.id]);

        if (response.status === "success") {
          setIsIndexBuilt(true);
          documentData.faiss_index_path = response.index_path;

          builtIndices[documentData.id] = response.index_path;
          localStorage.setItem("builtIndices", JSON.stringify(builtIndices));
        } else {
          toast.error("Failed to build chat index");
        }
      } catch (error) {
        console.error("Error building index:", error);
        toast.error("Failed to build chat index");
      } finally {
        setIsIndexLoading(false);
      }
    };

    buildIndex();
  }, [documentData?.id]);

  useEffect(() => {
    if (wsConversationId && wsConversationId !== currentConversationId) {
      setCurrentConversationId(wsConversationId);
    }
    if (!wsConversationId && currentConversationId) {
      setCurrentConversationId(undefined);
    }
  }, [wsConversationId, currentConversationId]);

  const [accumulatedSteps, setAccumulatedSteps] = useState<ChatProgress[]>([]);

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
    } else if (!isWsTyping && messages.some((m) => m.isStepProgress)) {
      const lastMessageDetails = messages[messages.length - 1]?.stepDetails;
      if (
        lastMessageDetails &&
        (lastMessageDetails.step === CHAT_STEPS.COMPLETED || lastMessageDetails.step === CHAT_STEPS.ERROR)
      ) {
        setAccumulatedSteps([]);
      }
    }
  }, [isWsTyping, messageProgress]); 

  useEffect(() => {
    setAccumulatedSteps([]);
  }, [documentData?.id]); 

  useEffect(() => {
    if (activeTab === "ai-chat" && documentData?.id) {
      const currentDocId = documentData.id;
      if (processedDocumentRef.current !== null && processedDocumentRef.current !== currentDocId) {
        resetConversation();
        processedMessageIds.current.clear();
      }
      processedDocumentRef.current = currentDocId;
    }
  }, [activeTab, documentData?.id, resetConversation]);

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim() || !documentData?.id) return;

    setNewNoteContent("");

    const tempId = uuidv4();
    const optimisticNote: NoteResponse = {
      id: tempId,
      pdf_id: documentData.id,
      page_number: 0,
      highlighted_text: "",
      note_content: newNoteContent,
      position_data: {
        rects: [],
        page_width: 0,
        page_height: 0,
        text_node_indices: [],
        text_context: "",
        character_start_index: 0,
        character_end_index: 0,
      },
      highlight_color: "#EECBFE",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      isOptimistic: true,
      isCreating: true,
    };

    setLocalNotes((prev) => [optimisticNote, ...prev]);

    try {
      const response = await createNoteMutation.mutateAsync({
        pdf_id: documentData.id,
        note_content: newNoteContent,
      });

      setLocalNotes((prev) => prev.map((note) => (note.id === tempId ? { ...response } : note)));

      setTimeout(() => {
        refetchNotes();
      }, 500);
    } catch (error) {
      setLocalNotes((prev) => prev.map((note) => (note.id === tempId ? { ...note, isError: true } : note)));
      console.error("Failed to create note:", error);
    }
  };

  const handleUpdateNote = (noteId: string, noteData: NoteUpdate, originalNote: NoteResponse) => {
    const noteToUpdate = localNotes.find((note) => note.id === noteId);
    if (!noteToUpdate) return;

    const updatedNote = {
      ...noteToUpdate,
      ...noteData,
      isOptimistic: true,
      isUpdating: true,
      updated_at: new Date().toISOString(),
    };

    setLocalNotes((currentNotes) => currentNotes.map((note) => (note.id === noteId ? updatedNote : note)));

    updateNoteMutation.mutate(
      {
        noteId,
        noteData,
      },
      {
        onSuccess: (data) => {
          setLocalNotes((currentNotes) =>
            currentNotes.map((note) =>
              note.id === noteId ? { ...data, isOptimistic: false, isUpdating: false } : note
            )
          );
        },
        onError: () => {
          setLocalNotes((currentNotes) => currentNotes.map((note) => (note.id === noteId ? originalNote : note)));
        },
      }
    );
  };

  const handleDeleteNote = (noteId: string) => {
    const noteToDelete = localNotes.find((note) => note.id === noteId);
    if (!noteToDelete) return;

    setLocalNotes((currentNotes) =>
      currentNotes.map((note) => (note.id === noteId ? { ...note, isOptimistic: true, isDeleting: true } : note))
    );

    setTimeout(() => {
      setLocalNotes((currentNotes) => currentNotes.filter((note) => note.id !== noteId));
    }, 300);

    deleteNoteMutation.mutate(
      {
        noteId,
        permanent: true,
      },
      {
        onError: () => {
          setLocalNotes((currentNotes) => {
            const noteExists = currentNotes.some((note) => note.id === noteId);
            return noteExists ? currentNotes : [...currentNotes, noteToDelete];
          });
        },
        onSuccess: () => {
          refetchNotes();
        },
      }
    );
  };

  const toggleNoteSelection = (noteId: string) => {
    setSelectedNoteIds((prev) => (prev.includes(noteId) ? prev.filter((id) => id !== noteId) : [...prev, noteId]));
  };

  const handleStartEditNote = (noteId: string, content: string) => {
    setEditingNoteId(noteId);
    setEditNoteContent(content);
  };

  const handleSubmitEditNote = (noteId: string) => {
    if (!editNoteContent.trim()) return;

    const noteToUpdate = localNotes.find((note) => note.id === noteId);
    if (!noteToUpdate) return;

    handleUpdateNote(
      noteId,
      {
        note_content: editNoteContent,
      },
      noteToUpdate
    );

    setEditingNoteId(null);
    setEditNoteContent("");
  };

  const navigateToHighlight = (note: NoteResponse) => {
    if (
      !note.page_number ||
      !note.position_data ||
      !note.position_data.rects ||
      note.position_data.rects.length === 0
    ) {
      return;
    }

    setCurrentPage(note.page_number);

    const event = new CustomEvent("scrollToHighlight", {
      detail: {
        pageNumber: note.page_number,
        rects: note.position_data.rects,
      },
    });
    window.document.dispatchEvent(event);
  };

  const handlePageClick = (_pdfId: string, page: number) => {
    const targetPage = page;
    setCurrentPage(targetPage);

    const event = new CustomEvent("scrollToPage", {
      detail: {
        pageNumber: targetPage,
        scrollIntoView: true,
      },
    });
    window.document.dispatchEvent(event);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !documentData?.id) return;
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
      const currentDocId = documentData.id;
      let chatConversationId = currentConversationId || "";
      if (processedDocumentRef.current !== currentDocId) {
        chatConversationId = "";
        resetConversation();
        processedMessageIds.current.clear();
      }
      processedDocumentRef.current = currentDocId;

      const chatMessage: WebSocketChatMessage = {
        conversation_id: chatConversationId,
        content: input.trim(),
        pdf_ids: [documentData.id],
        faiss_index_path: documentData.faiss_index_path || "",
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
    `;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  return (
    <div
      className={`grid lg:grid-cols-2 lg:h-[calc(100vh-112.5px)] lg:space-x-4 gap-10 lg:gap-2 ${
        !sidebarOpen ? "mt-0" : ""
      }`}
    >
      <div className="lg:hidden lg:mt-0 mt-3.5 flex flex-col items-start justify-center -mb-9">
        <h2 className="text-2xl font-bold tracking-tight">Knowledge Base</h2>
        <p className="text-secondary-foreground/50">Description subtext will go here</p>
      </div>
      <div className="h-[calc(100vh-200px)] lg:h-[calc(100vh-97.5px)] relative">
        <PdfViewer
          pdfUrl={pdfUrl}
          notes={localNotes}
          initialPage={currentPage}
          onPageChange={(page) => setCurrentPage(page)}
          isPdfsLoading={isPdfsLoading}
          pdfs={pdfs}
        />
      </div>

      <div className="lg:border lg:border-gray-200 h-full overflow-hidden flex flex-col rounded-md">
        <header className="flex items-center sticky top-0 bg-white z-10">
          <div className="flex items-center w-full lg:mx-2 mt-2">
            <Tabs
              defaultValue="detailed"
              className="h-full flex flex-col w-full"
              value={activeTab}
              onValueChange={handleTabChange}
            >
              <div className="flex items-center w-full px-0 md:px-4 mt-0 md:mt-0 mb-0 md:-mb-0 relative">
                <TabsList
                  className="flex w-full justify-start px-1 py-0 md:space-x-3 overflow-x-hidden relative"
                  style={{
                    borderRadius: "var(--border-radius-lg, 8px)",
                    background: "var(--base-border-primary, #F4F4F5)",
                    height: "var(--height-h-9, 36px)",
                    flexShrink: 0,
                  }}
                >
                  {showLeftEllipsis && (
                    <button
                      onClick={() => handleTabNavigation("prev")}
                      className="flex items-center justify-center px-2 py-1 text-sm text-gray-500 hover:bg-gray-200 rounded-md h-full"
                      aria-label="Show previous tabs"
                    >
                      ...
                    </button>
                  )}

                  {visibleTabs.map((tab) => {
                    const IconComponent = tab.icon;
                    return (
                      <TabsTrigger
                        key={tab.id}
                        value={tab.id}
                        className={`px-2 flex-1 ${
                          activeTab === tab.id
                            ? "bg-white shadow-md flex justify-center items-center gap-1"
                            : "data-[state=active]:bg-gray-100 data-[state=active]:font-semibold"
                        }`}
                        style={{
                          borderRadius: "var(--border-radius-md, 6px)",
                          boxShadow:
                            activeTab === tab.id
                              ? "0px 1px 3px 0px rgba(0, 0, 0, 0.10), 0px 1px 2px 0px rgba(0, 0, 0, 0.06)"
                              : "none",
                          flexShrink: 0,
                        }}
                      >
                        {activeTab === tab.id && <IconComponent className="mr-1" />}
                        <span className="inline">{tab.label}</span>
                      </TabsTrigger>
                    );
                  })}

                  {showRightEllipsis && (
                    <button
                      onClick={() => handleTabNavigation("next")}
                      className="flex items-center justify-center px-2 py-1 text-sm text-gray-500 hover:bg-gray-200 rounded-md h-full"
                      aria-label="Show next tabs"
                    >
                      ...
                    </button>
                  )}
                </TabsList>
              </div>

              <div className="h-[calc(100vh-350px)] lg:h-[calc(100vh-120px)] overflow-hidden">
                <TabsContent value="detailed" className="h-full mt-0 data-[state=inactive]:hidden">
                  <ScrollArea className="h-full px-0 lg:px-2 pt-4 lg:pt-6 pb-4">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-semibold mb-2">Summary</h3>
                        <div className="space-y-2 text-sm text-gray-500 border border-gray-200 px-4 py-3 rounded-lg">
                          <p>{ai_summary}</p>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>
                <TabsContent value="overview" className="h-full mt-0 data-[state=inactive]:hidden">
                  <ScrollArea className="h-full px-0 lg:px-2 pt-4 lg:pt-6 pb-4">
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600"></p>
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="notes" className="h-full flex flex-col mt-0 data-[state=inactive]:hidden">
                  <ScrollArea className="flex-1 px-0 lg:px-2 pt-4 lg:pt-6">
                    <div className="space-y-4 border border-gray-200 rounded-lg px-3 py-4 lg:p-0 lg:border-none lg:rounded-none">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold mb-0 lg:mb-2">Current Notes</h3>
                      </div>

                      {isLoadingNotes && localNotes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center min-h-96">
                          <div className="w-8 h-8 border-2 border-gray-300 border-t-primary rounded-full animate-spin mb-3"></div>
                          <p className="text-sm text-gray-500">Loading your notes...</p>
                        </div>
                      ) : localNotes.length > 0 ? (
                        localNotes.map((note) => (
                          <Card
                            key={note.id}
                            className={`shadow-none border border-gray-200 transition-all duration-300 ease-in-out group ${
                              note.isOptimistic && note.isCreating
                                ? "opacity-60 bg-blue-50 border-l-4 border-l-blue-400"
                                : note.isOptimistic && note.isUpdating
                                ? "opacity-60 bg-yellow-50 border-l-4 border-l-yellow-400"
                                : note.isOptimistic && note.isDeleting
                                ? "opacity-40 bg-red-50 border-l-4 border-l-red-400"
                                : note.isOptimistic && note.isError
                                ? "opacity-70 border-red-200 bg-red-50 border-l-4 border-l-red-500"
                                : "opacity-100 border-l-4"
                            } ${note.page_number ? "cursor-pointer hover:bg-gray-50" : "hover:bg-slate-50"}`}
                            style={{
                              ...(!(
                                note.isOptimistic &&
                                (note.isCreating || note.isUpdating || note.isDeleting || note.isError)
                              ) && { borderLeftColor: note.highlight_color || "transparent" }),
                            }}
                            onClick={() => note.page_number && !editingNoteId && navigateToHighlight(note)}
                          >
                            <div className="p-4 relative">
                              <div className="flex items-start space-x-3">
                                <Avatar className="h-8 w-8 flex-shrink-0">
                                  <AvatarImage src={user?.name || undefined} alt={user?.name || "User"} />
                                  <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
                                </Avatar>

                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <div className="flex flex-col items-start">
                                      <span className="text-sm font-semibold text-gray-800">
                                        {user?.name || "Anonymous User"}
                                      </span>
                                      <span className="text-xs font-medium text-gray-500 mt-0.5">
                                        {formatTime(note.created_at)}
                                      </span>
                                    </div>
                                    {editingNoteId !== note.id &&
                                      !(
                                        (note as any).isOptimistic &&
                                        ((note as any).isCreating || (note as any).isUpdating || (note as any).isError)
                                      ) && (
                                        <div className="flex items-center space-x-2 transition-opacity">
                                          {!(note as any).isDeleting && (
                                            <TooltipProvider delayDuration={300}>
                                              <Tooltip>
                                                <TooltipTrigger asChild>
                                                  <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-7 w-7 text-gray-500 hover:text-gray-700"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      handleStartEditNote(note.id, note.note_content);
                                                    }}
                                                  >
                                                    <Pencil className="h-4 w-4" />
                                                  </Button>
                                                </TooltipTrigger>
                                                <TooltipContent side="top">
                                                  <p>Edit note</p>
                                                </TooltipContent>
                                              </Tooltip>
                                            </TooltipProvider>
                                          )}
                                          <TooltipProvider delayDuration={300}>
                                            <Tooltip>
                                              <TooltipTrigger asChild>
                                                <Button
                                                  variant="outline"
                                                  size="icon"
                                                  className="h-7 w-7 text-gray-500 hover:text-red-500"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteNote(note.id);
                                                  }}
                                                  disabled={(note as any).isOptimistic && !(note as any).isDeleting}
                                                >
                                                  {(note as any).isDeleting ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                  ) : (
                                                    <Trash2 className="h-4 w-4" />
                                                  )}
                                                </Button>
                                              </TooltipTrigger>
                                              <TooltipContent side="top">
                                                <p>Delete note</p>
                                              </TooltipContent>
                                            </Tooltip>
                                          </TooltipProvider>
                                        </div>
                                      )}
                                  </div>
                                </div>
                              </div>
                              <div className="mt-3.5">
                                {note.highlighted_text && (
                                  <p className="text-sm text-gray-500 mb-2 italic">"{note.highlighted_text}"</p>
                                )}
                                {editingNoteId === note.id ? (
                                  <div className="flex flex-col gap-2 mt-2">
                                    <Textarea
                                      value={editNoteContent}
                                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                        setEditNoteContent(e.target.value)
                                      }
                                      className="min-h-[80px] text-sm"
                                      placeholder="Edit your note..."
                                      autoFocus
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                    <div className="flex justify-end gap-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setEditingNoteId(null);
                                        }}
                                      >
                                        Cancel
                                      </Button>
                                      <Button
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleSubmitEditNote(note.id);
                                        }}
                                        disabled={updateNoteMutation.isPending}
                                      >
                                        {updateNoteMutation.isPending ? (
                                          <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                                        ) : null}
                                        Save
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center">
                                    <p className="text-sm text-gray-800 break-words whitespace-pre-wrap">
                                      {note.note_content}
                                    </p>
                                    {note.isOptimistic && note.isCreating && (
                                      <div className="flex items-center ml-2">
                                        <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
                                      </div>
                                    )}
                                    {note.isOptimistic && note.isUpdating && (
                                      <div className="flex items-center ml-2">
                                        <Loader2 className="h-3 w-3 animate-spin text-yellow-500" />
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                              {isMultiSelectActive && !((note as any).isOptimistic || note.isDeleting) && (
                                <div className="absolute top-3 right-3">
                                  <Checkbox
                                    checked={selectedNoteIds.includes(note.id)}
                                    onCheckedChange={() => toggleNoteSelection(note.id)}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </div>
                              )}
                            </div>
                          </Card>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center min-h-96">
                          <div className="bg-gray-100 rounded-full p-4 mb-3">
                            <Pencil className="h-6 w-6 text-gray-400" />
                          </div>
                          <p className="text-sm font-medium text-gray-700 mb-1">No notes yet</p>
                          <p className="text-sm text-gray-500 max-w-sm">
                            Highlight text in the document or add notes directly to keep track of important information.
                          </p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>

                  <div className="px-2 py-4 sm:py-8 mt-auto">
                    <form onSubmit={handleCreateNote} className="relative">
                      <Input
                        placeholder="Input your note here"
                        className="pr-10 py-5 focus-visible:ring-0 text-sm"
                        value={newNoteContent}
                        onChange={(e) => setNewNoteContent(e.target.value)}
                      />
                      <Button
                        type="submit"
                        size="icon"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7"
                        disabled={createNoteMutation.isPending || !newNoteContent.trim()}
                      >
                        {createNoteMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Pencil className="h-4 w-4" />
                        )}
                      </Button>
                    </form>
                  </div>
                </TabsContent>

                <TabsContent value="ai-chat" className="h-full flex flex-col mt-0 data-[state=inactive]:hidden">
                  <ScrollArea className="flex-1 lg:px-2 pt-4 lg:pt-6" ref={chatContentRef}>
                    <div className="space-y-6 border border-gray-200 rounded-lg px-3 py-4 lg:p-0 lg:border-none lg:rounded-none">
                      {isIndexLoading ? (
                        <div className="flex items-center justify-center p-8">
                          <RotateCw className="h-6 w-6 animate-spin" />
                        </div>
                      ) : !isIndexBuilt ? (
                        <div className="flex items-center justify-center p-8 text-red-500">
                          Failed to initialize chat. Please try again.
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 rounded-full bg-green-200 flex items-center justify-center flex-shrink-0">
                              <span className="text-sm font-semibold">AI</span>
                            </div>
                            <div className="flex-1">
                              <div
                                className="font-medium mb-2"
                                style={{
                                  color: "var(--base-accent-secondary, #18181B)",
                                  fontSize: "var(--typography-base-sizes-small-font-size, 14px)",
                                  fontStyle: "normal",
                                  fontWeight: "var(--font-weight-bold, 500)",
                                  lineHeight: "100%",
                                  alignSelf: "stretch",
                                }}
                              >
                                AI Assistant
                              </div>
                              <div className="flex min-h-[60px] p-2 px-3 items-start gap-[10px] flex-shrink-0 self-stretch rounded-md border border-[#E4E4E7] bg-[#FCFBFC] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] text-sm text-gray-600">
                                Type a message for me to help you out with reviewing this document, provide valuable
                                information and things beyond that.
                              </div>
                              <div className="flex items-center space-x-0 mt-2">
                                <button className="p-2 hover:bg-gray-100 rounded-md">
                                  <RotateIcon />
                                </button>
                                <button className="p-2 hover:bg-gray-100 rounded-md">
                                  <PasteIcon />
                                </button>
                                <button className="p-2 hover:bg-gray-100 rounded-md">
                                  <SaveIcon />
                                </button>
                                <div className="flex-1" />
                                <button className="flex items-center space-x-2.5 text-sm font-medium hover:bg-gray-100 rounded-md px-3 py-2">
                                  <DiveDeeperIcon />
                                  <span className="text-xs font-semibold text-neutral-700">Dive Deeper</span>
                                </button>
                              </div>
                            </div>
                          </div>

                          {messages.map((message, i) => {
                            if (message.isStepProgress && message.stepDetails) {
                              const currentStepDetail = message.stepDetails;
                              const currentStepKey = currentStepDetail.step as keyof typeof CHAT_STEPS;

                              return (
                                <div
                                  key={`step-progress-container-${i}`}
                                  className="flex items-start space-x-3 w-full mb-4 pb-4"
                                >
                                  <div className="w-8 h-8 rounded-full bg-green-200 flex items-center justify-center flex-shrink-0 mt-1">
                                    <span className="text-sm font-semibold">AI</span>
                                  </div>
                                  <div className="flex-1">
                                    <div
                                      className="font-medium mb-2"
                                      style={{
                                        color: "var(--base-accent-secondary, #18181B)",
                                        fontSize: "var(--typography-base-sizes-small-font-size, 14px)",
                                        fontStyle: "normal",
                                        fontWeight: "var(--font-weight-bold, 500)",
                                        lineHeight: "100%",
                                        alignSelf: "stretch",
                                      }}
                                    >
                                      AI Assistant
                                    </div>
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
                                          const currentGlobalStepIndex = CHAT_STEP_VALUES.indexOf(
                                            currentStepDetail.step
                                          );
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

                                      {currentStepKey === CHAT_STEPS.GENERATING_RESPONSE &&
                                        accumulatedSteps.length <= 1 && (
                                          <div className="flex items-start space-x-3 py-2">
                                            <div className="flex flex-col items-center">
                                              <div className="w-5 h-5 rounded-full flex items-center justify-center bg-blue-500 ring-4 ring-blue-200 ring-opacity-50 transition-all duration-300">
                                                <MessageCircleDashed className="w-3 h-3 text-white" />
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
                                        message.role === "assistant"
                                          ? "text-sm font-semibold"
                                          : "text-[9px] font-semibold text-white"
                                      }`}
                                      style={{
                                        ...(message.role !== "assistant" && {
                                          fontStyle: "normal",
                                          lineHeight: "100%",
                                        }),
                                      }}
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
                                        alignSelf: "stretch",
                                      }}
                                    >
                                      {message.role === "assistant" ? "AI Assistant" : user?.name}
                                    </div>
                                    <div
                                      className={`flex p-2 px-3 items-start gap-[10px] flex-shrink-0 self-stretch rounded-md border border-[#E4E4E7] bg-[#FCFBFC] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] text-sm ${
                                        message.role === "assistant"
                                          ? "text-gray-600"
                                          : "text-neutral-800 font-semibold"
                                      }`}
                                    >
                                      {message.role === "assistant" &&
                                      message.isThinking &&
                                      message.animationId &&
                                      animatingMessageIds.has(message.animationId) ? (
                                        <>
                                          <div className="w-full">
                                            <ResponseArrived
                                              onComplete={() => handleAnimationComplete(message.animationId as string)}
                                            />
                                          </div>
                                        </>
                                      ) : (
                                        <MessageContent content={message.content} onPageClick={handlePageClick} />
                                      )}
                                    </div>
                                    {message.role === "assistant" && (
                                      <div className="flex items-center space-x-0 mt-2">
                                        <button className="p-2 hover:bg-gray-100 rounded-md">
                                          <RotateIcon />
                                        </button>
                                        <button className="p-2 hover:bg-gray-100 rounded-md">
                                          <PasteIcon />
                                        </button>
                                        <button className="p-2 hover:bg-gray-100 rounded-md">
                                          <SaveIcon />
                                        </button>
                                        <div className="flex-1" />
                                        <button className="flex items-center space-x-1 text-sm font-medium hover:bg-gray-100 rounded-md px-3 py-2">
                                          <DiveDeeperIcon />
                                          <span>Dive Deeper</span>
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          })}
                        </>
                      )}
                    </div>
                  </ScrollArea>
                  {isIndexBuilt && (
                    <div className="px-2 py-6 sm:py-8 mt-auto chat-input-area">
                      <div
                        className="border rounded-lg px-3 py-1 lg:py-0 flex lg:flex-col"
                        style={{
                          borderColor: "var(--color-border-secondary, #D8DADA)",
                          background: "var(--color-background-secondary, #FCFBFC)",
                        }}
                      >
                        <Input
                          type="text"
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyDown={handleKeyPress}
                          className="hidden lg:block w-full border-0 shadow-none focus-visible:ring-0 bg-transparent text-stone-700 text-sm px-0"
                          placeholder="Ask your question in this field to start chatting with AI..."
                          disabled={isLoading}
                        />

                        <Input
                          type="text"
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyDown={handleKeyPress}
                          className="lg:hidden w-full border-0 shadow-none focus-visible:ring-0 bg-transparent text-stone-700 text-sm px-0"
                          placeholder="Start chatting with AI..."
                          disabled={isLoading}
                        />

                        <div className="flex gap-3 lg:gap-0 items-center justify-between mt-0">
                          <div className="flex items-center gap-4">
                            <AtSignIcon />
                          </div>
                          <Button
                            onClick={handleSendMessage}
                            disabled={!input.trim() || isLoading}
                            variant="default"
                            size="icon"
                            className="h-7 w-7 lg:h-8 lg:w-8 mb-[0.05rem] lg:mb-2 rounded-md bg-gray-900 text-white"
                          >
                            <SendIcon />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </header>
      </div>
    </div>
  );
}
