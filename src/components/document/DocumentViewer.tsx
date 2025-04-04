import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PdfViewer } from "./PdfViewer";
import { Pencil, Trash2, Loader2 } from "lucide-react";
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

interface DocumentViewerProps {
  pdfUrl: string;
  document: any;
  sidebarOpen?: boolean;
}

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

  const handleDeleteNote = (noteId: string, pdfId: string) => {
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

  // Add a function to handle clicking on a note to navigate to its highlight
  const navigateToHighlight = (note: NoteResponse) => {
    if (!note.page_number || !note.position_data || !note.position_data.rects || note.position_data.rects.length === 0) {
      return;
    }

    // Dispatch an event that the PDF viewer is listening for
    const event = new CustomEvent("scrollToHighlight", {
      detail: {
        pageNumber: note.page_number,
        rects: note.position_data.rects
      }
    });
    window.document.dispatchEvent(event);
  };

  return (
    <div className={`flex h-[calc(100vh-80px)] space-x-4 ${!sidebarOpen ? "mt-4" : ""}`}>
      <div className="w-1/2 h-[calc(100vh-65px)] relative">
        <PdfViewer pdfUrl={pdfUrl} />
      </div>

      <div className="w-1/2 border border-gray-200 h-full bg-white overflow-hidden flex flex-col rounded-md">
        <header className="relative flex items-center">
          <div className="flex items-center w-full mx-2 mt-2">
            <Tabs defaultValue="overview" className="h-full flex flex-col w-full">
              <TabsList className="flex w-full justify-start bg-white p-0 h-10 space-x-3">
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:bg-gray-100 data-[state=active]:font-semibold data-[state=active]:ml-2 px-2"
                >
                  Overview Summary
                </TabsTrigger>
                <TabsTrigger
                  value="detailed"
                  className="data-[state=active]:bg-gray-100 data-[state=active]:font-semibold data-[state=active]:ml-2 px-2"
                >
                  Detailed Summary
                </TabsTrigger>
                <TabsTrigger
                  value="notes"
                  className="data-[state=active]:bg-gray-100 data-[state=active]:font-semibold data-[state=active]:ml-2 px-2"
                >
                  Notes
                </TabsTrigger>
                <TabsTrigger
                  value="ai-chat"
                  className="data-[state=active]:bg-gray-100 data-[state=active]:font-semibold px-2"
                >
                  AI Chat
                </TabsTrigger>
              </TabsList>

              <div className="h-[calc(100vh-130px)] overflow-hidden">
                <TabsContent value="overview" className="h-full mt-0">
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

                <TabsContent value="detailed" className="h-full mt-0">
                  <ScrollArea className="h-full px-2 pt-6 pb-4">
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">Detailed summary will be available here.</p>
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="notes" className="h-full flex flex-col mt-0">
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
                            } ${note.page_number ? 'cursor-pointer hover:bg-gray-50' : ''}`}
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
                                  <div className="text-sm text-gray-700 font-medium mb-1">
                                    {note.highlighted_text}
                                  </div>
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
                                    onClick={() => handleDeleteNote(note.id, documentData.id)}
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

                <TabsContent value="ai-chat" className="h-full mt-0">
                  <ScrollArea className="h-full px-2 pt-6 pb-4">
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">AI chat will be available here.</p>
                    </div>
                  </ScrollArea>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </header>
      </div>
    </div>
  );
}
