<script lang="ts" setup>
import Form from '@/components/ui/Form.vue'
import type {FormConfig, FormScope} from '@/components/types/form.ts'

const formConfig: FormConfig = {
  labelWidth: '120px',
  formOptions: [
    {
      type: 'input',
      value: '',
      label: '用户名',
      placeholder: '请输入用户名',
      prop: 'username',
      rules: [
        {required: true, message: '请输入用户名', trigger: 'blur'},
        {min: 5, max: 20, message: '用户名长度应在 5 到 20 个字符之间', trigger: 'blur'},
        {
          pattern: /^[a-zA-Z0-9_-]+$/,
          message: '用户名只能包含字母、数字、下划线和连字符',
          trigger: 'blur',
        },
      ],
      attrs: {
        clearable: true
      }
    },
    {
      type: 'input-password',
      value: '',
      label: '密码',
      prop: 'password',
      placeholder: '请输入密码',
      rules: [
        {required: true, message: '请输入密码', trigger: 'blur'},
        {min: 6, max: 20, message: '密码长度应在 6 到 20 个字符之间', trigger: 'blur'},
        {
          pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
          message: '密码必须包含大小写字母和数字',
          trigger: 'blur',
        },
      ],
      attrs: {
        showPassword: true,
        clearable: true
      }
    },
    {
      type: 'select',
      value: '',
      label: '职位',
      placeholder: '请选择职位',
      prop: 'role',
      rules: [
        {required: true, message: '职位不能为空', trigger: 'blur'},
      ],
      attrs: {
        style: {
          width: '100%'
        }
      },
      children: [
        {
          type: 'option',
          value: 'A',
          label: 'A',
        },
        {
          type: 'option',
          value: 'B',
          label: 'B',
        }
      ]
    },
    {
      type: 'switch',
      value: false,
      prop: 'delivery',
      label: '启用'
    },
    {
      type: 'checkbox-group',
      value: [],
      prop: 'like',
      label: '爱好',
      children: [
        {
          type: 'checkbox',
          label: '足球',
          value: '足球',
        },
        {
          type: 'checkbox',
          label: '篮球',
          value: '篮球',
        },
        {
          type: 'checkbox',
          label: '羽毛球',
          value: '羽毛球',
        },
        {
          type: 'checkbox',
          label: '网球',
          value: '网球',
        },
      ]
    },
    {
      type: 'radio-group',
      value: '',
      prop: 'gender',
      label: '性别',
      rules: [
        {required: true, message: '不能为空', trigger: 'blur'},
      ],
      children: [
        {
          type: 'radio',
          label: '男性',
          value: '男性',
        },
        {
          type: 'radio',
          label: '女性',
          value: '女性',
        },
      ]
    },
  ],
}


const submitForm = (scope: FormScope) => {

}

const resetForm = (scope: FormScope) => {
  scope.form.resetFields()
}


</script>

<template>
  <Form v-bind="formConfig">
    <template #action="scope">
      <el-form-item>
        <el-button type="primary" @click="submitForm">提交</el-button>
        <el-button @click="resetForm">重置</el-button>
      </el-form-item>
    </template>
  </Form>

  <Table :data="tableData" :options="tableOptions">
    <template #date="{scope}">
      <div style="display: flex; align-items: center">
        <el-icon>
          <IEpTimer/>
        </el-icon>
        <span style="margin-left: 10px">{{ scope.row.date }}</span>
      </div>
    </template>
    <template #action="{scope}">
      <el-button type="primary" @click="submitForm(scope)">编辑</el-button>
      <el-button type="primary" @click="submitForm(scope)">删除</el-button>
    </template>
  </Table>
</template>

<style scoped>

</style>
