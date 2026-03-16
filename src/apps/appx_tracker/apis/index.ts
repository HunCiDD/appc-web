import { authRequest } from '@/apps/appc_auth/utils/request'
import type { PageData } from '@/types'
import type {
  TagAdd,
  TagSet,
  TagGet,
  ThingAdd,
  ThingSet,
  ThingGet,
  ActionAdd,
  ActionSet,
  ActionGet,
} from '@/apps/appx_tracker/types'

const BASE_URL = '/tracker'

enum API {
  TAGS_URL = `${BASE_URL}/tags`,
  THINGS_URL = `${BASE_URL}/things`,
  ACTIONS_URL = `${BASE_URL}/actions`,
  PLANS_URL = `${BASE_URL}/plans`
}

// 统一的 CRUD API 模式
export const tagApi = {
  list: (data: object) => authRequest.get<PageData<TagGet>>(`${API.TAGS_URL}`, data),
  get: (id: string) => authRequest.get<TagGet>(`${API.TAGS_URL}/${id}`),
  add: (data: TagAdd) => authRequest.post<TagGet>(API.TAGS_URL, data),
  set: (id: string, data: TagSet) => authRequest.put<TagGet>(`${API.TAGS_URL}/${id}`, data),
  del: (id: string) => authRequest.delete(`${API.TAGS_URL}/${id}`)
}

export const thingApi = {
  list: (data: object) => authRequest.get<PageData<ThingGet>>(`${API.THINGS_URL}`, data),
  get: (id: string) => authRequest.get<ThingGet>(`${API.THINGS_URL}/${id}`),
  add: (data: ThingAdd) => authRequest.post<ThingGet>(API.THINGS_URL, data),
  set: (id: string, data: ThingSet) =>
    authRequest.put<ThingGet>(`${API.THINGS_URL}/${id}`, data),
  del: (id: string) => authRequest.delete(`${API.THINGS_URL}/${id}`),
}

export const actionApi = {
  list: (data: object) => authRequest.get<PageData<ActionGet>>(`${API.ACTIONS_URL}`, data),
  get: (id: string) => authRequest.get<ActionGet>(`${API.ACTIONS_URL}/${id}`),
  add: (data: ActionAdd) => authRequest.post<ActionGet>(API.ACTIONS_URL, data),
  set: (id: string, data: ActionSet) =>
    authRequest.put<ActionGet>(`${API.ACTIONS_URL}/${id}`, data),
  del: (id: string) => authRequest.delete(`${API.ACTIONS_URL}/${id}`),
}
