<template>
  <div class="backtest-task-list">
    <div class="list-header">
      <h3 class="text-lg font-semibold">回测任务</h3>
      <div class="header-actions">
        <el-button type="primary" size="small" @click="handleCreateTask">
          <i-ep-plus /> 新建任务
        </el-button>
      </div>
    </div>

    <!-- 筛选条件 -->
    <div class="filters mb-4 p-4 border rounded-lg bg-gray-50">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <span class="text-sm text-gray-600 mb-1 block">状态筛选</span>
          <el-select
            v-model="filterStatus"
            placeholder="全部状态"
            size="small"
            clearable
            @change="handleFilterChange"
          >
            <el-option label="全部" value="" />
            <el-option label="待处理" value="pending" />
            <el-option label="进行中" value="running" />
            <el-option label="已完成" value="completed" />
            <el-option label="失败" value="failed" />
          </el-select>
        </div>
        <div>
          <span class="text-sm text-gray-600 mb-1 block">策略筛选</span>
          <el-select
            v-model="filterStrategy"
            placeholder="全部策略"
            size="small"
            clearable
            filterable
            @change="handleFilterChange"
          >
            <el-option
              v-for="strategy in strategyOptions"
              :key="strategy"
              :label="strategy"
              :value="strategy"
            />
          </el-select>
        </div>
        <div>
          <span class="text-sm text-gray-600 mb-1 block">标的搜索</span>
          <el-input
            v-model="filterSymbol"
            placeholder="输入标的代码"
            size="small"
            clearable
            @input="handleSearchInput"
          />
        </div>
        <div class="flex items-end">
          <el-button type="default" size="small" @click="handleResetFilters">
            重置筛选
          </el-button>
        </div>
      </div>
    </div>

    <!-- 任务表格 -->
    <el-table
      v-loading="loading"
      :data="filteredTasks"
      style="width: 100%"
      :default-sort="{ prop: 'createdAt', order: 'descending' }"
      @sort-change="handleSortChange"
      @row-click="handleRowClick"
    >
      <el-table-column prop="name" label="任务名称" min-width="180">
        <template #default="{ row }">
          <div class="task-name">
            <div class="font-medium">{{ row.name }}</div>
            <div class="text-xs text-gray-500">{{ row.id }}</div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="symbol" label="标的" width="120" sortable />
      <el-table-column prop="strategy" label="策略" width="150" />
      <el-table-column prop="status" label="状态" width="120" sortable>
        <template #default="{ row }">
          <el-tag
            :type="getStatusType(row.status)"
            :class="getStatusClass(row.status)"
            size="small"
          >
            {{ getStatusText(row.status) }}
          </el-tag>
          <div v-if="row.status === 'running' && row.progress !== undefined" class="mt-1">
            <el-progress
              :percentage="row.progress"
              :stroke-width="6"
              :show-text="false"
            />
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="startTime" label="开始时间" width="150" sortable>
        <template #default="{ row }">
          {{ formatDate(row.startTime) }}
        </template>
      </el-table-column>
      <el-table-column prop="endTime" label="结束时间" width="150" sortable>
        <template #default="{ row }">
          {{ formatDate(row.endTime) }}
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="150" sortable>
        <template #default="{ row }">
          {{ formatDate(row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <div class="flex items-center gap-2">
            <el-button
              v-if="row.status === 'completed'"
              type="primary"
              link
              size="small"
              @click.stop="handleViewReport(row)"
            >
              查看报告
            </el-button>
            <el-button
              v-if="row.status === 'failed' && row.errorMessage"
              type="danger"
              link
              size="small"
              @click.stop="handleViewError(row)"
            >
              查看错误
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="mt-4 flex justify-end">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { useInvestmentStore } from '@/apps/appx-investment/stores'
import type { BacktestTask, BacktestTaskStatus } from '@/apps/appx-investment/types'

interface Props {
  tasks?: BacktestTask[]
  loading?: boolean
  total?: number
  page?: number
  size?: number
}

const props = withDefaults(defineProps<Props>(), {
  tasks: () => [],
  loading: false,
  total: 0,
  page: 1,
  size: 20,
})

const emit = defineEmits<{
  pageChange: [page: number]
  sizeChange: [size: number]
  taskClick: [task: BacktestTask]
  createTask: []
}>()

const router = useRouter()
const investmentStore = useInvestmentStore()

// 筛选状态
const filterStatus = ref<string>('')
const filterStrategy = ref<string>('')
const filterSymbol = ref<string>('')
const currentPage = ref(props.page)
const pageSize = ref(props.size)
const sortProp = ref<string>('createdAt')
const sortOrder = ref<'ascending' | 'descending'>('descending')

// 计算属性
const strategyOptions = computed(() => {
  const strategies = new Set<string>()
  props.tasks.forEach(task => {
    if (task.strategy) {
      strategies.add(task.strategy)
    }
  })
  return Array.from(strategies)
})

const filteredTasks = computed(() => {
  let filtered = [...props.tasks]

  // 状态筛选
  if (filterStatus.value) {
    filtered = filtered.filter(task => task.status === filterStatus.value)
  }

  // 策略筛选
  if (filterStrategy.value) {
    filtered = filtered.filter(task => task.strategy === filterStrategy.value)
  }

  // 标的搜索
  if (filterSymbol.value) {
    filtered = filtered.filter(task =>
      task.symbol.toLowerCase().includes(filterSymbol.value.toLowerCase())
    )
  }

  // 排序
  filtered.sort((a, b) => {
    const aVal = a[sortProp.value as keyof BacktestTask]
    const bVal = b[sortProp.value as keyof BacktestTask]

    if (aVal === undefined || bVal === undefined) return 0

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortOrder.value === 'ascending'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal)
    }

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortOrder.value === 'ascending' ? aVal - bVal : bVal - aVal
    }

    return 0
  })

  // 分页
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filtered.slice(start, end)
})

const total = computed(() => {
  // 如果有传入total，使用传入的total，否则使用筛选后的总数
  if (props.total > 0) {
    return props.total
  }
  return props.tasks.length
})

// 方法
const getStatusType = (status: BacktestTaskStatus) => {
  switch (status) {
    case 'completed':
      return 'success'
    case 'running':
      return 'warning'
    case 'failed':
      return 'danger'
    default:
      return 'info'
  }
}

const getStatusClass = (status: BacktestTaskStatus) => {
  switch (status) {
    case 'completed':
      return 'bg-green-50 text-green-700 border-green-200'
    case 'running':
      return 'bg-yellow-50 text-yellow-700 border-yellow-200'
    case 'failed':
      return 'bg-red-50 text-red-700 border-red-200'
    default:
      return 'bg-blue-50 text-blue-700 border-blue-200'
  }
}

const getStatusText = (status: BacktestTaskStatus) => {
  switch (status) {
    case 'pending':
      return '待处理'
    case 'running':
      return '进行中'
    case 'completed':
      return '已完成'
    case 'failed':
      return '失败'
    default:
      return status
  }
}

const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString()
}

const handleFilterChange = () => {
  currentPage.value = 1
}

const handleSearchInput = () => {
  // 防抖处理
  clearTimeout((window as any).searchTimer)
  ;(window as any).searchTimer = setTimeout(() => {
    currentPage.value = 1
  }, 300)
}

const handleResetFilters = () => {
  filterStatus.value = ''
  filterStrategy.value = ''
  filterSymbol.value = ''
  currentPage.value = 1
}

const handleSortChange = ({ prop, order }: { prop: string; order: 'ascending' | 'descending' }) => {
  sortProp.value = prop
  sortOrder.value = order || 'descending'
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  emit('sizeChange', size)
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
  emit('pageChange', page)
}

const handleRowClick = (task: BacktestTask) => {
  emit('taskClick', task)
}

const handleViewReport = (task: BacktestTask) => {
  router.push({ name: 'BacktestReport', params: { taskId: task.id } })
}

const handleViewError = (task: BacktestTask) => {
  if (task.errorMessage) {
    ElMessageBox.alert(task.errorMessage, '错误详情', {
      confirmButtonText: '确定',
    })
  }
}

const handleCreateTask = () => {
  emit('createTask')
}

onMounted(() => {
  // 组件挂载时触发初始筛选
  handleFilterChange()
})
</script>

<style scoped>
@reference "tailwindcss";

.backtest-task-list {
  @apply border rounded-lg p-4 bg-white;
}

.list-header {
  @apply flex justify-between items-center mb-6;
}

.header-actions {
  @apply flex items-center gap-2;
}

.task-name {
  @apply flex flex-col;
}

:deep(.el-table__row) {
  @apply cursor-pointer;
}

:deep(.el-table__row:hover) {
  @apply bg-gray-50;
}
</style>