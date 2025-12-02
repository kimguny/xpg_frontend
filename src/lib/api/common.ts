// openapi.json을 기반으로 한 전체 응답 타입 정의
export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  size: number;
  total: number;
}