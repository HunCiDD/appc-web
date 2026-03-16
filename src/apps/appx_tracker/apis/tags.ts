import { httpRequest } from './index.ts'
import type { GetTag } from '@/apps/appx-tracker/types.ts'

export const getTag = async (tagId: string) => {
  console.log('start')
  try {
    return await httpRequest.get<GetTag>(`/tags/${tagId}`)
  } catch (error) {
    console.error('获取用户失败')
    throw error
  }
}

export const listTags = async () => {
  return await httpRequest.get<GetTag[]>('/tags/list')
}

// interface AddTagRequestConfig extends HttpRequestConfig {
//   method: 'post',
//   url: '/tags',
// }
//
// export default apiRequest
//
//
// class A {
//   public getTag(id: string): ApiResponse<GetTag> {
//     let a = 1
//   }
//
//   public addTag(data: AddTag): ApiResponse<GetTag> {
//   }
//
//   public setTag(id: string, data: SetTag): ApiResponse<GetTag> {
//
//   }
//
//   public delTag(id: string): number {
//
//   }
//
// }
//
//
// const listTag = async () => {
//   // 发送 GET 请求获取所有
//   const response = await axios.get<ListTag>('/tags/list');
//   const tags = response.data;
//   console.log(tags)
// }
//
//
// const addTag = async () => {
//   const s = {
//     name: 'aaa'
//   }
//   const response = await axios.post<GetTag>(
//     '/tags/'
//   )
//
// }
//
//
// const delTag = async () => {
//   const id = 2;
//   const response = await axios.delete(`/tags/${id}`)
//   console.log(response.data)
// }
