import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  response => {
    const resData = response.data as {
      header?: { result?: boolean; message?: string };
      body?: any;
      pagination?: any;
    };
    // header 없는 경우 (예: 로그인 응답), 그대로 반환
    if (!resData.header) {
      return response;
    }

    // header 있는 경우 커스텀 구조로 변환
    // 커스텀 형태로 바꿔서 사용 (as any로 타입 우회)
    return {
      ...response,
      data: resData.body,
      pagination: resData.pagination ?? null,
      result: resData.header?.result ?? true,
      message: resData.header?.message ?? '',
      resData,
    } as any;
  },
  error => {
    const resData = error.response?.data as {
      header?: { result?: boolean; message?: string };
      body?: any;
      pagination?: any;
    };
    return Promise.reject({
      message: resData?.header?.message || error.message || '알 수 없는 오류',
      status: error.response?.status,
      result: resData?.header?.result ?? false,
      data: resData?.body ?? null,
      pagination: resData?.pagination ?? null,
      resData,
    });
  }
);

export default api;
