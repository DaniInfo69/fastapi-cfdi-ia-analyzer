import apiClient from './apiClient';

export const getFiscalRegimes = async () => {
  try {
    const response = await apiClient.get('/api/v1/fiscal/regimes');
    return response.data.data; 
  } catch (error) {
    console.error("Error al obtener los regímenes:", error);
    throw error;
  }
};