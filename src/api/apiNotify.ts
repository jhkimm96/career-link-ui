// src/api/notify.ts

/** 스낵바 종류 */
export type Severity = 'success' | 'error' | 'info' | 'warning';

/** 스낵바 상태 */
export type SnackbarState = { open: boolean; message: string; severity: Severity };

/** setState 타입 (setSnackbar) */
export type SetSnackbar = (s: SnackbarState | ((prev: SnackbarState) => SnackbarState)) => void;

/** 내부 공통: 한 번에 열기 */
const show = (set: SetSnackbar, severity: Severity, message: string) =>
  set({ open: true, message, severity });

/** 성공 알림 (기본 메시지 제공) */
export const notifySuccess = (set: SetSnackbar, message = '성공적으로 처리되었습니다.') =>
  show(set, 'success', message);

/** 에러 알림 (기본 메시지 제공) */
export const notifyError = (
  set: SetSnackbar,
  message = '오류가 발생했습니다. 다시 시도해 주세요.'
) => show(set, 'error', message);

/** 정보 알림 (빈 문자열도 허용) */
export const notifyInfo = (set: SetSnackbar, message = '') => show(set, 'info', message);

/** 경고 알림 (빈 문자열도 허용) */
export const notifyWarning = (set: SetSnackbar, message = '') => show(set, 'warning', message);

/** (옵션) 닫기 헬퍼 */
export const closeSnackbar = (set: SetSnackbar) => set(prev => ({ ...prev, open: false }));
