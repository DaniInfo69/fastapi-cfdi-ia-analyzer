import apiClient from './apiClient';

export const analyzeFiscalHealth = async (formData) => {
  try {
    const response = await apiClient.post('/api/v1/ai/analyze-health', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    console.error('Error in AI Analysis Service:', error);
    throw error;
  }
};

export const getAnalysisHistory = async () => {
  const response = await apiClient.get('/api/v1/ai/history');
  return response.data.data;
};