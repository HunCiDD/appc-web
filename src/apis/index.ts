import {BASE_URL, TIME_OUT} from '@/configs'
import {HttpRequest} from './request.ts'

export const httpRequest = new HttpRequest({
  baseURL: BASE_URL,
  timeout: TIME_OUT,
})


