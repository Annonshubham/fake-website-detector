import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const scanURL = async (url) => {
  try {
    const response = await api.post('/scan', { url });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getScanHistory = async (limit = 50, offset = 0) => {
  try {
    const response = await api.get(`/scans?limit=${limit}&offset=${offset}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getScanDetails = async (scanId) => {
  try {
    const response = await api.get(`/scans/${scanId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getStats = async () => {
  try {
    const response = await api.get('/stats');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const reportWebsite = async (url, reason) => {
  try {
    const response = await api.post('/report', { url, reason });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getReports = async () => {
  try {
    const response = await api.get('/reports');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteScan = async (scanId) => {
  try {
    const response = await api.delete(`/scans/${scanId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export default api;
