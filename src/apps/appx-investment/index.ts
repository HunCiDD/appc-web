/**
 * appx-investment 财务投资模块
 *
 * 提供回测任务管理、报告查看、K线图表等功能
 */

// 导出 API
export * from './apis'

// 导出 Store
export * from './stores'

// 导出类型
export * from './types'

// 导出组件（按需导出）
export { default as BacktestTaskList } from './components/BacktestTaskList.vue'
export { default as KLineChart } from './components/charts/KLineChart.vue'
export { default as BacktestCurveChart } from './components/charts/BacktestCurveChart.vue'
export { default as TradeTable } from './components/tables/TradeTable.vue'

// 导出视图（按需导出）
export { default as BacktestTaskListView } from './views/BacktestTaskListView.vue'
export { default as BacktestReportView } from './views/BacktestReportView.vue'

// 导出工具
export * from './utils/request'