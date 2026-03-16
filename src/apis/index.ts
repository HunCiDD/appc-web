import type { AccountLogin, Token } from '@/types'
import { httpRequest } from '@/utils/request'

export enum API_URL {
  LOGIN_ACCOUNT_URL = `/auth/login/account`,
  TOKEN_REFRESH_URL = `/auth/token/refresh`,
}

export const baseApi = {
  accountLogin: (data: AccountLogin) => httpRequest.post<Token>(API_URL.LOGIN_ACCOUNT_URL, data),
  refreshToken: (data: { refresh_token: string }) =>
    httpRequest.post<Token>(API_URL.TOKEN_REFRESH_URL, data),
}
