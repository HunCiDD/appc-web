import {
  BaseInterceptorStrategy,
  CompositeInterceptorStrategy,
  HttpRequest,
} from '@/utils/request/base.ts'
import { BASE_URL, TIME_OUT } from '@/configs'
import { InvestmentInterceptorStrategy } from '@/apps/appx-investment/utils/request/base.ts'

export const investmentRequest = new HttpRequest(
  { baseURL: BASE_URL, timeout: TIME_OUT },
  new CompositeInterceptorStrategy([
    new BaseInterceptorStrategy({
      requestTimeout: TIME_OUT,
      isShowErrorMsg: true,
    }),
    new InvestmentInterceptorStrategy(),
  ]),
)