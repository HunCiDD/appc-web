<script lang="ts" setup>
import {onMounted, reactive, ref} from 'vue'
import {formatDate, todayEndDate, todayStartDate} from '@/utils/date.ts'
import type {Action} from '@/apps/appx-tracker/types.ts'
import {listActions} from '@/apps/appx-tracker/apis'

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
    {prop: 'date', label: '日期'},
    {prop: 'week', label: '星期'},
    {prop: 'type', label: '类型'},
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
    slots.push({prop: timeStr, label: timeStr})

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
            <el-option :value="5" label="5分钟"/>
            <el-option :value="10" label="10分钟"/>
            <el-option :value="15" label="15分钟"/>
            <el-option :value="30" label="30分钟"/>
            <el-option :value="60" label="60分钟"/>
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
