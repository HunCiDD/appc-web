/**
 * API Response Interface
 * @template T
 * @property {number} code - Response code
 * @property {string} message - Response message
 * @property {T} data - Response data
 */
export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}
