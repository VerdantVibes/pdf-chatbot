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
