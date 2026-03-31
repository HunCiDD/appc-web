<template>
  <div class="trade-table">
    <div class="table-header">
      <h3 class="text-lg font-semibold">交易记录</h3>
      <div class="table-summary">
        <div class="flex items-center gap-4">
          <div class="stat-item">
            <span class="text-sm text-gray-600">总交易数:</span>
            <span class="ml-2 font-medium">{{ totalTrades }}</span>
          </div>
          <div class="stat-item">
            <span class="text-sm text-gray-600">盈利交易:</span>
            <span class="ml-2 font-medium text-green-600">{{ profitTrades }}</span>
          </div>
          <div class="stat-item">
            <span class="text-sm text-gray-600">亏损交易:</span>
            <span class="ml-2 font-medium text-red-600">{{ lossTrades }}</span>
          </div>
        </div>
      </div>
    </div>

    <el-table
      v-loading="loading"
      :data="filteredTrades"
      style="width: 100%"
      :default-sort="{ prop: 'timestamp', order: 'descending' }"
      @sort-change="handleSortChange"
    >
      <el-table-column prop="timestamp" label="时间" width="180" sortable>
        <template #default="{ row }">
          {{ formatTimestamp(row.timestamp) }}
        </template>
      </el-table-column>
      <el-table-column prop="symbol" label="标的" width="120" />
      <el-table-column prop="side" label="方向" width="100">
        <template #default="{ row }">
          <el-tag :type="row.side === 'buy' ? 'success' : 'danger'" size="small">
            {{ row.side === 'buy' ? '买入' : '卖出' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="price" label="价格" width="120" sortable>
        <template #default="{ row }">
          {{ formatNumber(row.price) }}
        </template>
      </el-table-column>
      <el-table-column prop="quantity" label="数量" width="120" sortable>
        <template #default="{ row }">
          {{ formatNumber(row.quantity) }}
        </template>
      </el-table-column>
      <el-table-column prop="amount" label="金额" width="120" sortable>
        <template #default="{ row }">
          {{ formatNumber(row.amount) }}
        </template>
      </el-table-column>
      <el-table-column prop="commission" label="手续费" width="120">
        <template #default="{ row }">
          {{ formatNumber(row.commission) }}
        </template>
      </el-table-column>
      <el-table-column prop="profit" label="盈亏" width="120" sortable>
        <template #default="{ row }">
          <span :class="getProfitClass(row.profit)">
            {{ row.profit !== undefined ? formatNumber(row.profit) : '-' }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="profitRate" label="盈亏率" width="120" sortable>
        <template #default="{ row }">
          <span :class="getProfitClass(row.profit)">
            {{ row.profitRate !== undefined ? formatPercent(row.profitRate) : '-' }}
          </span>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div v-if="showPagination" class="mt-4 flex justify-end">
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
import { ref, computed } from 'vue'
import type { TradeRecord } from '@/apps/appx-investment/types'

interface Props {
  trades: TradeRecord[]
  loading?: boolean
  showPagination?: boolean
  total?: number
  page?: number
  size?: number
}

const props = withDefaults(defineProps<Props>(), {
  trades: () => [],
  loading: false,
  showPagination: true,
  total: 0,
  page: 1,
  size: 20,
})

const emit = defineEmits<{
  pageChange: [page: number]
  sizeChange: [size: number]
}>()

// 分页状态
const currentPage = ref(props.page)
const pageSize = ref(props.size)
const sortProp = ref<string>('timestamp')
const sortOrder = ref<'ascending' | 'descending'>('descending')

// 计算属性
const totalTrades = computed(() => props.trades.length)

const profitTrades = computed(() =>
  props.trades.filter(trade => (trade.profit || 0) > 0).length
)

const lossTrades = computed(() =>
  props.trades.filter(trade => (trade.profit || 0) < 0).length
)

const filteredTrades = computed(() => {
  let sorted = [...props.trades]

  // 排序
  if (sortProp.value) {
    sorted.sort((a, b) => {
      const aVal = a[sortProp.value as keyof TradeRecord]
      const bVal = b[sortProp.value as keyof TradeRecord]

      if (aVal === undefined || bVal === undefined) return 0

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder.value === 'ascending' ? aVal - bVal : bVal - aVal
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder.value === 'ascending'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal)
      }

      return 0
    })
  }

  // 分页
  if (props.showPagination) {
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return sorted.slice(start, end)
  }

  return sorted
})

// 方法
const formatTimestamp = (timestamp: number) => {
  return new Date(timestamp).toLocaleString()
}

const formatNumber = (value?: number) => {
  if (value === undefined) return '-'
  return value.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

const formatPercent = (value?: number) => {
  if (value === undefined) return '-'
  return `${(value * 100).toFixed(2)}%`
}

const getProfitClass = (profit?: number) => {
  if (profit === undefined) return ''
  return profit > 0 ? 'text-green-600 font-medium' : profit < 0 ? 'text-red-600 font-medium' : ''
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
</script>

<style scoped>
@reference "tailwindcss";

.trade-table {
  @apply border rounded-lg p-4 bg-white;
}

.table-header {
  @apply flex justify-between items-center mb-4;
}

.table-summary {
  @apply text-sm;
}

.stat-item {
  @apply flex items-center;
}

:deep(.el-table__row) {
  @apply cursor-pointer;
}

:deep(.el-table__row:hover) {
  @apply bg-gray-50;
}
</style>