import {httpRequest} from '@/apis'

import type {
  EmailLoginForm,
  PhoneLoginForm,
  Token,
  UserInfo,
  UserLoginForm,
} from '@/apps/appc-auth/types'

enum API {
  LOGIN_USER_URL = '/auth/login',
  LOGIN_PHONE_URL = '/auth/login/phone',
  LOGIN_EMAIL_URL = '/auth/login/email',
  LOGOUT_URL = '/auth/logout',
  TOKEN_REFRESH_URL = '/auth/token/refresh',
  TOKEN_USER_URL = '/auth/token/user',
}

/**
 * User login API
 * @param data UserLoginForm
 * @returns Token
 */
export const userLoginApi = (data: UserLoginForm) => {
  return httpRequest.post<Token>(API.LOGIN_USER_URL, data)
}

/**
 * Phone login API
 * @param data PhoneLoginForm
 * @returns Token
 */
export const phoneLoginApi = (data: PhoneLoginForm) => {
  return httpRequest.post<Token>(API.LOGIN_PHONE_URL, data)
}

/**
 * Email login API
 * @param data EmailLoginForm
 * @returns Token
 */
export const emailLoginApi = (data: EmailLoginForm) => {
  return httpRequest.post<Token>(API.LOGIN_EMAIL_URL, data)
}

/**
 * Token refresh API
 * @param refreshToken string
 * @returns Token
 */
export const tokenRefreshApi = (refreshToken: string) => {
  return httpRequest.post<Token>(API.TOKEN_REFRESH_URL, {refreshToken})
}

/** Get user info API
 * @returns UserInfo
 */
export const tokenUserInfoApi = (accessToken: string) => {
  return httpRequest.post<UserInfo>(API.TOKEN_USER_URL, {token: accessToken}, {isAuth: true})
}
