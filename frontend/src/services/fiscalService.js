// frontend/src/services/fiscalService.js
import axios from 'axios';

// Idealmente la URL base debería venir de un archivo .env, 
// pero la dejamos hardcodeada por ahora para mantenerlo simple.
const API_URL = 'http://localhost:8000/api/v1/fiscal';

export const getFiscalRegimes = async () => {
  try {
    const response = await axios.get(`${API_URL}/regimes`);
    // El backend devuelve { data: [...] }, así que retornamos la data directamente
    return response.data.data; 
  } catch (error) {
    console.error("Error al obtener los regímenes fiscales:", error);
    throw error; // Lanzamos el error para que la vista lo maneje si es necesario
  }
};