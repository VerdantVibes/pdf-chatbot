import { axiosInstance } from '@/lib/axiosInterceptor';

export const uploadPdf = async (formData: FormData) => {
  const response = await axiosInstance.post('/pdf/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getPdfContent = async (pdfId: string) => {
  return await axiosInstance.get(`/pdf/${pdfId}/content`, {
    responseType: 'blob'
  });
};

export const getPdfUrl = async (pdfId: string) => {
  try {
    const response = await axiosInstance.get(`/pdfs/${pdfId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch PDF URL for ID ${pdfId}:`, error);
    throw error;
  }
};

export const getSelectedPdfs = async (pdfIds: string[]) => {
  try {
    const response = await axiosInstance.post('/pdfs/selected', {
      pdf_ids: pdfIds
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch selected PDFs:', error);
    throw error;
  }
}; 