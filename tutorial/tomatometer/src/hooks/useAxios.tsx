import { useMemo } from 'react';
import axios, { AxiosInstance } from 'axios';

export default function useAxios(): AxiosInstance {
  return useMemo(
    () =>
      axios.create({
        baseURL: import.meta.env.VITE_SERVER_URL ?? '/api',
        headers: { 'Content-Type': 'application/json' },
      }),
    []
  );
}
