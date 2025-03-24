import { axiosInstance as Axios } from "../axiosInterceptor";

export const getPdfContent = async (pdfId: string) => {
  try {
    const response = await Axios.get(`/pdf/${pdfId}/content`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch PDF content for ID ${pdfId}:`, error);
    throw error;
  }
};

export const getPdfUrl = async (pdfId: string) => {
  try {
    const response = await Axios.get(`/pdfs/${pdfId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch PDF URL for ID ${pdfId}:`, error);
    throw error;
  }
};

export const getSelectedPdfs = async (pdfIds: string[]) => {
  try {
    const response = await Axios.post('/pdfs/selected', {
      pdf_ids: pdfIds
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch selected PDFs:', error);
    throw error;
  }
}; 