import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const apiClient = axios.create({
  baseURL: API_URL,
});

// Variables para evitar bucles infinitos de refresh si fallan varias peticiones a la vez
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// 1. Interceptor de Peticiones (Sale la petición al backend)
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
  
  // SOLUCIÓN AL BUG: Filtramos textos literales "undefined" o "null"
  if (token && token !== "undefined" && token !== "null") {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 2. Interceptor de Respuestas (Manejo de Caducidad / Refresh)
apiClient.interceptors.response.use(
  (response) => response, // Si todo sale bien, deja pasar la respuesta
  async (error) => {
    const originalRequest = error.config;

    // Si el servidor arroja un 401 y NO hemos intentado reintentar esta petición aún
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      
      // Si el 401 viene de intentar loguearse o refrescar, nos damos por vencidos y expulsamos
      if (originalRequest.url.includes('/login') || originalRequest.url.includes('/refresh')) {
        window.dispatchEvent(new Event('auth:unauthorized'));
        return Promise.reject(error);
      }

      // Si ya hay un refresh en curso, ponemos la petición en la cola
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return apiClient(originalRequest);
        }).catch(err => Promise.reject(err));
      }

      // Iniciamos el proceso de refresh
      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token');

      // Si no hay refresh token, expulsamos al usuario
      if (!refreshToken || refreshToken === "undefined" || refreshToken === "null") {
        isRefreshing = false;
        window.dispatchEvent(new Event('auth:unauthorized'));
        return Promise.reject(error);
      }

      try {
        // Pedimos un nuevo token al backend (usamos axios directo para no pasar por este mismo interceptor)
        const { data } = await axios.post(`${API_URL}/api/v1/auth/refresh`, { refresh_token: refreshToken });
        const newAccessToken = data.access_token;

        // Actualizamos la caja fuerte correcta
        if (localStorage.getItem('refresh_token')) {
          localStorage.setItem('access_token', newAccessToken);
        } else {
          sessionStorage.setItem('access_token', newAccessToken);
        }

        // Reintentamos la petición original con el nuevo token
        apiClient.defaults.headers.common['Authorization'] = 'Bearer ' + newAccessToken;
        originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
        
        processQueue(null, newAccessToken);
        return apiClient(originalRequest);
      } catch (err) {
        // Si el refresh_token también caducó, limpiamos todo y a la pantalla de login
        processQueue(err, null);
        window.dispatchEvent(new Event('auth:unauthorized'));
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;