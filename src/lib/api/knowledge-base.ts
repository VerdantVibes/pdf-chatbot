import { axiosInstance as Axios } from "../axiosInterceptor";

export const getGmailPdfs = async ({
  queryKey: [_, params],
}: {
  queryKey: [string, { offset: number; limit: number }];
}) => {
  try {
    const response = await Axios.post(
      "/gmail/pdfs",
      {
        authors: [""],
        categories: [""],
        sectors: [""],
      },
      {
        params: {
          offset: params.offset,
          limit: params.limit,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch Gmail PDFs:", error);
    throw error;
  }
};

export const getPdfSummary = async ({ queryKey: [_, params] }: { queryKey: [string, { id: string }] }) => {
  try {
    const response = await Axios.get(`/pdf-analysis/${params.id}/summary`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch PDF summary for ID ${params.id}:`, error);
    throw error;
  }
};
