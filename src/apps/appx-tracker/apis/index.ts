import {httpRequest} from '@/apis'
import type {
  Action,
  AddAction,
  AddTag,
  AddThing,
  SetAction,
  SetTag,
  SetThing,
  Tag,
  Thing
} from '@/apps/appx-tracker/types'

enum API {
  TAGS_URL = '/daily-tracker/tags',
  TAGS_LIST_URL = '/daily-tracker/tags/list',
  THINGS_URL = '/daily-tracker/things',
  THINGS_LIST_URL = '/daily-tracker/things/list',
  ACTIONS_URL = '/daily-tracker/actions',
  ACTIONS_LIST_URL = '/daily-tracker/actions/list'
}

// 统一的 CRUD API 模式
export const tagApi = {
  add: (data: AddTag) => httpRequest.post<Tag>(API.TAGS_URL, data),
  del: (id: string) => httpRequest.delete(`${API.TAGS_URL}/${id}`),
  set: (id: string, data: SetTag) => httpRequest.put<Tag>(`${API.TAGS_URL}/${id}`, data),
  get: (id: string) => httpRequest.get<Tag>(`${API.TAGS_URL}/${id}`),
  list: () => httpRequest.get<Tag[]>(API.TAGS_LIST_URL),
}

export const thingApi = {
  add: (data: AddThing) => httpRequest.post<Thing>(API.THINGS_URL, data),
  del: (id: string) => httpRequest.delete(`${API.THINGS_URL}/${id}`),
  set: (id: string, data: SetThing) => httpRequest.put<Thing>(`${API.THINGS_URL}/${id}`, data),
  get: (id: string) => httpRequest.get<Thing>(`${API.THINGS_URL}/${id}`),
  list: () => httpRequest.get<Thing[]>(API.THINGS_LIST_URL),
}

export const actionApi = {
  add: (data: AddAction) => httpRequest.post<Action>(API.ACTIONS_URL, data),
  del: (id: string) => httpRequest.delete(`${API.ACTIONS_URL}/${id}`),
  set: (id: string, data: SetAction) => httpRequest.put<Action>(`${API.ACTIONS_URL}/${id}`, data),
  get: (id: string) => httpRequest.get<Action>(`${API.ACTIONS_URL}/${id}`),
  list: () => httpRequest.get<Action[]>(API.ACTIONS_LIST_URL),
}
