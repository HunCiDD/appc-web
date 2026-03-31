<template>
  <div class="backtest-report-view">
    <!-- 页面标题和导航 -->
    <div class="page-header mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold">回测报告</h1>
          <div class="mt-2 flex items-center gap-4 text-gray-600">
            <span>任务ID: {{ taskId }}</span>
            <el-tag :type="getStatusType(currentTask?.status)" size="small">
              {{ getStatusText(currentTask?.status) }}
            </el-tag>
            <el-button
              v-if="currentTask"
              type="primary"
              link
              size="small"
              @click="handleBackToList"
            >
              <i-ep-back /> 返回列表
            </el-button>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <el-button type="primary" plain @click="handleExportReport">
            <i-ep-download /> 导出报告
          </el-button>
          <el-button type="info" plain @click="handleRefresh">
            <i-ep-refresh /> 刷新
          </el-button>
        </div>
      </div>
    </div>

    <!-- 关键指标卡片 -->
    <div v-if="currentReport" class="metrics-grid mb-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="metric-card">
          <div class="metric-label">总收益率</div>
          <div class="metric-value" :class="getReturnClass(currentReport.totalReturn)">
            {{ formatPercent(currentReport.totalReturn) }}
          </div>
          <div class="metric-desc">累计收益</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">年化收益率</div>
          <div class="metric-value" :class="getReturnClass(currentReport.annualReturn)">
            {{ formatPercent(currentReport.annualReturn) }}
          </div>
          <div class="metric-desc">年化收益</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">夏普比率</div>
          <div class="metric-value">
            {{ currentReport.sharpeRatio.toFixed(2) }}
          </div>
          <div class="metric-desc">风险调整后收益</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">最大回撤</div>
          <div class="metric-value text-red-600">
            {{ formatPercent(currentReport.maxDrawdown) }}
          </div>
          <div class="metric-desc">最大亏损幅度</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">胜率</div>
          <div class="metric-value">
            {{ formatPercent(currentReport.winRate) }}
          </div>
          <div class="metric-desc">盈利交易比例</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">总交易次数</div>
          <div class="metric-value">
            {{ currentReport.totalTrades }}
          </div>
          <div class="metric-desc">交易总数</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">起始资金</div>
          <div class="metric-value">
            {{ formatCurrency(currentReport.startCapital) }}
          </div>
          <div class="metric-desc">初始投入</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">结束资金</div>
          <div class="metric-value">
            {{ formatCurrency(currentReport.endCapital) }}
          </div>
          <div class="metric-desc">最终资金</div>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="isLoadingReport" class="flex justify-center items-center py-12">
      <el-skeleton :rows="6" animated />
    </div>

    <!-- 图表区域 -->
    <div v-else-if="currentReport" class="charts-section mb-6">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- K线图 -->
        <div class="chart-container">
          <KLineChart
            v-if="klineData.length > 0"
            :data="klineData"
            :symbol="currentTask?.symbol || ''"
            height="500px"
            @interval-change="handleKLineIntervalChange"
          />
          <div v-else class="empty-chart">
            <el-empty description="暂无K线数据" />
          </div>
        </div>

        <!-- 回测曲线 -->
        <div class="chart-container">
          <BacktestCurveChart
            v-if="equityData.length > 0"
            :equity-data="equityData"
            height="500px"
          />
          <div v-else class="empty-chart">
            <el-empty description="暂无回测曲线数据" />
          </div>
        </div>
      </div>
    </div>

    <!-- 交易记录 -->
    <div class="trades-section">
      <div class="section-header mb-4">
        <h2 class="text-xl font-semibold">交易记录</h2>
        <div class="text-sm text-gray-600">
          共 {{ tradeRecords.length }} 笔交易，其中盈利 {{ profitTrades }} 笔，亏损 {{ lossTrades }} 笔
        </div>
      </div>

      <TradeTable
        :trades="tradeRecords"
        :loading="isLoadingTrades"
        :total="tradePagination.total"
        :page="tradePagination.page"
        :size="tradePagination.size"
        @page-change="handleTradePageChange"
        @size-change="handleTradeSizeChange"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useInvestmentStore } from '@/apps/appx-investment/stores'
import KLineChart from '@/apps/appx-investment/components/charts/KLineChart.vue'
import BacktestCurveChart from '@/apps/appx-investment/components/charts/BacktestCurveChart.vue'
import TradeTable from '@/apps/appx-investment/components/tables/TradeTable.vue'
import type { BacktestTaskStatus } from '@/apps/appx-investment/types'

const route = useRoute()
const router = useRouter()
const investmentStore = useInvestmentStore()

// 路由参数
const taskId = computed(() => route.params.taskId as string)

// Store 数据
const currentTask = computed(() => investmentStore.currentTask)
const currentReport = computed(() => investmentStore.currentReport)
const tradeRecords = computed(() => investmentStore.tradeRecords)
const klineData = computed(() => investmentStore.klineData)
const isLoadingReport = computed(() => investmentStore.isLoadingReport)
const isLoadingTrades = computed(() => investmentStore.isLoadingTrades)

// 分页状态
const tradePagination = ref({
  page: 1,
  size: 20,
  total: 0,
})

// 计算属性
const profitTrades = computed(() => {
  if (!currentReport.value) return 0
  return currentReport.value.profitTrades
})

const lossTrades = computed(() => {
  if (!currentReport.value) return 0
  return currentReport.value.lossTrades
})

// 模拟权益数据（实际应从API获取）
const equityData = computed(() => {
  if (!klineData.value.length || !currentReport.value) return []

  // 这里简单模拟权益数据，实际应该从API获取
  return klineData.value.map((item, index) => {
    const baseEquity = currentReport.value.startCapital
    const returnRate = currentReport.value.totalReturn * (index / klineData.value.length)
    return {
      timestamp: item.timestamp,
      equity: baseEquity * (1 + returnRate),
    }
  })
})

// 方法
const getStatusType = (status?: BacktestTaskStatus) => {
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

const getStatusText = (status?: BacktestTaskStatus) => {
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
      return '未知'
  }
}

const formatPercent = (value: number) => {
  return `${(value * 100).toFixed(2)}%`
}

const formatCurrency = (value: number) => {
  return `¥${value.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

const getReturnClass = (returnRate: number) => {
  return returnRate >= 0 ? 'text-green-600' : 'text-red-600'
}

const handleBackToList = () => {
  router.push({ name: 'BacktestTaskList' })
}

const handleExportReport = () => {
  ElMessage.info('导出功能开发中')
}

const handleRefresh = () => {
  fetchReportData()
}

const handleKLineIntervalChange = (interval: string) => {
  // 重新获取K线数据
  if (currentTask.value) {
    const endTime = currentTask.value.endTime || new Date().toISOString()
    const startTime = currentTask.value.startTime || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

    investmentStore.fetchKLineData({
      symbol: currentTask.value.symbol,
      startTime,
      endTime,
      interval,
    })
  }
}

const handleTradePageChange = (page: number) => {
  tradePagination.value.page = page
  fetchTradeRecords()
}

const handleTradeSizeChange = (size: number) => {
  tradePagination.value.page = 1
  tradePagination.value.size = size
  fetchTradeRecords()
}

// 数据获取
const fetchReportData = async () => {
  if (!taskId.value) return

  try {
    // 获取报告和任务详情
    await investmentStore.fetchBacktestReport(taskId.value)

    // 获取K线数据
    if (currentTask.value) {
      const endTime = currentTask.value.endTime || new Date().toISOString()
      const startTime = currentTask.value.startTime || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

      await investmentStore.fetchKLineData({
        symbol: currentTask.value.symbol,
        startTime,
        endTime,
        interval: '1d',
      })
    }

    // 获取交易记录
    await fetchTradeRecords()
  } catch (error) {
    ElMessage.error('获取报告数据失败')
  }
}

const fetchTradeRecords = async () => {
  if (!taskId.value) return

  try {
    await investmentStore.fetchTradeRecords(taskId.value, tradePagination.value.page)
    // 更新分页总数（实际应从API响应中获取）
    if (currentReport.value) {
      tradePagination.value.total = currentReport.value.totalTrades
    }
  } catch (error) {
    ElMessage.error('获取交易记录失败')
  }
}

// 生命周期和监听
onMounted(() => {
  fetchReportData()
})

watch(taskId, (newTaskId) => {
  if (newTaskId) {
    fetchReportData()
  }
})
</script>

<style scoped>
@reference "tailwindcss";

.backtest-report-view {
  @apply p-6;
}

.page-header {
  @apply border-b pb-4;
}

.metrics-grid {
  @apply mt-6;
}

.metric-card {
  @apply border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow;
}

.metric-label {
  @apply text-sm text-gray-500 mb-1;
}

.metric-value {
  @apply text-2xl font-bold mb-1;
}

.metric-desc {
  @apply text-xs text-gray-400;
}

.charts-section {
  @apply mt-6;
}

.chart-container {
  @apply border rounded-lg p-4 bg-white;
}

.empty-chart {
  @apply flex items-center justify-center h-[500px] border rounded-lg bg-gray-50;
}

.trades-section {
  @apply mt-8;
}

.section-header {
  @apply flex justify-between items-center;
}
</style>