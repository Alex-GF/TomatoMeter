import axios, { AxiosInstance } from 'axios';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to handle the Pricing-Token header
axiosInstance.interceptors.response.use(
  response => {
    const token = response.headers['pricing-token']; // This must be in lowercase
    if (token) {
      localStorage.setItem('pricingToken', token);
    }
    return response;
  },
  error => {
    return Promise.reject(error);
  }
);

export default axiosInstance;