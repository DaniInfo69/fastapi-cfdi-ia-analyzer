import apiClient from './apiClient';

export const registerUser = async (username) => {
  const response = await apiClient.post(`/api/v1/users/register?username=${encodeURIComponent(username)}`);
  return response.data;
};