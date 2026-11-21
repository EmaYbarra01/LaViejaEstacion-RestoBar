import { useCallback, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const useReports = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const generateReport = useCallback(async (endpoint, params = {}) => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams(params);
      const response = await axios.get(`${API_URL}${endpoint}?${queryParams}`, {
        withCredentials: true
      });

      setData(response.data.data || response.data);
      return response.data.data || response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.mensaje || 'Error al generar reporte';
      setError(errorMessage);
      console.error('[REPORTS]', errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearReport = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return {
    loading,
    error,
    data,
    generateReport,
    clearReport
  };
};

export default useReports;
