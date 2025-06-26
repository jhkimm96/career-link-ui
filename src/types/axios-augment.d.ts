export {};

type Pagination = {
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
  hasPrevious: boolean;
} | null;

declare module 'axios' {
  interface AxiosResponse<T = any, D = any> {
    result?: boolean;
    message?: string;
    pagination?: Pagination;
    resData?: unknown; // 원본 envelope 디버깅용
    code?: string | null; // header.code 쓰고 싶으면 사용

    //추후삭제
    body?: unknown; // ← 숏컷
  }
  interface AxiosRequestConfig {
    _retry?: boolean; // 401 재로그인시 쓰는 플러그
  }
}
