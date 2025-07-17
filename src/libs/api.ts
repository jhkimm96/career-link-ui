import axios from 'axios';

export async function api<T = any>({
  method,
  url,
  data,
  params,
  headers,
}: {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  data?: any;
  params?: any;
  headers?: any;
}): Promise<T> {
  try {
    const response = await axios.request<T>({
      method,
      url,
      data,
      params,
      headers,
      baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
      withCredentials: true,
    });

    return response.data;
  } catch (error: any) {
    console.error('API Error:', error?.response?.data || error.message);
    throw error?.response?.data || error;
  }
}
