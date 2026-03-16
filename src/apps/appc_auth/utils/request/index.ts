import {
  BaseInterceptorStrategy,
  CompositeInterceptorStrategy,
  HttpRequest,
} from '@/utils/request/base.ts'
import { BASE_URL, TIME_OUT } from '@/configs'
import { AuthInterceptorStrategy } from '@/apps/appc_auth/utils/request/base.ts'

export const authRequest = new HttpRequest(
  { baseURL: BASE_URL, timeout: TIME_OUT },
  new CompositeInterceptorStrategy([
    new BaseInterceptorStrategy({
      requestTimeout: TIME_OUT,
      // 认证请求不显示401错误消息，由AuthInterceptorStrategy处理
      isShowErrorMsg: true,
    }),
    new AuthInterceptorStrategy(),
  ]),
)
