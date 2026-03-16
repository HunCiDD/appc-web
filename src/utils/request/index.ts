
import { BASE_URL, TIME_OUT } from '@/configs'
import { BaseInterceptorStrategy, HttpRequest } from '@/utils/request/base.ts'

export const httpRequest = new HttpRequest(
  { baseURL: BASE_URL, timeout: TIME_OUT },
  new BaseInterceptorStrategy({ requestTimeout: TIME_OUT }),
)
