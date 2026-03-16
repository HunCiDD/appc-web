export interface MenuResourceAdd {
  name: string
  category: string
  path: string
}

export interface MenuResourceSet {
  id: string
  name?: string
  category?: string
  path?: string
}

export interface MenuResourceGet extends MenuResourceAdd {
  id: string
}

// ------------ 权限 ------------
export interface PermissionAdd {
  parent_id?: string
  name: string
  code: string
  category: string
  resource_id: string
}

export interface PermissionSet {
  id: string
  parent_id?: string
  name?: string
  code?: string
  category?: string
  resource_id?: string
}

export interface PermissionGet extends PermissionAdd {
  id: string
}

// ------------ 角色 ------------
export interface RoleAdd {
  key: string
  name: string
  description: string
  is_active: boolean
  permissions_id?: string[]
}

export interface RoleSet {
  id: string
  key?: string
  name?: string
  description?: string
  is_active?: boolean
  permissions_id?: string[]
}

export interface RoleGet extends RoleAdd {
  id: string
  permissions?: PermissionGet[]
}

// ------------ 用户 ------------
export interface UserAdd {
  username: string
  nickname: string
  password: string
  phone: string
  email: string
  is_active: boolean
  roles_id?: string[]
}

export interface UserSet {
  id: string
  username?: string
  nickname?: string
  password?: string
  phone?: string
  email?: string
  is_active?: boolean
  roles_id?: string[]
}

export interface UserGet extends UserAdd {
  id: string
  roles: RoleGet[]
}
