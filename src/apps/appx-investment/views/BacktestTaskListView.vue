<template>
  <div class="backtest-task-list-view">
    <div class="page-header mb-6">
      <h1 class="text-2xl font-bold">回测任务管理</h1>
      <p class="text-gray-600 mt-2">查看和管理所有回测任务，支持筛选、搜索和分页</p>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <BacktestTaskList
        :tasks="backtestTasks"
        :loading="isLoadingTasks"
        :total="pagination.total"
        :page="pagination.page"
        :size="pagination.size"
        @page-change="handlePageChange"
        @size-change="handleSizeChange"
        @task-click="handleTaskClick"
        @create-task="handleCreateTask"
      />
    </div>

    <!-- 新建任务对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="新建回测任务"
      width="500px"
      :before-close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
        label-position="left"
      >
        <el-form-item label="任务名称" prop="name">
          <el-input
            v-model="formData.name"
            placeholder="请输入任务名称"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="标的代码" prop="symbol">
          <el-input
            v-model="formData.symbol"
            placeholder="请输入标的代码，如：000001.SZ"
          />
        </el-form-item>
        <el-form-item label="策略选择" prop="strategy">
          <el-select
            v-model="formData.strategy"
            placeholder="请选择策略"
            style="width: 100%"
          >
            <el-option label="均线策略" value="ma_strategy" />
            <el-option label="动量策略" value="momentum_strategy" />
            <el-option label="均值回归" value="mean_reversion" />
            <el-option label="布林带策略" value="bollinger_bands" />
          </el-select>
        </el-form-item>
        <el-form-item label="回测周期" required>
          <el-col :span="11">
            <el-form-item prop="startTime">
              <el-date-picker
                v-model="formData.startTime"
                type="datetime"
                placeholder="开始时间"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="2" class="text-center">-</el-col>
          <el-col :span="11">
            <el-form-item prop="endTime">
              <el-date-picker
                v-model="formData.endTime"
                type="datetime"
                placeholder="结束时间"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-form-item>
        <el-form-item label="初始资金" prop="initialCapital">
          <el-input-number
            v-model="formData.initialCapital"
            :min="1000"
            :max="10000000"
            :step="1000"
            style="width: 100%"
          />
          <span class="ml-2 text-gray-500">元</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="isSubmitting" @click="handleSubmit">
            确认创建
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { useInvestmentStore } from '@/apps/appx-investment/stores'
import BacktestTaskList from '@/apps/appx-investment/components/BacktestTaskList.vue'

const router = useRouter()
const investmentStore = useInvestmentStore()

// Store 数据
const backtestTasks = computed(() => investmentStore.backtestTasks)
const isLoadingTasks = computed(() => investmentStore.isLoadingTasks)
const pagination = computed(() => investmentStore.pagination)

// 对话框状态
const dialogVisible = ref(false)
const isSubmitting = ref(false)
const formRef = ref<FormInstance>()

// 表单数据
const formData = ref({
  name: '',
  symbol: '',
  strategy: 'ma_strategy',
  startTime: '',
  endTime: '',
  initialCapital: 100000,
})

// 表单验证规则
const formRules: FormRules = {
  name: [
    { required: true, message: '请输入任务名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' },
  ],
  symbol: [
    { required: true, message: '请输入标的代码', trigger: 'blur' },
    { pattern: /^[0-9]{6}\.[A-Z]{2}$/, message: '格式如：000001.SZ', trigger: 'blur' },
  ],
  strategy: [
    { required: true, message: '请选择策略', trigger: 'change' },
  ],
  startTime: [
    { required: true, message: '请选择开始时间', trigger: 'change' },
  ],
  endTime: [
    { required: true, message: '请选择结束时间', trigger: 'change' },
    {
      validator: (rule, value, callback) => {
        if (!value || !formData.value.startTime) {
          callback()
          return
        }
        if (new Date(value) <= new Date(formData.value.startTime)) {
          callback(new Error('结束时间必须晚于开始时间'))
        } else {
          callback()
        }
      },
      trigger: 'change',
    },
  ],
  initialCapital: [
    { required: true, message: '请输入初始资金', trigger: 'blur' },
    { type: 'number', min: 1000, message: '最小金额为1000元', trigger: 'blur' },
  ],
}

// 生命周期
onMounted(() => {
  fetchTasks()
})

// 方法
const fetchTasks = () => {
  investmentStore.fetchBacktestTasks()
}

const handlePageChange = (page: number) => {
  investmentStore.fetchBacktestTasks({ page })
}

const handleSizeChange = (size: number) => {
  investmentStore.fetchBacktestTasks({ size })
}

const handleTaskClick = (task: any) => {
  // 跳转到报告详情页
  router.push({ name: 'BacktestReport', params: { taskId: task.id } })
}

const handleCreateTask = () => {
  // 重置表单数据
  formData.value = {
    name: '',
    symbol: '',
    strategy: 'ma_strategy',
    startTime: '',
    endTime: '',
    initialCapital: 100000,
  }

  // 清除表单验证
  if (formRef.value) {
    formRef.value.clearValidate()
  }

  dialogVisible.value = true
}

const handleDialogClose = (done: () => void) => {
  if (isSubmitting.value) {
    return
  }

  ElMessageBox.confirm('确定要关闭吗？未保存的更改将会丢失。', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      done()
    })
    .catch(() => {
      // 用户取消关闭
    })
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    // 表单验证
    await formRef.value.validate()

    isSubmitting.value = true

    // TODO: 调用API创建任务
    // await backtestApi.createTask(formData.value)

    ElMessage.success('任务创建成功')
    dialogVisible.value = false

    // 刷新任务列表
    await fetchTasks()
  } catch (error: any) {
    if (error?.errors) {
      // 表单验证错误，不显示消息
      return
    }
    ElMessage.error(error?.message || '任务创建失败')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
@reference "tailwindcss";

.backtest-task-list-view {
  @apply p-6;
}

.page-header {
  @apply border-b pb-4;
}

.main-content {
  @apply mt-6;
}
</style>