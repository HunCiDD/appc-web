import type { UserGet } from '@/apps/appc_auth/types'

export interface TagAdd {
  name: string
}

export interface TagSet extends TagAdd {
  id: string
}

export interface TagGet extends TagSet {}

export interface ThingAdd {
  content: string
}

export interface ThingSet extends ThingAdd {
  id: string
}

export interface ThingGet extends ThingSet {}

export interface ActionAdd {
  description: string
  thing_id: string
  tags_id?: string[]
  users_id?: string[]
  start_at: string
  end_at: string
}

export interface ActionSet {
  id: string
  description?: string
  thing_id?: string
  tags_id?: string[]
  users_id?: string[]
  start_at?: string
  end_at?: string
}

export interface ActionGet {
  id: string
  description: string
  thing: ThingGet
  tags: TagGet[]
  users: UserGet[]
  start_at: string
  end_at: string
}
