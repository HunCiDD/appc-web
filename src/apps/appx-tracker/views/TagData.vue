<script lang="ts" setup>
import {CirclePlus, Delete, Edit, Postcard, Refresh, Search} from '@element-plus/icons-vue'
import type {Tag} from '@/apps/appx-tracker/types'
import {tagApi} from '@/apps/appx-tracker/apis'
import {ElMessage, ElMessageBox, type FormInstance, type FormRules} from 'element-plus'

// 响应式数据
const queryFormData = reactive({
  id: '',
  name: '',
})

const tableData = ref<Tag[]>([])
const filteredTableData = ref<Tag[]>([])
const multipleSelection = ref<Tag[]>([])

const paginationData = reactive({
  currentPage: 1,
  pageSize: 10,
  pageSizes: [10, 20, 50, 100],
  disabled: false,
  total: 0,
})


const formRules: FormRules = {
  name: [
    {required: true, message: '请输入标签名称', trigger: 'blur'},
    {min: 1, max: 32, message: '长度在 1 到 32 个字符', trigger: 'blur'},
  ],
}
// 表单相关
const addFormRef = ref<FormInstance>()
const addFormData = reactive({
  name: '',
})
const setFormRef = ref<FormInstance>()


const setFormData = reactive({
  id: '',
  name: '',
})
const descriptionData = reactive({
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
    const response = await tagApi.list()
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

// 搜索功能
const onQuery = () => {
  console.log('onQuery!')
  filteredTableData.value = tableData.value.filter(tag => {
    const idMatch = !queryFormData.id || tag.id.toString().includes(queryFormData.id)
    const nameMatch = !queryFormData.name || tag.name.includes(queryFormData.name)
    return idMatch && nameMatch
  })
  updatePagination()
}

const onResetQuery = () => {
  queryFormData.id = ''
  queryFormData.name = ''
  filteredTableData.value = tableData.value
  updatePagination()
}

// 添加标签
const onAdd = async () => {
  console.log('onAdd!')
  if (!addFormRef.value) return

  try {
    await addFormRef.value?.validate()
    isLoading.value = true

    await tagApi.add({name: addFormData.name})
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

    await tagApi.set(setFormData.id, {id: setFormData.id, name: setFormData.name})
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
    await ElMessageBox.confirm(
      `确定要删除标签 "${row.name}" 吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

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
    const tagNames = multipleSelection.value.map(tag => tag.name).join('、')
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
  <el-row>
    <el-col :span="24">
      <span>事件管理</span>
    </el-col>
    <el-divider/>

    <!-- 搜索条件 -->
    <el-col :span="24">
      <div class="conditional">
        <el-form :inline="true" :model="queryFormData">
          <el-form-item label="ID" label-position="left">
            <el-input
              v-model="queryFormData.id"
              clearable
              placeholder="输入ID"
              style="width: 120px;"
            />
          </el-form-item>
          <el-form-item label="标签名称" label-position="left">
            <el-input
              v-model="queryFormData.name"
              clearable
              placeholder="输入标签名称"
              style="width: 240px"
            />
          </el-form-item>
          <el-form-item>
            <el-button :icon="Search" type="primary" @click="onQuery">
              查询
            </el-button>
            <el-button :icon="Refresh" @click="onResetQuery">
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-col>

    <el-divider/>
    <!-- 操作按钮 -->
    <el-col :span="24">
      <div class="add">
        <el-row>
          <el-col :span="4">
            <el-button :icon="CirclePlus" type="primary" @click="dialogVisibleAdd = true">
              添加事件
            </el-button>
            <el-button
              :disabled="multipleSelection.length === 0"
              :icon="Delete"
              type="danger"
              @click="onBatchDel"
            >
              批量删除({{ multipleSelection.length }})
            </el-button>
          </el-col>
        </el-row>
      </div>
    </el-col>

    <!-- 数据表格 -->
    <el-col :span="24">
      <div class="table-container">
        <el-table
          v-loading="isLoading"
          :data="filteredTableData"
          style="width: 100%"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55"/>
          <el-table-column label="ID" prop="id" width="80"/>
          <el-table-column label="标签名称" min-width="150" prop="name"/>
          <el-table-column fixed="right" label="操作" width="180">
            <template #default="scope">
              <el-button :icon="Postcard" type="success" @click="onDialogVisibleDetail(scope.row)">
                详情
              </el-button>
              <el-button :icon="Edit" type="primary" @click="onDialogVisibleSet(scope.row)">
                编辑
              </el-button>
              <el-button :icon="Delete" type="danger" @click="onDel(scope.row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-col>

    <!-- 分页 -->
    <el-col :span="24">
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="paginationData.currentPage"
          v-model:page-size="paginationData.pageSize"
          :disabled="paginationData.disabled"
          :page-sizes="paginationData.pageSizes"
          :total="paginationData.total"
          background
          layout="total, sizes, prev, pager, next, jumper"
        />
      </div>
    </el-col>
  </el-row>

  <!-- 添加标签对话框 -->
  <el-dialog v-model="dialogVisibleAdd" draggable title="新增标签" width="400px"
             @closed="resetAddForm">
    <el-form ref="addFormRef" :model="addFormData" :rules="formRules" label-width="80px">
      <el-form-item label="标签名称" prop="name">
        <el-input v-model="addFormData.name" clearable maxlength="32" placeholder="请输入标签名称"
                  show-word-limit/>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisibleAdd = false"> 取消</el-button>
        <el-button :loading="isLoading" type="primary" @click="onAdd"> 确认</el-button>
      </div>
    </template>
  </el-dialog>

  <!--  TableData 详情操作  -->
  <el-dialog v-model="dialogVisibleDetail" draggable title="详情操作" width="500">
    <el-descriptions>
      <el-descriptions-item label="ID">{{ descriptionData.id }}</el-descriptions-item>
      <el-descriptions-item label="名称">{{ descriptionData.name }}</el-descriptions-item>
    </el-descriptions>
  </el-dialog>

  <!--  TableData 编辑操作  -->
  <el-dialog v-model="dialogVisibleSet" draggable title="Tips" width="500">
    <el-form ref="setFormRef" :model="setFormData" :rules="formRules">
      <el-form-item label="事件名称" label-position="left" prop="name">
        <el-input v-model="setFormData.name" clearable placeholder="输入事件名称"/>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisibleSet = false"> 取消</el-button>
        <el-button type="primary" @click="onSet"> 确认</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.conditional {
  margin-bottom: 20px;
}

.table-container {
  margin-bottom: 20px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

:deep(.el-table) {
  margin-top: 10px;
}

:deep(.el-form--inline .el-form-item) {
  margin-right: 20px;
  margin-bottom: 10px;
}
</style>
