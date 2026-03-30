<template>
  <div class="kline-chart">
    <div class="chart-header">
      <h3 class="text-lg font-semibold">K线图</h3>
      <div class="controls">
        <el-select v-model="interval" size="small" @change="handleIntervalChange">
          <el-option label="1分钟" value="1m" />
          <el-option label="5分钟" value="5m" />
          <el-option label="15分钟" value="15m" />
          <el-option label="30分钟" value="30m" />
          <el-option label="1小时" value="1h" />
          <el-option label="4小时" value="4h" />
          <el-option label="日线" value="1d" />
        </el-select>
      </div>
    </div>
    <div ref="chartRef" class="chart-container"></div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import type { ECharts, EChartsOption } from 'echarts'
import type { KLineData } from '@/apps/appx-investment/types/kline'

interface Props {
  data: KLineData[]
  symbol?: string
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  symbol: '',
  height: '400px',
})

const emit = defineEmits<{
  intervalChange: [interval: string]
}>()

const chartRef = ref<HTMLDivElement>()
const chartInstance = ref<ECharts>()
const interval = ref('1d')

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
  if (!chartInstance.value || !props.data.length) return

  const option: EChartsOption = {
    backgroundColor: '#fff',
    animation: false,
    legend: {
      bottom: 10,
      left: 'center',
      data: [props.symbol || 'K线'],
    },
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
        const data = params[0].data
        return `
          <div style="font-size: 14px; margin-bottom: 8px;">
            ${new Date(data[0]).toLocaleString()}
          </div>
          <div style="display: flex; flex-direction: column; gap: 4px;">
            <div>开盘: ${data[1]}</div>
            <div>收盘: ${data[4]}</div>
            <div>最高: ${data[2]}</div>
            <div>最低: ${data[3]}</div>
            <div>成交量: ${data[5]}</div>
          </div>
        `
      },
    },
    axisPointer: {
      link: [{ xAxisIndex: 'all' }],
      label: {
        backgroundColor: '#777',
      },
    },
    grid: [
      {
        left: '10%',
        right: '8%',
        height: '50%',
      },
      {
        left: '10%',
        right: '8%',
        top: '63%',
        height: '16%',
      },
    ],
    xAxis: [
      {
        type: 'category',
        data: props.data.map(item => item.timestamp),
        boundaryGap: false,
        axisLine: { onZero: false },
        splitLine: { show: false },
        min: 'dataMin',
        max: 'dataMax',
        axisLabel: {
          formatter: (value: number) => {
            return new Date(value).toLocaleDateString()
          },
        },
      },
      {
        type: 'category',
        gridIndex: 1,
        data: props.data.map(item => item.timestamp),
        boundaryGap: false,
        axisLine: { onZero: false },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        min: 'dataMin',
        max: 'dataMax',
      },
    ],
    yAxis: [
      {
        scale: true,
        splitArea: {
          show: true,
        },
      },
      {
        scale: true,
        gridIndex: 1,
        splitNumber: 2,
        axisLabel: { show: false },
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
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
        top: '85%',
        start: 0,
        end: 100,
      },
    ],
    series: [
      {
        name: props.symbol || 'K线',
        type: 'candlestick',
        data: props.data.map(item => [
          item.timestamp,
          item.open,
          item.close,
          item.low,
          item.high,
          item.volume,
        ]),
        itemStyle: {
          color: '#ef5350',
          color0: '#26a69a',
          borderColor: '#ef5350',
          borderColor0: '#26a69a',
        },
      },
      {
        name: '成交量',
        type: 'bar',
        xAxisIndex: 1,
        yAxisIndex: 1,
        data: props.data.map(item => item.volume),
        itemStyle: {
          color: (params: any) => {
            const item = props.data[params.dataIndex]
            return item.close >= item.open ? '#26a69a' : '#ef5350'
          },
        },
      },
    ],
  }

  chartInstance.value.setOption(option)
}

// 处理窗口大小变化
const handleResize = () => {
  chartInstance.value?.resize()
}

// 处理时间间隔变化
const handleIntervalChange = (value: string) => {
  emit('intervalChange', value)
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
watch(() => props.data, () => {
  updateChart()
}, { deep: true })
</script>

<style scoped>
.kline-chart {
  @apply border rounded-lg p-4 bg-white;
}

.chart-header {
  @apply flex justify-between items-center mb-4;
}

.chart-container {
  width: 100%;
  height: v-bind(height);
}
</style>