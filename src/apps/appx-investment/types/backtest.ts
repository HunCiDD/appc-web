// 回测任务状态
export enum BacktestTaskStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

// 回测任务
export interface BacktestTask {
  id: string
  name: string
  symbol: string
  strategy: string
  startTime: string
  endTime: string
  status: BacktestTaskStatus
  createdAt: string
  updatedAt: string
  progress?: number
  errorMessage?: string
}

// 回测报告
export interface BacktestReport {
  taskId: string
  totalReturn: number
  annualReturn: number
  sharpeRatio: number
  maxDrawdown: number
  winRate: number
  totalTrades: number
  profitTrades: number
  lossTrades: number
  startCapital: number
  endCapital: number
  metrics: {
    [key: string]: number
  }
}

// 交易记录
export interface TradeRecord {
  id: string
  taskId: string
  timestamp: number
  symbol: string
  side: 'buy' | 'sell'
  price: number
  quantity: number
  amount: number
  commission: number
  profit?: number
  profitRate?: number
}

// 分页响应
export interface PageData<T> {
  items: T[]
  page: number
  size: number
  total: number
  pages: number
}