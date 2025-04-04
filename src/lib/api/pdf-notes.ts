import { axiosInstance } from "@/lib/axiosInterceptor";
import { useMutation, useQuery, useQueryClient, UseMutationResult, UseQueryResult } from "@tanstack/react-query";
import { v4 as uuidv4 } from "uuid";

export interface PositionData {
  rects: number[][];
  page_width: number;
  page_height: number;
  text_node_indices: number[];
  text_context: string;
  character_start_index: number;
  character_end_index: number;
}

export interface NoteCreate {
  pdf_id: string;
  page_number?: number;
  highlighted_text?: string;
  note_content: string;
  position_data?: PositionData;
  highlight_color?: string;
}

export interface NoteUpdate {
  highlighted_text?: string;
  note_content?: string;
  position_data?: PositionData;
  highlight_color?: string;
  page_number?: number;
}

export interface NoteResponse {
  id: string;
  pdf_id: string;
  page_number: number;
  highlighted_text: string;
  note_content: string;
  position_data: PositionData;
  highlight_color: string;
  created_at: string;
  updated_at: string;
  isOptimistic?: boolean;
  isCreating?: boolean;
  isUpdating?: boolean;
  isDeleting?: boolean;
  isError?: boolean;
}

export const pdfNotesApi = {
  createNote: async (noteData: NoteCreate): Promise<NoteResponse> => {
    const response = await axiosInstance.post("/pdf-notes/", noteData);
    return response.data;
  },

  getNote: async (noteId: string): Promise<NoteResponse> => {
    const response = await axiosInstance.get(`/pdf-notes/${noteId}`);
    return response.data;
  },

  updateNote: async (noteId: string, noteData: NoteUpdate): Promise<NoteResponse> => {
    const response = await axiosInstance.put(`/pdf-notes/${noteId}`, noteData);
    return response.data;
  },

  deleteNote: async (noteId: string, permanent = false): Promise<string> => {
    const response = await axiosInstance.delete(`/pdf-notes/${noteId}`, {
      params: { permanent },
    });
    return response.data;
  },

  getPdfNotes: async (pdfId: string, pageNumber?: number): Promise<NoteResponse[]> => {
    const response = await axiosInstance.get(`/pdf-notes/pdf/${pdfId}`, {
      params: { page_number: pageNumber },
    });
    return response.data;
  },

  getNoteLocation: async (noteId: string): Promise<Record<string, any>> => {
    const response = await axiosInstance.get(`/pdf-notes/${noteId}/locate`);
    return response.data;
  },
};

export const useCreateNote = (): UseMutationResult<NoteResponse, Error, NoteCreate> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: pdfNotesApi.createNote,
    onMutate: async (newNote) => {
      await queryClient.cancelQueries({ queryKey: ["pdf-notes", newNote.pdf_id] });

      const previousNotes = queryClient.getQueryData<NoteResponse[]>(["pdf-notes", newNote.pdf_id]) || [];

      const optimisticId = uuidv4();
      const optimisticNote: NoteResponse = {
        id: optimisticId,
        pdf_id: newNote.pdf_id,
        page_number: newNote.page_number || 0,
        highlighted_text: newNote.highlighted_text || "",
        note_content: newNote.note_content,
        position_data: newNote.position_data || {
          rects: [],
          page_width: 0,
          page_height: 0,
          text_node_indices: [],
          text_context: "",
          character_start_index: 0,
          character_end_index: 0,
        },
        highlight_color: newNote.highlight_color || "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        isOptimistic: true,
        isCreating: true,
      };

      queryClient.setQueryData<NoteResponse[]>(["pdf-notes", newNote.pdf_id], [...previousNotes, optimisticNote]);

      return { previousNotes, optimisticId };
    },
    onError: (err, newNote, context) => {
      if (context?.previousNotes) {
        queryClient.setQueryData(["pdf-notes", newNote.pdf_id], context.previousNotes);
      }
    },
    onSuccess: (data, variables, context) => {
      const currentNotes = queryClient.getQueryData<NoteResponse[]>(["pdf-notes", variables.pdf_id]) || [];

      if (context?.optimisticId) {
        const updatedNotes = currentNotes.map((note) =>
          note.id === context.optimisticId ? { ...data, isOptimistic: false, isCreating: false } : note
        );

        queryClient.setQueryData<NoteResponse[]>(["pdf-notes", variables.pdf_id], updatedNotes);
      } else {
        queryClient.setQueryData<NoteResponse[]>(["pdf-notes", variables.pdf_id], [...currentNotes, data]);
      }

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["pdf-notes", variables.pdf_id] });
      }, 500);
    },
  });
};

export const useGetNote = (noteId: string): UseQueryResult<NoteResponse, Error> => {
  return useQuery({
    queryKey: ["note", noteId],
    queryFn: () => pdfNotesApi.getNote(noteId),
    enabled: !!noteId,
    placeholderData: (data) => data,
  });
};

export const useUpdateNote = (): UseMutationResult<NoteResponse, Error, { noteId: string; noteData: NoteUpdate }> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ noteId, noteData }) => pdfNotesApi.updateNote(noteId, noteData),
    onSuccess: (data) => {},
  });
};

export const useDeleteNote = (): UseMutationResult<string, Error, { noteId: string; permanent?: boolean }> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ noteId, permanent }) => pdfNotesApi.deleteNote(noteId, permanent),
    onSuccess: () => {},
  });
};

export const useGetPdfNotes = (pdfId: string, pageNumber?: number): UseQueryResult<NoteResponse[], Error> => {
  return useQuery({
    queryKey: ["pdf-notes", pdfId, pageNumber],
    queryFn: () => pdfNotesApi.getPdfNotes(pdfId, pageNumber),
    enabled: !!pdfId,
    placeholderData: (data) => data,
  });
};

export const useGetNoteLocation = (noteId: string): UseQueryResult<Record<string, any>, Error> => {
  return useQuery({
    queryKey: ["note-location", noteId],
    queryFn: () => pdfNotesApi.getNoteLocation(noteId),
    enabled: !!noteId,
    placeholderData: (data) => data,
  });
};
