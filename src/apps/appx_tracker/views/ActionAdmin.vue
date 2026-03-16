<script lang="ts" setup>
import { CirclePlus, Delete, Edit, Postcard, Refresh, Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import type { UserGet } from '@/apps/appc_auth/types'
import { usersApi } from '@/apps/appc_auth/apis'
import { useUserStore } from '@/apps/appc_auth/stores/user.ts'
import type { TagGet, ActionGet, ActionAdd, ActionSet, ThingGet } from '@/apps/appx_tracker/types'
import { tagApi, actionApi, thingApi } from '@/apps/appx_tracker/apis'



const label = "行动"

const createDefaultData = () => ({
  id: '',
  description: '',
  thing_id: '',
  tags_id: [],
  users_id: [],
  dateTimeRange: ['', '']
})

// 响应式数据
const queryFormData = reactive(createDefaultData())
const addFormRef = ref<FormInstance>()
const addFormData = reactive(createDefaultData())
const setFormRef = ref<FormInstance>()
const setFormData = reactive(createDefaultData())
const detailData = reactive({
  id: '',
  description: '',
  thing: {
    id: '',
    content: ''
  },
  tags: [
    {id: '', name: ''}
  ],
  users: [
    {id: '', username: '', nickname: ''}
  ],
  start_at: '',
  end_at: '',
})
const dialogVisibleAdd = ref(false)
const dialogVisibleSet = ref(false)
const dialogVisibleDetail = ref(false)

const thingOptions = ref<ThingGet[]>([])
const tagOptions = ref<TagGet[]>([])
const userOptions = ref<UserGet[]>([])

/**
 * 表单校验规则
 */
const formRules: FormRules = {
  description: [
    { min: 1, max: 512, message: '长度在 1 到 512 个字符', trigger: 'blur' },
  ],
  thing_id: [
    { required: true, message: '请输入事件ID', trigger: 'blur' },
    { min: 1, max: 64, message: '长度在 1 到 64 个字符', trigger: 'blur' },
  ],
  tags_id: [
    { required: true, message: '请输入标签ID', trigger: 'blur' },
  ]
}

const tableData = ref<ActionGet[]>([])
const multipleSelection = ref<ActionGet[]>([])
const paginationData = reactive({
  // 当前页码
  currentPage: 1,
  // 每页大小
  size: 10,
  // 总数
  total: 0,
  // 总页数
  pages: 1,
  // 每页大小选项
  sizeOptions: [10, 20, 50, 100],
  disabled: false,
})

const shortcuts = [
  {
    text: 'Last week',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - 7)
      return [start, end]
    },
  },
  {
    text: 'Last month',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setMonth(start.getMonth() - 1)
      return [start, end]
    },
  },
  {
    text: 'Last 3 months',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setMonth(start.getMonth() - 3)
      return [start, end]
    },
  },
]

// 状态管理
const isLoading = ref(false)

const userStore = useUserStore()

// 生命周期钩子
onMounted(() => {
  initData()
})

const initData = async () => {
  await initOptionData()
  await initTableData()
}


const initOptionData = async () => {
  try {
    // 获取tag下拉选项
    let rsp_tag = await tagApi.list({})
    tagOptions.value = rsp_tag.data.items
    // 获取thing下拉选项
    let rsp_thing = await thingApi.list({})
    thingOptions.value = rsp_thing.data.items
    // 获取用户下拉选
    let rsp_user = await usersApi.list({})
    userOptions.value = rsp_user.data.items
  } catch (e) {
    console.log('init options data failed')
  }
}

/**
 * 初始化表格数据
 */
const initTableData = async () => {
  try {
    isLoading.value = true
    const rsp_action = await actionApi.list({})
    console.log(rsp_action.data)

    const page_data = rsp_action.data
    // 更新表格数据
    tableData.value = page_data.items || []
    // 更新分页数据
    paginationData.currentPage = page_data.page
    paginationData.size = page_data.size
    paginationData.total = page_data.total
    paginationData.pages = page_data.pages

  } catch (err: any) {
    ElMessage.error(err.message || `获取${label}列表失败`)
  } finally {
    isLoading.value = false
  }
}


/**
 * 点击查询
 */
const onQuery = () => {
  console.log('onQuery!')
}

/**
 * 点击重置按钮
 */
const onResetQuery = () => {
  Object.assign(queryFormData, createDefaultData())
}

/**
 * 点击添加按钮
 */
const onAdd = async () => {
  console.log('onAdd!')
  if (!addFormRef.value) return

  try {
    await addFormRef.value?.validate()
    isLoading.value = true

    const data: ActionAdd = {
      description: addFormData.description,
      thing_id: addFormData.thing_id,
      tags_id: addFormData.tags_id,
      users_id: [userStore.id],
      start_at: addFormData.dateTimeRange[0] || '',
      end_at: addFormData.dateTimeRange[1] || ''
    }
    await actionApi.add(data)
    ElMessage.success('添加成功')
    dialogVisibleAdd.value = false
    await initTableData()
  } catch (error: any) {
    if (error?.errors) {
      // 表单验证错误，不显示消息
      return
    }
    ElMessage.error(error?.message || '添加失败')
  } finally {
    isLoading.value = false
  }
}

/**
 * 点击重置按钮
 */
const closedAddForm = () => {
  Object.assign(addFormData, createDefaultData())
  addFormRef.value?.clearValidate()
}

/**
 * 查看详情
 * @param row
 */
const onDialogVisibleDetail = (row: ActionGet) => {
  console.log('onDialogVisibleDetail')
  Object.assign(detailData, row)
  dialogVisibleDetail.value = true
}

const onDialogVisibleSet = (row: ActionGet) => {
  console.log('onDialogVisibleSet')
  // Object.assign(setFormData, row)
}

// 编辑标签
const onSet = async () => {
  console.log('onSet!')
  // if (!setFormRef.value) return
  //
  // try {
  //   await setFormRef.value?.validate()
  //   isLoading.value = true
  //
  //   await tagApi.set(setFormData.id, { id: setFormData.id, name: setFormData.name })
  //   ElMessage.success('更新成功')
  //   dialogVisibleSet.value = false
  //
  //   await initTableData()
  // } catch (err: any) {
  //   if (err?.errors) {
  //     // 表单验证错误，不显示消息
  //     return
  //   }
  //   ElMessage.error(err?.message || '更新失败')
  // } finally {
  //   isLoading.value = false
  // }
}

/**
 * 点击删除按钮
 * @param row
 */
const onDel = async (row: ActionGet) => {
  console.log('onDel!')
  try {
    const msg = `确定要删除 "${row.thing.content}-${row.description}" 吗？`
    await ElMessageBox.confirm(msg, `删除确认`, {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    await actionApi.del(row.id)
    ElMessage.success('删除成功')
    await initTableData()
  } catch (err: any) {
    if (err === 'cancel') {
      // 用户取消删除
      return
    }
    ElMessage.error(err?.message || '删除失败')
  } finally {
    isLoading.value = false
  }
}

// 批量删除
const onBatchDel = async () => {
  if (multipleSelection.value.length === 0) {
    ElMessage.warning('请选择要删除的标签')
    return
  }

  try {
    const msg = multipleSelection.value.map(
      (action) => `${action.thing.content}-${action.description}`
    ).join('、')
    await ElMessageBox.confirm(
      `确定要删除选中的 ${multipleSelection.value.length} 个标签吗？\n${msg}`,
      '批量删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )

    // 逐个删除选中的标签
    for (const tag of multipleSelection.value) {
      await tagApi.del(tag.id)
    }

    ElMessage.success(`成功删除 ${multipleSelection.value.length} 个标签`)
    multipleSelection.value = []
    await initTableData()
  } catch (error: any) {
    if (error === 'cancel') {
      return
    }
    ElMessage.error(error?.message || '批量删除失败')
  }
}

const handleSelectionChange = (val: ActionGet[]) => {
  multipleSelection.value = val
  console.log(multipleSelection.value)
}
</script>

<template>
  <el-row>
    <el-col :span="24">
      <span>{{ label }}管理</span>
    </el-col>
    <el-divider />

    <!--     搜索条件-->
    <el-col :span="24">
      <div class="conditional">
        <el-form :inline="true" :model="queryFormData">
          <el-form-item label="ID" label-position="left">
            <el-input
              v-model="queryFormData.id"
              clearable
              style="width: 240px"
            />
          </el-form-item>
          <el-form-item label="行动描述" label-position="left">
            <el-input
              v-model="queryFormData.description"
              clearable
              style="width: 240px"
            />
          </el-form-item>
          <el-form-item label="事情" label-position="left">
            <el-select
              v-model="queryFormData.thing_id"
              clearable
              placeholder="选择事项"
              style="width: 240px"
            >
              <el-option
                v-for="item in thingOptions"
                :key="item.id"
                :label="item.content"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="标签" label-position="left">
            <el-select
              v-model="queryFormData.tags_id"
              clearable
              multiple
              placeholder="选择标签"
              style="width: 240px"
            >
              <el-option
                v-for="item in tagOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="用户">
            <el-select
              v-model="addFormData.users_id"
              clearable
              multiple
              placeholder="选择用户"
              style="width: 240px"
            >
              <el-option
                v-for="item in userOptions"
                :key="item.id"
                :label="item.nickname"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="开始结束" label-position="left">
            <el-date-picker
              v-model="queryFormData.dateTimeRange"
              type="datetimerange"
              :shortcuts="shortcuts"
              range-separator="To"
              start-placeholder="Start date"
              end-placeholder="End date"
              value-format="YYYY-MM-DD HH:mm:ss"
            />
          </el-form-item>
          <el-form-item>
            <el-button :icon="Search" type="primary" @click="onQuery"> 查询 </el-button>
            <el-button :icon="Refresh" @click="onResetQuery"> 重置 </el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-col>

    <el-divider />
    <!-- 操作按钮 -->
    <el-col :span="24">
      <div class="add">
        <el-row>
          <el-col :span="4">
            <el-button :icon="CirclePlus" type="primary" @click="dialogVisibleAdd = true">
              添加{{ label }}
            </el-button>
            <el-button
              :disabled="multipleSelection.length === 0"
              :icon="Delete"
              type="danger"
              @click="onBatchDel"
            >
              批量删除({{ multipleSelection.length }})
            </el-button>
          </el-col>
          <el-col :span="4">
            <el-upload
              ref="upload"
              class="upload-demo"
              action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15"
              :limit="1"
              :on-exceed="handleExceed"
              :auto-upload="false"
            >
              <template #trigger>
                <el-button type="primary">select file</el-button>
              </template>
              <el-button class="ml-3" type="success" @click="submitUpload">
                upload to server
              </el-button>
            </el-upload>
          </el-col>
        </el-row>
      </div>
    </el-col>

    <!-- 数据表格 -->
    <el-col :span="24">
      <div class="table-container">
        <el-table
          v-loading="isLoading"
          :data="tableData"
          style="width: 100%"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column label="ID" prop="id" width="350" />
          <el-table-column label="开始时间" min-width="60" prop="start_at" />
          <el-table-column label="结束时间" min-width="60" prop="end_at" />
          <el-table-column label="事件" min-width="40" >
            <template #default="scope">
              {{ scope.row.thing?.content || '暂无' }}
            </template>
          </el-table-column>
          <el-table-column label="描述" min-width="100" prop="description" />
          <el-table-column label="标签" min-width="50" prop="tags">
            <template #default="scope">
              <div v-if="scope.row.tags && scope.row.tags.length">
                <el-tag
                  v-for="tag in scope.row.tags"
                  :key="tag.id"
                  size="small"
                  style="margin-right: 4px; margin-bottom: 4px"
                >
                  {{ tag.name }}
                </el-tag>
              </div>
              <span v-else>无标签</span>
            </template>
          </el-table-column>
          <el-table-column label="用户" min-width="30" prop="users">
            <template #default="scope">
              <div v-if="scope.row.users && scope.row.users.length">
                <el-tag
                  v-for="user in scope.row.users"
                  :key="user.id"
                  size="small"
                  style="margin-right: 4px; margin-bottom: 4px"
                >
                  {{ user.nickname || user.username }}
                </el-tag>
              </div>
              <span v-else>无用户</span>
            </template>
          </el-table-column>

          <el-table-column fixed="right" label="操作" min-width="100">
            <template #default="scope">
              <el-button :icon="Postcard" type="success" @click="onDialogVisibleDetail(scope.row)">
                详情
              </el-button>
              <el-button :icon="Edit" type="primary" @click="onDialogVisibleSet(scope.row)">
                编辑
              </el-button>
              <el-button :icon="Delete" type="danger" @click="onDel(scope.row)"> 删除 </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-col>

    <!-- 分页 -->
    <el-col :span="24">
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="paginationData.currentPage"
          v-model:page-size="paginationData.size"
          :disabled="paginationData.disabled"
          :page-sizes="paginationData.sizeOptions"
          :total="paginationData.total"
          background
          layout="total, sizes, prev, pager, next, jumper"
        />
      </div>
    </el-col>
  </el-row>

  <!--   添加对话框 -->
  <el-dialog
    v-model="dialogVisibleAdd"
    draggable
    title="新增"
    width="600px"
    @closed="closedAddForm"
  >
    <el-form ref="addFormRef" :model="addFormData" :rules="formRules" label-width="80px">

      <el-form-item label="事情">
        <el-select
          v-model="addFormData.thing_id"
          clearable
          placeholder="选择事项"
          style="width: 450px"
        >
          <el-option
            v-for="item in thingOptions"
            :key="item.id"
            :label="item.content"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="行动描述" prop="description">
        <el-input
          v-model="addFormData.description"
          type="textarea"
          clearable
          maxlength="512"
          placeholder="请输入标签名称"
          show-word-limit
          style="width: 450px"
        />
      </el-form-item>
      <el-form-item label="标签">
        <el-select
          v-model="addFormData.tags_id"
          clearable
          multiple
          placeholder="选择标签"
          style="width: 450px"
        >
          <el-option
            v-for="item in tagOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="用户">
        <el-select
          v-model="addFormData.users_id"
          clearable
          multiple
          placeholder="选择用户"
          style="width: 450px"
        >
          <el-option
            v-for="item in userOptions"
            :key="item.id"
            :label="item.nickname"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="开始结束">
        <div style="width: 450px">
          <el-date-picker
            v-model="addFormData.dateTimeRange"
            type="datetimerange"
            range-separator="To"
            :shortcuts="shortcuts"
            start-placeholder="Start date"
            end-placeholder="End date"
            style="width: 450px"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </div>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisibleAdd = false"> 取消</el-button>
        <el-button :loading="isLoading" type="primary" @click="onAdd"> 确认</el-button>
      </div>
    </template>
  </el-dialog>

  <!--  TableData 详情操作  -->
  <el-dialog v-model="dialogVisibleDetail" draggable title="详情操作" width="500">
    <el-descriptions>
      <el-descriptions-item label="ID">{{ detailData.id }}</el-descriptions-item>
      <el-descriptions-item label="描述">{{ detailData.description }}</el-descriptions-item>
      <el-descriptions-item label="事情">{{ detailData.thing.content }}</el-descriptions-item>
      <el-descriptions-item label="标签">
        {{ detailData.tags }}
      </el-descriptions-item>
      <el-descriptions-item label="用户">{{ detailData.users }}</el-descriptions-item>
      <el-descriptions-item label="开始时间">{{ detailData.start_at }}</el-descriptions-item>
      <el-descriptions-item label="结束时间">{{ detailData.end_at }}</el-descriptions-item>
    </el-descriptions>
  </el-dialog>

  <!--  TableData 编辑操作  -->
  <el-dialog v-model="dialogVisibleSet" draggable title="Tips" width="500">
    <el-form ref="setFormRef" :model="setFormData" :rules="formRules">
      <el-form-item label="事件名称" label-position="left" prop="name">
        <el-input v-model="setFormData.description" clearable placeholder="输入事件名称" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisibleSet = false"> 取消</el-button>
        <el-button type="primary" @click="onSet"> 确认</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.conditional {
  margin-bottom: 20px;
}

.table-container {
  margin-bottom: 20px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

:deep(.el-table) {
  margin-top: 10px;
}

:deep(.el-form--inline .el-form-item) {
  margin-right: 20px;
  margin-bottom: 10px;
}
</style>
