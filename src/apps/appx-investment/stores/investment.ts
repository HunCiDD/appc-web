import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { BacktestTask, BacktestReport, TradeRecord } from '@/apps/appx-investment/types'
import { backtestApi } from '@/apps/appx-investment/apis'

export const useInvestmentStore = defineStore('investment', () => {
  // 状态
  const backtestTasks = ref<BacktestTask[]>([])
  const currentTask = ref<BacktestTask | null>(null)
  const currentReport = ref<BacktestReport | null>(null)
  const tradeRecords = ref<TradeRecord[]>([])
  const klineData = ref<any[]>([])

  // 加载状态
  const isLoadingTasks = ref(false)
  const isLoadingReport = ref(false)
  const isLoadingTrades = ref(false)
  const isLoadingKline = ref(false)

  // 分页信息
  const pagination = ref({
    page: 1,
    size: 20,
    total: 0,
    pages: 0,
  })

  // Getters
  const completedTasks = computed(() =>
    backtestTasks.value.filter(task => task.status === 'completed')
  )

  const runningTasks = computed(() =>
    backtestTasks.value.filter(task => task.status === 'running')
  )

  const totalProfit = computed(() => {
    if (!currentReport.value) return 0
    return currentReport.value.endCapital - currentReport.value.startCapital
  })

  // Actions
  const fetchBacktestTasks = async (params?: { page?: number; size?: number }) => {
    isLoadingTasks.value = true
    try {
      const response = await backtestApi.getTasks({
        page: params?.page || pagination.value.page,
        size: params?.size || pagination.value.size,
      })
      backtestTasks.value = response.items
      pagination.value = {
        page: response.page,
        size: response.size,
        total: response.total,
        pages: response.pages,
      }
    } finally {
      isLoadingTasks.value = false
    }
  }

  const fetchBacktestReport = async (taskId: string) => {
    isLoadingReport.value = true
    try {
      const [task, report] = await Promise.all([
        backtestApi.getTask(taskId),
        backtestApi.getReport(taskId),
      ])
      currentTask.value = task
      currentReport.value = report
    } finally {
      isLoadingReport.value = false
    }
  }

  const fetchTradeRecords = async (taskId: string, page?: number) => {
    isLoadingTrades.value = true
    try {
      const response = await backtestApi.getTradeRecords(taskId, { page })
      tradeRecords.value = response.items
    } finally {
      isLoadingTrades.value = false
    }
  }

  const fetchKLineData = async (params: {
    symbol: string
    startTime: string
    endTime: string
    interval: string
  }) => {
    isLoadingKline.value = true
    try {
      const data = await backtestApi.getKLineData(params)
      klineData.value = data
    } finally {
      isLoadingKline.value = false
    }
  }

  const clearCurrentData = () => {
    currentTask.value = null
    currentReport.value = null
    tradeRecords.value = []
    klineData.value = []
  }

  return {
    // 状态
    backtestTasks,
    currentTask,
    currentReport,
    tradeRecords,
    klineData,

    // 加载状态
    isLoadingTasks,
    isLoadingReport,
    isLoadingTrades,
    isLoadingKline,

    // 分页
    pagination,

    // Getters
    completedTasks,
    runningTasks,
    totalProfit,

    // Actions
    fetchBacktestTasks,
    fetchBacktestReport,
    fetchTradeRecords,
    fetchKLineData,
    clearCurrentData,
  }
})