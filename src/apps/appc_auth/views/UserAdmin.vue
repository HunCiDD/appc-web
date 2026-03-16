<script lang="ts" setup>
import { CirclePlus, Delete, Edit, Postcard, Refresh, Search } from '@element-plus/icons-vue'
import type { Tag } from '@/apps/appx_tracker/types'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { usersApi } from '@/apps/appc_auth/apis'

export interface User {
  id: String
  username: string
  nickname: string
  phone: string
  email: string
  is_active: boolean
}

// 响应式查询数据
const queryFormData = reactive<User>({
  id: '',
  username: '',
  nickname: '',
  phone: '',
  email: '',
  is_active: true,
})
// 响应表格数据
const tableData = ref<User[]>([])
// 响应过滤后表格数据
const filteredTableData = ref<User[]>([])
// 响应表格多选数据
const multipleSelection = ref<User[]>([])
// 响应分域数据
const paginationData = reactive({
  currentPage: 1,
  pageSize: 10,
  pageSizes: [10, 20, 50, 100],
  disabled: false,
  total: 0,
})
// 表单规则
const formRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 64, message: '长度3~63个字符', trigger: 'blur' },
    {
      pattern: /^[a-zA-Z0-9_]+$/,
      message: '用户名只能包含字母、数字和下划线',
      trigger: 'blur',
    },
  ],

  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 8, max: 128, message: '密码长度8-128位', trigger: 'blur' },
    {
      pattern: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,128}$/,
      message: '密码需包含大小写字母、数字和特殊字符(@$!%*?&)',
      trigger: 'blur',
    },
  ],

  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 3, max: 64, message: '长度3~63个字符', trigger: 'blur' },
  ],

  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { min: 3, max: 32, message: '长度3~32个字符', trigger: 'blur' },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: '请输入正确的手机号码格式',
      trigger: 'blur',
    },
  ],

  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { min: 3, max: 64, message: '长度3~64个字符', trigger: 'blur' },
  ],
}

// 添加表单相关
const addFormRef = ref<FormInstance>()
const addFormData = reactive({
  name: '',
})
// 修改表单数据
const setFormRef = ref<FormInstance>()
const setFormData = reactive({
  id: '',
  name: '',
})
// 详情数据
const detailData = reactive({
  id: '',
  name: '',
})

// 状态管理
const isLoading = ref(false)
const dialogVisibleAdd = ref(false)
const dialogVisibleSet = ref(false)
const dialogVisibleDetail = ref(false)

// 生命周期钩子
onMounted(() => {
  initData()
})

const initData = async () => {
  await initTableData()
}
// 初始化表格数据
const initTableData = async () => {
  try {
    isLoading.value = true
    const response = await usersApi.list({})
    tableData.value = response.data
    filteredTableData.value = response.data
    updatePagination()
  } catch (err: any) {
    console.log(err.message || '获取标签列表失败')
    ElMessage.error('获取标签列表失败')
  } finally {
    isLoading.value = false
  }
}

const updatePagination = () => {
  paginationData.total = tableData.value.length
  paginationData.currentPage = 1
}

// 分页处理
const paginatedData = computed(() => {
  const start = (paginationData.currentPage - 1) * paginationData.pageSize
  const end = start + paginationData.pageSize
  return filteredTableData.value.slice(start, end)
})

const onQuery = () => {
  console.log('onQuery!')
}

const onAdd = async () => {
  console.log('onAdd!')
  if (!addFormRef.value) return

  try {
    await addFormRef.value?.validate()
    isLoading.value = true

    await tagApi.add({ name: addFormData.name })
    ElMessage.success('添加成功')
    dialogVisibleAdd.value = false
    addFormData.name = ''

    await initTableData()
  } catch (error: any) {
    if (error?.errors) {
      // 表单验证错误，不显示消息
      return
    }
    ElMessage.error(error?.message || '添加失败')
  } finally {
    isLoading.value = false
  }
}

const onResetQuery = () => {
  queryFormData.id = ''
  queryFormData.username = ''
  queryFormData.nickname = ''
  queryFormData.phone = ''
  queryFormData.email = ''
  queryFormData.is_active = true
}

// 重置添加表单
const resetAddForm = () => {
  addFormData.name = ''
  addFormRef.value?.clearValidate()
}

const onDialogVisibleDetail = (row: Tag) => {
  console.log('onDialogVisibleDetail')
  descriptionData.id = row.id
  descriptionData.name = row.name
  dialogVisibleDetail.value = true
}

const onDialogVisibleSet = (row: Tag) => {
  console.log('onDialogVisibleSet')
  setFormData.id = row.id
  setFormData.name = row.name
  dialogVisibleSet.value = true
}
// 编辑标签
const onSet = async () => {
  console.log('onSet!')
  if (!setFormRef.value) return

  try {
    await setFormRef.value?.validate()
    isLoading.value = true

    await tagApi.set(setFormData.id, { id: setFormData.id, name: setFormData.name })
    ElMessage.success('更新成功')
    dialogVisibleSet.value = false

    await initTableData()
  } catch (err: any) {
    if (err?.errors) {
      // 表单验证错误，不显示消息
      return
    }
    ElMessage.error(err?.message || '更新失败')
  } finally {
    isLoading.value = false
  }
}

// 删除标签
const onDel = async (row: Tag) => {
  console.log('onDel!')
  try {
    await ElMessageBox.confirm(`确定要删除标签 "${row.name}" 吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    await tagApi.del(row.id)
    ElMessage.success('删除成功')
    await initTableData()
  } catch (err: any) {
    if (err === 'cancel') {
      // 用户取消删除
      return
    }
    ElMessage.error(err?.message || '删除失败')
  } finally {
    isLoading.value = false
  }
}

// 批量删除
const onBatchDel = async () => {
  if (multipleSelection.value.length === 0) {
    ElMessage.warning('请选择要删除的标签')
    return
  }

  try {
    const tagNames = multipleSelection.value.map((tag) => tag.name).join('、')
    await ElMessageBox.confirm(
      `确定要删除选中的 ${multipleSelection.value.length} 个标签吗？\n${tagNames}`,
      '批量删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )

    // 逐个删除选中的标签
    for (const tag of multipleSelection.value) {
      await tagApi.del(tag.id)
    }

    ElMessage.success(`成功删除 ${multipleSelection.value.length} 个标签`)
    multipleSelection.value = []
    await initTableData()
  } catch (error: any) {
    if (error === 'cancel') {
      return
    }
    ElMessage.error(error?.message || '批量删除失败')
  }
}

const handleSelectionChange = (val: Tag[]) => {
  multipleSelection.value = val
  console.log(multipleSelection.value)
}
</script>

<template>
  <h1>User Admin Page</h1>
  <div>{{ data }}</div>
</template>

<style scoped></style>
