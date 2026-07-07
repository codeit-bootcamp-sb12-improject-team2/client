/* 에러 정규화 유틸 */

import axios from "axios";

export const getDataMessage = (data: unknown): string | undefined => {
  if (typeof data === "string") return data;
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    // 백엔드 에러 응답의 흔한 메시지 필드만 우선 확인
    const keys = ["message", "error", "errorMessage", "detail", "details"];

    for (const key of keys) {
      const value = record[key];
      if (typeof value === "string" && value.trim()) return value;
      if (value && typeof value === "object") {
        const nestedMessage = getDataMessage(value);
        if (nestedMessage) return nestedMessage;
      }
    }
  }
  return undefined;
};

export const normalizeError = (err: unknown): Error => {
  if (axios.isAxiosError(err)) {
    const res = err.response;
    const msg =
      getDataMessage(res?.data) ??
      getDataMessage(err.response?.data) ??
      res?.statusText ??
      (res ? `Request failed with status code ${res.status}` : undefined) ??
      err.message ??
      "Request failed";
    return new Error(msg);
  }
  return err instanceof Error ? err : new Error("Unknown error");
};
