export interface Tag {
  id: string
  name: string
}

export interface AddTag {
  name: string
}

export interface SetTag extends Tag {
}

export interface Thing {
  id: string
  content: string
}

export interface AddThing {
  content: string
}

export interface SetThing extends Thing {
}


export interface Action {
  id: string
  description: string
  user_id: string
  start_at: string
  end_at: string
  thing: Thing
  tags: Tag[]
}

export interface AddAction {
  description: string
  user_id: string
  start_at: string
  end_at: string
  thing: Thing
  tags: Tag[]
}

export interface SetAction extends Action {
}

export interface Plan {
  id?: string
  parent_id?: string
  progress: number
  priority: number
  status: string
  crontab: string
  start_at: string
  end_at: string
  created_at: string
  updated_at: string
  actions: Action[]
  user_ids: string[]
}

