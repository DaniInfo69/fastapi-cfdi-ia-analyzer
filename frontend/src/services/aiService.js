import axios from 'axios';

// URL base que apunta al puerto mapeado en Docker
const API_URL = 'http://localhost:8080/api/ai';

export const analyzeFiscalHealth = async (formData) => {
  try {
    const response = await axios.post(`${API_URL}/analyze-health`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error in AI Analysis Service:', error);
    throw error;
  }
};


export const getAnalysisHistory = async () => {
  const response = await axios.get(`${API_URL}/history`);
  return response.data.data;
};