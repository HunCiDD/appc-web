export const LOGIN_TOKEN = 'auth_token' // 登录令牌的缓存键

export const PATTERNS = {
  // username - 用户名需由字母、数字和下划线组成
  username: /^[a-zA-Z0-9_-]+$/,
  // password - 密码需包含大小写字母、数字和特殊字符(@$!%*?&)
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!_@#$%^&*?()])[A-Za-z\d!_@#$%^&*?()]{8,128}$/,
}
