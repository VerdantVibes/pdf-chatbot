import { axiosInstance as Axios } from "../axiosInterceptor";

export const getGmailPdfs = async ({
  queryKey: [_queryName, params],
}: {
  queryKey: [string, { offset: number; limit: number; sortBy: string; sortOrder: string }];
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
          sort_by: params.sortBy,
          sort_order: params.sortOrder.toLocaleUpperCase(),
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch Gmail PDFs:", error);
    throw error;
  }
};

export const getPdfSummary = async ({ queryKey: [_queryName, params] }: { queryKey: [string, { id: string }] }) => {
  try {
    const response = await Axios.get(`/pdf-analysis/${params.id}/summary`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch PDF summary for ID ${params.id}:`, error);
    throw error;
  }
};
