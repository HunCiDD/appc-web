import { investmentRequest } from '@/apps/appx-investment/utils/request'
import type {
  BacktestTask,
  BacktestReport,
  TradeRecord,
  PageData
} from '@/apps/appx-investment/types'
import type { KLineData } from '@/apps/appx-investment/types/kline'

const BASE_URL = '/v1/investment'

enum API_URL {
  BACKTEST_TASKS = `${BASE_URL}/backtest/tasks`,
  BACKTEST_REPORT = `${BASE_URL}/backtest/report`,
  KLINE_DATA = `${BASE_URL}/kline`,
  TRADE_RECORDS = `${BASE_URL}/backtest/trades`,
}

export const backtestApi = {
  // 获取回测任务列表
  getTasks: (params: { page?: number; size?: number; status?: string } = {}) =>
    investmentRequest.get<PageData<BacktestTask>>(API_URL.BACKTEST_TASKS, params),

  // 获取单个回测任务详情
  getTask: (taskId: string) =>
    investmentRequest.get<BacktestTask>(`${API_URL.BACKTEST_TASKS}/${taskId}`),

  // 获取回测报告
  getReport: (taskId: string) =>
    investmentRequest.get<BacktestReport>(`${API_URL.BACKTEST_REPORT}/${taskId}`),

  // 获取K线数据
  getKLineData: (params: {
    symbol: string;
    startTime: string;
    endTime: string;
    interval: string
  }) =>
    investmentRequest.get<KLineData[]>(API_URL.KLINE_DATA, params),

  // 获取交易记录
  getTradeRecords: (taskId: string, params?: { page?: number; size?: number }) =>
    investmentRequest.get<PageData<TradeRecord>>(
      `${API_URL.TRADE_RECORDS}/${taskId}`,
      params
    ),
}