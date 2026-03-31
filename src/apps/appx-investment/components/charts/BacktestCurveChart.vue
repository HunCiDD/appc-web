<template>
  <div class="backtest-curve-chart">
    <div class="chart-header">
      <h3 class="text-lg font-semibold">回测曲线</h3>
      <div class="chart-legend">
        <div class="legend-item">
          <span class="legend-color bg-blue-500"></span>
          <span class="legend-label">资金曲线</span>
        </div>
        <div v-if="benchmarkData.length > 0" class="legend-item">
          <span class="legend-color bg-orange-500"></span>
          <span class="legend-label">基准对比</span>
        </div>
      </div>
    </div>
    <div ref="chartRef" class="chart-container"></div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import type { ECharts, EChartsOption } from 'echarts'

interface EquityPoint {
  timestamp: number
  equity: number
  drawdown?: number
}

interface BenchmarkPoint {
  timestamp: number
  value: number
}

interface Props {
  equityData: EquityPoint[]
  benchmarkData?: BenchmarkPoint[]
  height?: string
  showDrawdown?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  benchmarkData: () => [],
  height: '400px',
  showDrawdown: true,
})

const chartRef = ref<HTMLDivElement>()
const chartInstance = ref<ECharts>()

// 初始化图表
const initChart = () => {
  if (!chartRef.value) return

  chartInstance.value = echarts.init(chartRef.value)
  updateChart()

  // 响应式调整
  window.addEventListener('resize', handleResize)
}

// 更新图表数据
const updateChart = () => {
  if (!chartInstance.value || !props.equityData.length) return

  // 计算收益率
  const startEquity = props.equityData[0]?.equity || 1
  const returnSeries = props.equityData.map(point => ({
    timestamp: point.timestamp,
    value: ((point.equity - startEquity) / startEquity) * 100,
  }))

  // 计算回撤
  let maxEquity = props.equityData[0]?.equity || 0
  const drawdownSeries = props.equityData.map(point => {
    maxEquity = Math.max(maxEquity, point.equity)
    const drawdown = ((point.equity - maxEquity) / maxEquity) * 100
    return {
      timestamp: point.timestamp,
      value: drawdown,
    }
  })

  const option: EChartsOption = {
    backgroundColor: '#fff',
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
      },
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderWidth: 1,
      borderColor: '#ccc',
      textStyle: {
        color: '#333',
      },
      formatter: (params: any) => {
        let html = `<div style="font-size: 14px; margin-bottom: 8px;">`
        html += `${new Date(params[0].axisValue).toLocaleString()}`
        html += `</div>`

        params.forEach((param: any) => {
          const value = param.value[1]
          const seriesName = param.seriesName
          let displayValue = value

          if (seriesName.includes('收益率')) {
            displayValue = `${value.toFixed(2)}%`
          } else if (seriesName.includes('回撤')) {
            displayValue = `${value.toFixed(2)}%`
          } else {
            displayValue = value.toLocaleString('zh-CN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          }

          html += `<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">`
          html += `<span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background-color: ${param.color};"></span>`
          html += `<span>${seriesName}: ${displayValue}</span>`
          html += `</div>`
        })

        return html
      },
    },
    legend: {
      bottom: 10,
      left: 'center',
    },
    grid: [
      {
        left: '10%',
        right: '8%',
        height: '45%',
        top: '10%',
      },
      {
        left: '10%',
        right: '8%',
        height: '25%',
        top: '65%',
      },
    ],
    xAxis: [
      {
        type: 'time',
        gridIndex: 0,
        boundaryGap: [0, '0%'],
        axisLine: { onZero: false },
        splitLine: { show: false },
        axisLabel: {
          formatter: (value: number) => {
            return new Date(value).toLocaleDateString()
          },
        },
      },
      {
        type: 'time',
        gridIndex: 1,
        boundaryGap: [0, '0%'],
        axisLine: { onZero: false },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
      },
    ],
    yAxis: [
      {
        type: 'value',
        gridIndex: 0,
        scale: true,
        axisLabel: {
          formatter: '{value}%',
        },
        splitLine: {
          show: true,
        },
      },
      {
        type: 'value',
        gridIndex: 1,
        scale: true,
        axisLabel: {
          formatter: '{value}%',
        },
        splitLine: {
          show: false,
        },
      },
    ],
    dataZoom: [
      {
        type: 'inside',
        xAxisIndex: [0, 1],
        start: 0,
        end: 100,
      },
      {
        show: true,
        xAxisIndex: [0, 1],
        type: 'slider',
        top: '95%',
        start: 0,
        end: 100,
      },
    ],
    series: [
      // 收益率曲线
      {
        name: '收益率',
        type: 'line',
        xAxisIndex: 0,
        yAxisIndex: 0,
        data: returnSeries.map(item => [item.timestamp, item.value]),
        smooth: true,
        showSymbol: false,
        lineStyle: {
          width: 2,
          color: '#3b82f6',
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
            { offset: 1, color: 'rgba(59, 130, 246, 0.05)' },
          ]),
        },
      },
      // 回撤曲线
      {
        name: '回撤',
        type: 'line',
        xAxisIndex: 1,
        yAxisIndex: 1,
        data: drawdownSeries.map(item => [item.timestamp, item.value]),
        smooth: true,
        showSymbol: false,
        lineStyle: {
          width: 2,
          color: '#ef4444',
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(239, 68, 68, 0.3)' },
            { offset: 1, color: 'rgba(239, 68, 68, 0.05)' },
          ]),
        },
      },
    ],
  }

  // 添加基准对比曲线
  if (props.benchmarkData.length > 0) {
    const benchmarkReturnSeries = props.benchmarkData.map(point => ({
      timestamp: point.timestamp,
      value: ((point.value - (props.benchmarkData[0]?.value || 1)) / (props.benchmarkData[0]?.value || 1)) * 100,
    }))

    const benchmarkSeries: any = {
      name: '基准收益率',
      type: 'line',
      xAxisIndex: 0,
      yAxisIndex: 0,
      data: benchmarkReturnSeries.map(item => [item.timestamp, item.value]),
      smooth: true,
      showSymbol: false,
      lineStyle: {
        width: 2,
        color: '#f97316',
        type: 'dashed',
      },
    }

    // @ts-ignore
    option.series.push(benchmarkSeries)
  }

  // 添加标记点（最大回撤点）
  if (props.showDrawdown && drawdownSeries.length > 0) {
    const maxDrawdownPoint = drawdownSeries.reduce((min, point) =>
      point.value < min.value ? point : min
    )

    const maxDrawdownMarkPoint: any = {
      name: '最大回撤',
      type: 'scatter',
      xAxisIndex: 1,
      yAxisIndex: 1,
      data: [[maxDrawdownPoint.timestamp, maxDrawdownPoint.value]],
      symbolSize: 10,
      itemStyle: {
        color: '#ef4444',
      },
      label: {
        show: true,
        formatter: `最大回撤: {c}%`,
        position: 'top',
      },
    }

    // @ts-ignore
    option.series.push(maxDrawdownMarkPoint)
  }

  chartInstance.value.setOption(option)
}

// 处理窗口大小变化
const handleResize = () => {
  chartInstance.value?.resize()
}

// 生命周期
onMounted(() => {
  nextTick(() => {
    initChart()
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chartInstance.value?.dispose()
})

// 监听数据变化
watch(() => [props.equityData, props.benchmarkData], () => {
  updateChart()
}, { deep: true })
</script>

<style scoped>
@reference "tailwindcss";

.backtest-curve-chart {
  @apply border rounded-lg p-4 bg-white;
}

.chart-header {
  @apply flex justify-between items-center mb-4;
}

.chart-legend {
  @apply flex items-center gap-4;
}

.legend-item {
  @apply flex items-center gap-2;
}

.legend-color {
  @apply w-3 h-3 rounded-full;
}

.legend-label {
  @apply text-sm text-gray-600;
}

.chart-container {
  width: 100%;
  height: v-bind(height);
}
</style>