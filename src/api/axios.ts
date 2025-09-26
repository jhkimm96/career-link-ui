'use client';

import axios, { AxiosError } from 'axios';

type Pagination = {
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
  hasPrevious: boolean;
} | null;

type Envelope<T = unknown> = {
  header?: { result?: boolean; message?: string; code?: string | null };
  body?: T | null;
  pagination?: Pagination;
};

const isEnvelope = (v: any): v is Envelope<any> => v && typeof v === 'object' && 'header' in v;

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
});

// request: 토큰 헤더 주입
api.interceptors.request.use(config => {
  // if (typeof window !== 'undefined') {
  //   const token = localStorage.getItem('accessToken');
  //   if (token) {
  //     config.headers = config.headers ?? {};
  //     (config.headers as any).Authorization = `Bearer ${token}`;
  //   }
  // }
  return config;
});

// response: envelope → 평탄화
api.interceptors.response.use(
  res => {
    // 파일 응답은 스킵
    const rt = res.config.responseType;
    if (rt === 'blob' || rt === 'arraybuffer') return res;

    // 204/빈 바디
    if (res.status === 204 || res.data == null || res.data === '') {
      res.result = true;
      res.message = '';
      res.pagination = null;
      res.resData = { header: { result: true, message: '' }, body: null, pagination: null };
      res.code = null;
      res.data = null as any;

      //추후 삭제
      (res as any).body = null;
      return res;
    }

    // 우리 공통 포맷이면 평탄화
    const data = res.data;
    if (isEnvelope(data)) {
      res.result = data.header?.result ?? res.status < 400;
      res.message = data.header?.message ?? '';
      res.pagination = data.pagination ?? null;
      res.resData = data;
      res.code = data.header?.code ?? null;
      res.data = (data.body ?? null) as any; // 프론트는 res.data만 보면 됨
      //추후 삭제
      (res as any).body = data.body ?? null;
    }
    return res;
  },
  (err: AxiosError) => {
    const env = err.response?.data as Envelope<any> | undefined;
    if (env?.header) {
      // 백엔드 메시지를 에러에 주입
      (err as any).message = env.header.message || err.message || '요청이 실패했습니다.';
      (err as any).result = env.header.result ?? false;
      (err as any).pagination = env.pagination ?? null;
      (err as any).resData = env;
      (err as any).code = env.header.code ?? null;
    }
    return Promise.reject(err);
  }
);

export default api;
