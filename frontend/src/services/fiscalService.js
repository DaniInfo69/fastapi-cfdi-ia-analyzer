import axios from 'axios';

// Asegúrate de que el puerto (8000) coincida exactamente con el de tu FastAPI
const API_URL = 'http://localhost:8080/api/v1/fiscal';

export const getFiscalRegimes = async () => {
  try {
    const response = await axios.get(`${API_URL}/regimes`);
    // Como el backend responde con {"data": [...]}, Axios lo envuelve en response.data
    return response.data.data; 
  } catch (error) {
    console.error("Error al obtener los regímenes fiscales:", error);
    throw error;
  }
};