<!--
 * new page
 * @author: HunCiDD
 * @since: 2025-10-22
 * ThingData.vue
-->
<script lang="ts" setup>
import { CirclePlus, Delete, Edit, Postcard, Refresh, Search } from '@element-plus/icons-vue'
import type { Thing } from '@/apps/appx_tracker/types'
import { thingApi } from '@/apps/appx_tracker/apis'
import { ElMessageBox, type FormInstance, type FormRules } from 'element-plus'

// 查询响应数据
const queryFormData = reactive({
  id: '',
  content: '',
})
// 表格数据
const tableData = ref<Thing[]>([])
// 过滤后表格数据
const filteredTableData = ref<Thing[]>([])
// 表格多选-勾选
const multipleSelection = ref<Thing[]>([])
// 分页数据
const paginationData = reactive({
  currentPage: 1,
  pageSize: 10,
  pageSizes: [10, 20, 50, 100],
  disabled: false,
  total: 0,
})
// 表单相关
const formRules: FormRules = {
  content: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 1, max: 32, message: '长度在 1 到 32 个字符', trigger: 'blur' },
  ],
}
// 表单相关
const addFormRef = ref<FormInstance>()
const addFormData = reactive({
  content: '',
})
const setFormRef = ref<FormInstance>()
const setFormData = reactive({
  id: '',
  content: '',
})
const descriptionData = reactive({
  id: '',
  content: '',
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
    const response = await thingApi.list()
    tableData.value = response.data
    filteredTableData.value = response.data
    updatePagination()
  } catch (err: any) {
    console.log(err.message || '获取事件列表失败')
    ElMessage.error('获取事件列表失败')
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
  filteredTableData.value = tableData.value.filter((data) => {
    const idMatch = !queryFormData.id || data.id.toString().includes(queryFormData.id)
    const contentMatch = !queryFormData.content || data.content.includes(queryFormData.content)
    return idMatch && contentMatch
  })
  updatePagination()
}

const onResetQuery = () => {
  queryFormData.id = ''
  queryFormData.content = ''
  filteredTableData.value = tableData.value
  updatePagination()
}

const onAdd = async () => {
  console.log('onAdd!')
  if (!addFormRef.value) return

  try {
    await addFormRef.value?.validate()
    isLoading.value = true

    await thingApi.add({ content: addFormData.content })
    ElMessage.success('添加成功')
    dialogVisibleAdd.value = false
    addFormData.content = ''

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
  addFormData.content = ''
  addFormRef.value?.clearValidate()
}

const onDialogVisibleDetail = (row: Thing) => {
  console.log('onDialogVisibleDetail')
  descriptionData.id = row.id
  descriptionData.content = row.content
  dialogVisibleDetail.value = true
}

const onDialogVisibleSet = (row: Thing) => {
  console.log('onDialogVisibleSet')
  setFormData.id = row.id
  setFormData.content = row.content
  dialogVisibleSet.value = true
}

// 编辑事件
const onSet = async () => {
  console.log('onSet!')
  if (!setFormRef.value) return

  try {
    await setFormRef.value?.validate()
    isLoading.value = true

    await thingApi.set(setFormData.id, { id: setFormData.id, content: setFormData.content })
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

const onDel = async (row: Thing) => {
  console.log('onDel!')
  try {
    await ElMessageBox.confirm(`确定要删除事件 "${row.content}" 吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    await thingApi.del(row.id)
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
    ElMessage.warning('请选择要删除的事件')
    return
  }

  try {
    const tagNames = multipleSelection.value.map((tag) => tag.content).join('、')
    await ElMessageBox.confirm(
      `确定要删除选中的 ${multipleSelection.value.length} 个事件吗？\n${tagNames}`,
      '批量删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )

    // 逐个删除选中的事件
    for (const tag of multipleSelection.value) {
      await thingApi.del(tag.id)
    }

    ElMessage.success(`成功删除 ${multipleSelection.value.length} 个事件`)
    multipleSelection.value = []
    await initTableData()
  } catch (error: any) {
    if (error === 'cancel') {
      return
    }
    ElMessage.error(error?.message || '批量删除失败')
  }
}

const handleSelectionChange = (val: Thing[]) => {
  multipleSelection.value = val
  console.log(multipleSelection.value)
}
</script>

<template>
  <el-row>
    <el-col :span="24">
      <span>事件管理</span>
    </el-col>
    <el-divider />

    <!-- 搜索条件 -->
    <el-col :span="24">
      <div class="conditional">
        <el-form :inline="true" :model="queryFormData">
          <el-form-item label="ID" label-position="left">
            <el-input
              v-model="queryFormData.id"
              clearable
              placeholder="输入ID"
              style="width: 240px"
            />
          </el-form-item>
          <el-form-item label="事件内容" label-position="left">
            <el-input
              v-model="queryFormData.content"
              clearable
              placeholder="输入事件内容"
              style="width: 240px"
            />
          </el-form-item>
          <el-form-item>
            <el-button :icon="Search" type="primary" @click="onQuery"> 查询 </el-button>
            <el-button :icon="Refresh" @click="onResetQuery"> 重置 </el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-col>

    <el-divider />
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
          <el-table-column type="selection" width="55" />
          <el-table-column label="ID" prop="id" />
          <el-table-column label="事件内容" prop="content" width="120" />
          <el-table-column fixed="right" label="操作" min-width="120">
            <template #default="scope">
              <el-button :icon="Postcard" type="success" @click="onDialogVisibleDetail(scope.row)">
                详情
              </el-button>
              <el-button :icon="Edit" type="primary" @click="onDialogVisibleSet(scope.row)">
                编辑
              </el-button>
              <el-button :icon="Delete" type="danger" @click="onDel(scope.row)"> 删除 </el-button>
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

  <!--  TableData 添加弹框  -->
  <el-dialog v-model="dialogVisibleAdd" draggable title="新增事件" width="350">
    <el-form ref="addFormRef" :model="addFormData" :rules="formRules">
      <el-form-item label="事件内容" label-position="left" prop="content">
        <el-input v-model="addFormData.content" clearable placeholder="输入事件内容" />
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
      <el-descriptions-item label="名称">{{ descriptionData.content }}</el-descriptions-item>
    </el-descriptions>
  </el-dialog>

  <!--  TableData 编辑操作  -->
  <el-dialog v-model="dialogVisibleSet" draggable title="Tips" width="500">
    <el-form ref="setFormRef" :model="setFormData" :rules="formRules">
      <el-form-item label="事件名称" label-position="left" prop="name">
        <el-input v-model="setFormData.content" clearable placeholder="输入事件名称" />
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
=== src/apps/appx_tracker/views/TimeSpend.vue ===
<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import { formatDate, todayEndDate, todayStartDate } from '@/utils/date.ts'
import type { Action } from '@/apps/daily-tracker/types.ts'
import { listActions } from '@/apps/appx_tracker/apis'

// 响应数据
const actions = ref<Action[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

// 获取行动列表
const fetchActions = async () => {
  try {
    loading.value = true
    error.value = null
    const response = await listActions()
    actions.value = response.data
  } catch (err: any) {
    error.value = err.message || '获取行动列表失败'
    throw err
  } finally {
    loading.value = false
  }
}

// 表单响应数据
const form = reactive({
  timeRange: [todayStartDate(), todayEndDate()],
  interval: 30,
})

const changeInterval = (value: number) => {
  form.interval = value
}

interface TableTitles {
  prop: string
  label: string
}

const tableTitles = ref<TableTitles[]>([])

const setTableTitles = () => {
  // 设置表格titles
  const slots: TableTitles[] = [
    { prop: 'date', label: '日期' },
    { prop: 'week', label: '星期' },
    { prop: 'type', label: '类型' },
  ]
  const [startDate, endDate] = form.timeRange
  const startHour = startDate.getHours()
  const startMinute = startDate.getMinutes()
  const endHour = endDate.getHours()
  const endMinute = endDate.getMinutes()

  let currentHour = startHour
  let currentMinute = startMinute

  while (currentHour < endHour || (currentHour === endHour && currentMinute <= endMinute)) {
    const timeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`
    slots.push({ prop: timeStr, label: timeStr })

    currentMinute += form.interval
    if (currentMinute >= 60) {
      currentMinute = currentMinute - 60
      currentHour += 1
    }

    if (currentHour > 23) {
      break
    }
  }
  console.log('Confirmed time slots:', slots)
  tableTitles.value = slots
}

interface TableRecord {
  date: string
  week: string
  type: string

  [key: string]: string
}

const tableData = ref<TableRecord[]>([])

const setTableData = () => {
  const tableRecordMap: Map<string, TableRecord> = new Map()

  actions.value.forEach((action) => {
    // 解析action开始和结束时间
    const startTime = new Date(action.start_at)
    const endTime = new Date(action.end_at)
    // 获取开始和结束日期（去掉时间部分）
    const startDate = new Date(startTime.getFullYear(), startTime.getMonth(), startTime.getDate())
    const endDate = new Date(endTime.getFullYear(), endTime.getMonth(), endTime.getDate())
    const weekdays = ['日', '一', '二', '三', '四', '五', '六']

    const thingContent: string = action.thing.content

    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      // 获取日期字符串
      const dateStr = formatDate(date)
      // 获取星期几
      const weekStr = weekdays[date.getDay()]
      // 如果该日期不存在于 tableRecordMap 中，则初始化
      const record: TableRecord = tableRecordMap.get(dateStr) ?? {
        date: dateStr,
        week: weekStr,
        type: 'Action',
      }

      for (let i = 3; i < tableTitles.value.length; i++) {
        const timeSlot = tableTitles.value[i].prop
        const curTime = new Date(`${dateStr} ${timeSlot}:00`)
        if (curTime < startTime || curTime > endTime) {
          continue
        }

        if (
          record[timeSlot] === undefined ||
          record[timeSlot] === null ||
          record[timeSlot].trim() === ''
        ) {
          record[timeSlot] = thingContent
        } else {
          record[timeSlot] = `${record[timeSlot]}/${thingContent}`
        }
      }
      tableRecordMap.set(dateStr, record)
    }
  })
  // 将 tableColumns 转换为数组
  tableData.value = [...tableRecordMap.values()]
  console.log(tableData.value)
}

const updateTableData = () => {
  setTableTitles()
  setTableData()
}

const confirmSelection = () => {
  setTableTitles()
}

const initializeData = async () => {
  try {
    await fetchActions()
    updateTableData()
  } catch (error) {
    console.error('Failed to initialize data:', error)
    // 可以在这里添加错误处理逻辑，比如显示错误消息
  }
}

// 生命周期钩子
onMounted(() => {
  initializeData()
})
</script>

<template>
  <div class="time-spend-view">
    <div class="time-spend-interval-selector">
      <el-form :inline="true" :model="form" class="demo-form-inline">
        <el-form-item label="时间范围">
          <el-time-picker
            v-model="form.timeRange"
            end-placeholder="End time"
            is-range
            range-separator="To"
            start-placeholder="Start time"
          />
        </el-form-item>
        <el-form-item label="时间间隔">
          <el-select
            v-model="form.interval"
            placeholder="请选择时间间隔"
            style="width: 100px"
            @change="changeInterval"
          >
            <el-option :value="5" label="5分钟" />
            <el-option :value="10" label="10分钟" />
            <el-option :value="15" label="15分钟" />
            <el-option :value="30" label="30分钟" />
            <el-option :value="60" label="60分钟" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="confirmSelection">确认</el-button>
        </el-form-item>
      </el-form>
    </div>
    <!-- 表格渲染 -->
    <div class="time-spend-table">
      <el-table :data="tableData" border style="width: 100%">
        <el-table-column
          v-for="(slot, index) in tableTitles"
          :key="index"
          :label="slot.label"
          :prop="slot.prop"
        />
      </el-table>
    </div>
  </div>
</template>

<style scoped>
.time-spend-view {
  padding: 20px;
  max-width: 80%;
}

.time-interval-selector {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
</style>
