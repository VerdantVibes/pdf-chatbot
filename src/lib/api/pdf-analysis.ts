import { axiosInstance as Axios } from "../axiosInterceptor";

export const getPdfAnalysisAuthors = async () => {
  try {
    const response = await Axios.get(`/pdf-analysis/authors`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch Authors.`, error);
    throw error;
  }
};

export const getPdfAnalysisCategories = async () => {
  try {
    const response = await Axios.get(`/pdf-analysis/categories`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch Categories.`, error);
    throw error;
  }
};

export const getPdfAnalysisSectors = async () => {
  try {
    const response = await Axios.get(`/pdf-analysis/sectors`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch Sectors.`, error);
    throw error;
  }
};
