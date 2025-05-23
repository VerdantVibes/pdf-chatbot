import React, { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PdfViewer } from "./PdfViewer";
import { Pencil, Trash2, Loader2, RotateCw } from "lucide-react";
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
import { sendChatMessage, buildChatIndex } from "@/lib/api/chat";
import { MessageContent } from "@/components/chat/MessageContent";
import { toast } from "sonner";
import { useAuth } from "@/lib/context/AuthContext";

interface DocumentViewerProps {
  pdfUrl: string;
  document: any;
  sidebarOpen?: boolean;
}

interface IconProps {
  className?: string;
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

export function DocumentViewer({ pdfUrl, document: documentData, sidebarOpen = false }: DocumentViewerProps) {
  const { analysis = {} } = documentData || {};
  const { ai_summary } = analysis;

  const [newNoteContent, setNewNoteContent] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editNoteContent, setEditNoteContent] = useState("");
  const [deletingNoteIds, _setDeletingNoteIds] = useState<string[]>([]);
  const [localNotes, setLocalNotes] = useState<NoteResponse[]>([]);
  const [selectedNoteIds, setSelectedNoteIds] = useState<string[]>([]);
  const [isMultiSelectActive, _setIsMultiSelectActive] = useState(false);

  const { data: serverNotes = [], isLoading: isLoadingNotes, refetch: refetchNotes } = useGetPdfNotes(documentData?.id);

  const createNoteMutation = useCreateNote();
  const updateNoteMutation = useUpdateNote();
  const deleteNoteMutation = useDeleteNote();

  const [isIndexBuilt, setIsIndexBuilt] = useState(false);
  const [isIndexLoading, setIsIndexLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);

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

      // Check if index is already built for this document
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

          // Store the built index information
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

    const originalNote = localNotes.find((note) => note.id === noteId);
    if (!originalNote) return;

    setEditingNoteId(null);
    setEditNoteContent("");

    handleUpdateNote(noteId, { note_content: editNoteContent }, originalNote);
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

    const event = new CustomEvent("scrollToHighlight", {
      detail: {
        pageNumber: note.page_number,
        rects: note.position_data.rects,
      },
    });
    window.document.dispatchEvent(event);
  };

  const [activeTab, setActiveTab] = useState("overview");

  // Add AI chat related state
  interface Message {
    role: "assistant" | "user";
    content: string;
    timestamp: Date;
  }
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>();
  const chatContentRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading || !documentData?.id) return;

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setInput("");
    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);
    setIsLoading(true);

    try {
      const response = await sendChatMessage({
        conversation_id: conversationId || "",
        content: input.trim(),
        pdf_ids: [documentData.id],
        faiss_index_path: documentData.faiss_index_path || "",
      });

      setConversationId(response.conversation_id);

      const cleanContent = response.content.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

      const assistantMessage: Message = {
        role: "assistant",
        content: cleanContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setIsTyping(false);
      setIsLoading(false);
    }
  };

  const handlePageClick = (_pdfId: string, page: number) => {
    // Ensure we're using the exact page number from the citation
    const targetPage = page;
    setCurrentPage(targetPage);

    // Trigger page navigation in PDF viewer
    const event = new CustomEvent("scrollToPage", {
      detail: {
        pageNumber: targetPage,
        scrollIntoView: true,
      },
    });
    window.document.dispatchEvent(event);
  };

  return (
    <div className={`flex h-[calc(100vh-80px)] space-x-4 ${!sidebarOpen ? "mt-4" : ""}`}>
      <div className="w-1/2 h-[calc(100vh-65px)] relative">
        <PdfViewer
          pdfUrl={pdfUrl}
          notes={localNotes}
          initialPage={currentPage}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>

      <div className="w-1/2 border border-gray-200 h-full bg-white overflow-hidden flex flex-col rounded-md">
        <header className="relative flex items-center">
          <div className="flex items-center w-full mx-2 mt-2">
            <Tabs
              defaultValue="overview"
              className="h-full flex flex-col w-full"
              onValueChange={(value) => setActiveTab(value)}
            >
              <TabsList
                className="flex w-full justify-start p-0 space-x-3"
                style={{
                  borderRadius: "var(--border-radius-lg, 8px)",
                  background: "var(--base-border-primary, #F4F4F5)",
                  height: "var(--height-h-9, 36px)",
                  flexShrink: 0,
                }}
              >
                <TabsTrigger
                  value="overview"
                  className={`px-2 ${
                    activeTab === "overview"
                      ? "bg-white shadow-md flex justify-center items-center gap-1"
                      : "data-[state=active]:bg-gray-100 data-[state=active]:font-semibold"
                  }`}
                  style={{
                    borderRadius: "var(--border-radius-md, 6px)",
                    boxShadow:
                      activeTab === "overview"
                        ? "0px 1px 3px 0px rgba(0, 0, 0, 0.10), 0px 1px 2px 0px rgba(0, 0, 0, 0.06)"
                        : "none",
                    flexShrink: 0,
                  }}
                >
                  {activeTab === "overview" && <OverviewIcon />}
                  Overview Summary
                </TabsTrigger>
                <TabsTrigger
                  value="detailed"
                  className={`px-2 ${
                    activeTab === "detailed"
                      ? "bg-white shadow-md flex justify-center items-center gap-1"
                      : "data-[state=active]:bg-gray-100 data-[state=active]:font-semibold"
                  }`}
                  style={{
                    borderRadius: "var(--border-radius-md, 6px)",
                    boxShadow:
                      activeTab === "detailed"
                        ? "0px 1px 3px 0px rgba(0, 0, 0, 0.10), 0px 1px 2px 0px rgba(0, 0, 0, 0.06)"
                        : "none",
                    flexShrink: 0,
                  }}
                >
                  {activeTab === "detailed" && <DetailedIcon />}
                  Detailed Summary
                </TabsTrigger>
                <TabsTrigger
                  value="notes"
                  className={`px-2 ${
                    activeTab === "notes"
                      ? "bg-white shadow-md flex justify-center items-center gap-1"
                      : "data-[state=active]:bg-gray-100 data-[state=active]:font-semibold"
                  }`}
                  style={{
                    borderRadius: "var(--border-radius-md, 6px)",
                    boxShadow:
                      activeTab === "notes"
                        ? "0px 1px 3px 0px rgba(0, 0, 0, 0.10), 0px 1px 2px 0px rgba(0, 0, 0, 0.06)"
                        : "none",
                    flexShrink: 0,
                  }}
                >
                  {activeTab === "notes" && <NotesIcon />}
                  Notes
                </TabsTrigger>
                <TabsTrigger
                  value="ai-chat"
                  className={`px-2 ${
                    activeTab === "ai-chat"
                      ? "bg-white shadow-md flex justify-center items-center gap-1"
                      : "data-[state=active]:bg-gray-100 data-[state=active]:font-semibold"
                  }`}
                  style={{
                    borderRadius: "var(--border-radius-md, 6px)",
                    boxShadow:
                      activeTab === "ai-chat"
                        ? "0px 1px 3px 0px rgba(0, 0, 0, 0.10), 0px 1px 2px 0px rgba(0, 0, 0, 0.06)"
                        : "none",
                    flexShrink: 0,
                  }}
                >
                  {activeTab === "ai-chat" && <ChatIcon />}
                  AI Chat
                </TabsTrigger>
              </TabsList>

              <div className="h-[calc(100vh-130px)] overflow-hidden">
                <TabsContent value="overview" className="h-full mt-0 data-[state=inactive]:hidden">
                  <ScrollArea className="h-full px-2 pt-6 pb-4">
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

                <TabsContent value="detailed" className="h-full mt-0 data-[state=inactive]:hidden">
                  <ScrollArea className="h-full px-2 pt-6 pb-4">
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">Detailed summary will be available here.</p>
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="notes" className="h-full flex flex-col mt-0 data-[state=inactive]:hidden">
                  <ScrollArea className="flex-1 px-2 pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold mb-2">Current Notes</h3>
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
                            className={`p-4 shadow-none border-gray-200 transition-all duration-300 ${
                              note.isOptimistic && note.isCreating
                                ? "opacity-60 bg-blue-50 border-l-4 border-l-blue-400"
                                : note.isOptimistic && note.isUpdating
                                ? "opacity-60 bg-yellow-50 border-l-4 border-l-yellow-400"
                                : note.isOptimistic && note.isDeleting
                                ? "opacity-40 bg-red-50 border-l-4 border-l-red-400"
                                : note.isOptimistic && note.isError
                                ? "opacity-70 border-red-200 bg-red-50 border-l-4 border-l-red-500"
                                : "opacity-100"
                            } ${note.page_number ? "cursor-pointer hover:bg-gray-50" : ""}`}
                            onClick={() => note.page_number && navigateToHighlight(note)}
                          >
                            <div className="flex items-start">
                              {isMultiSelectActive && !note.isDeleting && (
                                <div className="mt-1 mr-2">
                                  <Checkbox
                                    checked={selectedNoteIds.includes(note.id)}
                                    onCheckedChange={() => toggleNoteSelection(note.id)}
                                    disabled={note.isOptimistic}
                                  />
                                </div>
                              )}
                              <div
                                className="w-4 h-4 rounded mt-0.5 mr-2 flex-shrink-0"
                                style={{ backgroundColor: note.highlight_color || "" }}
                              />
                              <div className="flex-1">
                                {note.highlighted_text && (
                                  <div className="text-sm text-gray-700 font-medium mb-1">{note.highlighted_text}</div>
                                )}
                                {editingNoteId === note.id ? (
                                  <div className="flex flex-col gap-2 mt-2">
                                    <Textarea
                                      value={editNoteContent}
                                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                        setEditNoteContent(e.target.value)
                                      }
                                      className="min-h-[100px] text-sm"
                                      placeholder="Edit your note..."
                                      autoFocus
                                    />
                                    <div className="flex justify-end gap-2">
                                      <Button size="sm" variant="outline" onClick={() => setEditingNoteId(null)}>
                                        Cancel
                                      </Button>
                                      <Button
                                        size="sm"
                                        onClick={() => handleSubmitEditNote(note.id)}
                                        disabled={updateNoteMutation.isPending}
                                      >
                                        Save
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center">
                                    <p className="text-sm text-gray-700 break-words">{note.note_content}</p>
                                    {note.isCreating && (
                                      <div className="flex items-center ml-2">
                                        <Loader2 className="h-3 w-3 animate-spin text-blue-400" />
                                      </div>
                                    )}
                                    {note.isUpdating && (
                                      <div className="flex items-center ml-2">
                                        <Loader2 className="h-3 w-3 animate-spin text-yellow-400" />
                                      </div>
                                    )}
                                    {note.isDeleting && (
                                      <div className="flex items-center ml-2">
                                        <Loader2 className="h-3 w-3 animate-spin text-red-400" />
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                              {editingNoteId !== note.id && !isMultiSelectActive && !note.isDeleting && (
                                <div className="flex space-x-2 ml-5">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-7 w-7 text-gray-600 hover:text-gray-800"
                                    onClick={() => handleStartEditNote(note.id, note.note_content)}
                                    disabled={note.isOptimistic || note.isDeleting}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className={`h-7 w-7 ${
                                      note.isDeleting ? "text-red-600" : "text-gray-600 hover:text-gray-800"
                                    }`}
                                    onClick={() => handleDeleteNote(note.id)}
                                    disabled={deletingNoteIds.includes(note.id) || note.isOptimistic || note.isDeleting}
                                  >
                                    {deletingNoteIds.includes(note.id) || note.isDeleting ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="h-4 w-4" />
                                    )}
                                  </Button>
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

                  <div className="px-2 py-4 mt-auto">
                    <form onSubmit={handleCreateNote} className="relative">
                      <Input
                        placeholder="Input your note here"
                        className="pr-10 py-5 focus-visible:ring-0"
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
                  <ScrollArea className="flex-1 px-2 pt-6" ref={chatContentRef}>
                    <div className="space-y-6">
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
                          {/* Initial AI Assistant Message */}
                          <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 rounded-full bg-[#E6E8EF] flex items-center justify-center flex-shrink-0">
                              <span className="text-sm font-medium">AI</span>
                            </div>
                            <div className="flex-1">
                              <div
                                className="font-medium mb-2"
                                style={{
                                  color: "var(--base-accent-secondary, #18181B)",
                                  fontFamily: "var(--typography-font-family-font-sans, Inter)",
                                  fontSize: "var(--typography-base-sizes-small-font-size, 14px)",
                                  fontStyle: "normal",
                                  fontWeight: "var(--font-weight-bold, 700)",
                                  lineHeight: "100%",
                                  alignSelf: "stretch",
                                }}
                              >
                                AI Assistant
                              </div>
                              <div className="flex h-[79px] min-h-[60px] p-2 px-3 items-start gap-[10px] flex-shrink-0 self-stretch rounded-md border border-[#E4E4E7] bg-[#FCFBFC] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] text-sm text-gray-600">
                                Type a message for me to help you out with reviewing this document, provide valuable
                                information and things beyond that.
                              </div>
                              <div className="flex items-center space-x-2 mt-2">
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
                            </div>
                          </div>

                          {/* Chat Messages */}
                          {messages.map((message, i) => (
                            <div key={i} className="flex items-start space-x-3">
                              <div
                                className={`w-8 h-8 rounded-full ${
                                  message.role === "assistant" ? "bg-[#E6E8EF]" : "bg-[#C2DEC0]"
                                } flex items-center justify-center flex-shrink-0`}
                              >
                                <span
                                  className={`${
                                    message.role === "assistant" ? "text-sm font-medium" : "text-[9px] font-bold"
                                  }`}
                                  style={{
                                    ...(message.role !== "assistant" && {
                                      color: "var(--base-accent-secondary, #18181B)",
                                      fontFamily: "var(--typography-font-family-font-sans, Inter)",
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
                                  className="font-medium mb-2"
                                  style={{
                                    color: "var(--base-accent-secondary, #18181B)",
                                    fontFamily: "var(--typography-font-family-font-sans, Inter)",
                                    fontSize: "var(--typography-base-sizes-small-font-size, 14px)",
                                    fontStyle: "normal",
                                    fontWeight: "var(--font-weight-bold, 700)",
                                    lineHeight: "100%",
                                    alignSelf: "stretch",
                                  }}
                                >
                                  {message.role === "assistant" ? "AI Assistant" : user?.name}
                                </div>
                                <div className="flex min-h-[60px] p-2 px-3 items-start gap-[10px] flex-shrink-0 self-stretch rounded-md border border-[#E4E4E7] bg-[#FCFBFC] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] text-sm text-gray-600">
                                  <MessageContent content={message.content} onPageClick={handlePageClick} />
                                </div>
                                {message.role === "assistant" && (
                                  <div className="flex items-center space-x-2 mt-2">
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
                          ))}
                          {isTyping && (
                            <div className="flex justify-start">
                              <div className="bg-stone-100 rounded-lg px-4 py-2">
                                <RotateCw className="h-4 w-4 animate-spin" />
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </ScrollArea>
                  {isIndexBuilt && (
                    <div className="px-2 py-2 mt-auto">
                      <div
                        className="border rounded-lg px-5 py-2 flex flex-col"
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
                          className="w-full border-0 shadow-none focus-visible:ring-0 bg-transparent text-stone-700 text-sm px-0"
                          placeholder="Ask your question in this field to start chatting with AI..."
                          disabled={isLoading}
                        />

                        {/* Input Controls */}
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-4">
                            <AtSignIcon />
                          </div>
                          <Button
                            onClick={handleSendMessage}
                            disabled={!input.trim() || isLoading}
                            variant="default"
                            size="icon"
                            className="h-9 w-9 rounded-md bg-gray-900 text-white"
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
