export interface Token {
  access_token: string // 需要使用后台的结构
  refresh_token: string
  token_type: string
}

export interface UserInfo {
  id: string
  username: string
  nickname: string
  phone: string
  email: string
  avatar: string
}

export interface UserLoginForm {
  username: string
  password: string
}

export interface PhoneLoginForm {
  phone: string
  code: string
}

export interface EmailLoginForm {
  email: string
  code: string
}
