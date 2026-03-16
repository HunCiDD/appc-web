import type { PageData } from '@/types'
import { authRequest } from '@/apps/appc_auth/utils/request'
import type {
  MenuResourceAdd,
  MenuResourceSet,
  MenuResourceGet,
  PermissionAdd,
  PermissionSet,
  PermissionGet,
  RoleAdd,
  RoleSet,
  RoleGet,
  UserAdd,
  UserSet,
  UserGet,
} from '@/apps/appc_auth/types'

const BASE_URL = '/auth'

enum API_URL {
  MENU_RESOURCES_URL = `${BASE_URL}/menu_resources`,
  PERMISSIONS_URL = `${BASE_URL}/permissions`,
  ROLES_URL = `${BASE_URL}/roles`,
  USERS_URL = `${BASE_URL}/users`,
  TOKEN_USER_URL = `${BASE_URL}/token/user`,
}

export const menuResourcesApi = {
  list: (data: object) =>
    authRequest.get<PageData<MenuResourceGet>>(`${API_URL.MENU_RESOURCES_URL}`, data),
  get: (id: string) => authRequest.get<MenuResourceGet>(`${API_URL.MENU_RESOURCES_URL}/${id}`),
  add: (data: MenuResourceAdd) =>
    authRequest.post<MenuResourceGet>(API_URL.MENU_RESOURCES_URL, data),
  set: (id: string, data: MenuResourceSet) =>
    authRequest.put<MenuResourceGet>(`${API_URL.MENU_RESOURCES_URL}/${id}`, data),
  del: (id: string) => authRequest.delete(`${API_URL.MENU_RESOURCES_URL}/${id}`),
}

export const permissionsApi = {
  list: (data: object) =>
    authRequest.get<PageData<PermissionGet>>(`${API_URL.PERMISSIONS_URL}`, data),
  get: (id: string) => authRequest.get<PermissionGet>(`${API_URL.PERMISSIONS_URL}/${id}`),
  add: (data: PermissionAdd) => authRequest.post<PermissionGet>(API_URL.PERMISSIONS_URL, data),
  set: (id: string, data: PermissionSet) =>
    authRequest.put<PermissionGet>(`${API_URL.PERMISSIONS_URL}/${id}`, data),
  del: (id: string) => authRequest.delete(`${API_URL.PERMISSIONS_URL}/${id}`),
}

export const rolesApi = {
  list: (data: object) => authRequest.get<PageData<RoleGet>>(`${API_URL.ROLES_URL}`, data),
  get: (id: string) => authRequest.get<RoleGet>(`${API_URL.ROLES_URL}/${id}`),
  add: (data: RoleAdd) => authRequest.post<RoleGet>(API_URL.ROLES_URL, data),
  set: (id: string, data: RoleSet) => authRequest.put<RoleGet>(`${API_URL.ROLES_URL}/${id}`, data),
  del: (id: string) => authRequest.delete(`${API_URL.ROLES_URL}/${id}`),
}

export const usersApi = {
  list: (data: object) => authRequest.get<PageData<UserGet>>(`${API_URL.USERS_URL}`, data),
  get: (id: string) => authRequest.get<UserGet>(`${API_URL.USERS_URL}/${id}`),
  add: (data: UserAdd) => authRequest.post<UserGet>(API_URL.USERS_URL, data),
  set: (id: string, data: UserSet) => authRequest.put<UserGet>(`${API_URL.USERS_URL}/${id}`, data),
  del: (id: string) => authRequest.delete(`${API_URL.USERS_URL}/${id}`),
}

export const authApi = {
  getUserInfo: (token: string) =>
    authRequest.post<UserGet>(`${API_URL.TOKEN_USER_URL}`, { access_token: token }),
}
