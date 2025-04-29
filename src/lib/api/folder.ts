import { axiosInstance as Axios } from "../axiosInterceptor";

export interface Folder {
  name: string;
}

export const getFolders = async (): Promise<Folder[]> => {
  try {
    const response = await Axios.get("/folder/");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch folders:", error);
    throw error;
  }
};

export const createFolder = async (name: string): Promise<Folder> => {
  try {
    const response = await Axios.post("/folder/", { name });
    return response.data;
  } catch (error) {
    console.error("Failed to create folder:", error);
    throw error;
  }
};

export interface MoveToFolderResponse {
  status: string;
  message: string;
  moved_pdf_ids: string[];
  failed_pdf_ids: string[];
  folder_name: string;
}

export const movePdfsToFolder = async (pdf_ids: string[], folder_name: string): Promise<MoveToFolderResponse> => {
  try {
    const response = await Axios.patch("/pdf/move-to-folder", {
      pdf_ids,
      folder_name,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to move PDFs to folder:", error);
    throw error;
  }
};
