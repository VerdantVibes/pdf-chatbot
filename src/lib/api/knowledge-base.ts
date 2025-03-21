import { axiosInstance as Axios } from "../axiosInterceptor";

export const getGmailPdfs = async ({
  queryKey: [_, params],
}: {
  queryKey: [string, { offset: number; limit: number }];
}) => {
  const response = await Axios.post("/gmail/pdfs", 
    {
      authors: [""],
      categories: [""],
      sectors: [""]
    },
    {
      params: {
        offset: params.offset,
        limit: params.limit,
      },
    }
  );
  return response.data;
};

export const getPdfSummary = async ({
  queryKey: [_, params],
}: {
  queryKey: [string, { id: string }];
}) => {
  const response = await Axios.get(`/pdf-analysis/${params.id}/summary`);
  return response.data;
};
