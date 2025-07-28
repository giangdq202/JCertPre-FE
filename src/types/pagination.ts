// src/types/pagination.ts

/**
 * Represents a paginated list of items, mirroring the backend's Pagination<T> structure.
 * @template T The type of items in the paginated list.
 */
export interface Pagination<T> {
  totalItemsCount: number;
  pageSize: number;
  pageIndex: number;
  totalPagesCount: number; // Calculated property on backend, but still a number on frontend
  next: boolean;
  previous: boolean;
  items: T[];
}
