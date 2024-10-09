<script lang="ts" setup>
import { Dayjs } from 'dayjs'
import { reactive, ref, toRaw } from 'vue'
import type { UnwrapRef } from 'vue'
import type { Rule } from 'ant-design-vue/es/form'
import { theme } from 'ant-design-vue'
import { useApplicationStore } from '@/stores/application'
import { storeToRefs } from 'pinia'

interface FormState {
  name: string;
  region: string | undefined;
  date1: Dayjs | undefined;
  delivery: boolean;
  type: string[];
  resource: string;
  desc: string;
}

const colorList = [
  {
    key: '薄暮', color: '#F5222D'
  },
  {
    key: '火山', color: '#FA541C'
  },
  {
    key: '日暮', color: '#FAAD14'
  },
  {
    key: '明青', color: '#13C2C2'
  },
  {
    key: '极光绿', color: '#52C41A'
  },
  {
    key: '拂晓蓝（默认）', color: '#1890FF'
  },
  {
    key: '极客蓝', color: '#2F54EB'
  },
  {
    key: '酱紫', color: '#722ED1'
  }
]
const applicationStore = useApplicationStore()
const { darkMode } = storeToRefs(applicationStore)

const primaryColor = ref('#00b96b')
const formRef = ref()
const labelCol = { span: 5 }
const wrapperCol = { span: 13 }
const formState: UnwrapRef<FormState> = reactive({
  name: '',
  region: undefined,
  date1: undefined,
  delivery: false,
  type: [],
  resource: '',
  desc: ''
})
const rules: Record<string, Rule[]> = {
  primaryColor: [{ required: true, message: 'Please set primary color' }],
  name: [
    { required: true, message: 'Please input Activity name', trigger: 'change' },
    { min: 3, max: 5, message: 'Length should be 3 to 5', trigger: 'blur' }
  ],
  region: [{ required: true, message: 'Please select Activity zone', trigger: 'change' }],
  date1: [{ required: true, message: 'Please pick a date', trigger: 'change', type: 'object' }],
  type: [
    {
      type: 'array',
      required: true,
      message: 'Please select at least one activity type',
      trigger: 'change'
    }
  ],
  resource: [{ required: true, message: 'Please select activity resource', trigger: 'change' }],
  desc: [{ required: true, message: 'Please input activity form', trigger: 'blur' }]
}
const onSubmit = () => {
  formRef.value
    .validate()
    .then(() => {
      console.log('values', formState, toRaw(formState))
    })
    .catch((error: any) => {
      console.log('error', error)
    })
}
const changeTheme = (color: string) => {
  primaryColor.value = color
}
const resetForm = () => {
  formRef.value.resetFields()
}
</script>

<template>
  <a-config-provider
    :theme="{
      algorithm: darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
      token: {
        colorPrimary: primaryColor,
      },
    }"
  >
    <a-form
      ref="formRef"
      :model="formState"
      :rules="rules"
      :label-col="labelCol"
      :wrapper-col="wrapperCol"
    >
      <a-form-item label="dark mode">
        <a-switch v-model:checked="darkMode" />
      </a-form-item>
      <a-form-item label="primaryColor" name="primaryColor">
        <a-space>
          <div class="colorSpan" v-for="colorItem in colorList" :key="colorItem.key"
               @click="changeTheme(colorItem.color)" :style="{backgroundColor: colorItem.color}"></div>
        </a-space>
      </a-form-item>
      <a-form-item ref="name" label="Activity name" name="name">
        <a-input v-model:value="formState.name" />
      </a-form-item>
      <a-form-item label="Activity zone" name="region">
        <a-select v-model:value="formState.region" placeholder="please select your zone">
          <a-select-option value="shanghai">Zone one</a-select-option>
          <a-select-option value="beijing">Zone two</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="Activity time" required name="date1">
        <a-date-picker
          v-model:value="formState.date1"
          show-time
          type="date"
          placeholder="Pick a date"
          style="width: 100%"
        />
      </a-form-item>
      <a-form-item label="Instant delivery" name="delivery">
        <a-switch v-model:checked="formState.delivery" />
      </a-form-item>
      <a-form-item label="Activity type" name="type">
        <a-checkbox-group v-model:value="formState.type">
          <a-checkbox value="1" name="type">Online</a-checkbox>
          <a-checkbox value="2" name="type">Promotion</a-checkbox>
          <a-checkbox value="3" name="type">Offline</a-checkbox>
        </a-checkbox-group>
      </a-form-item>
      <a-form-item label="Resources" name="resource">
        <a-radio-group v-model:value="formState.resource">
          <a-radio value="1">Sponsor</a-radio>
          <a-radio value="2">Venue</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="Activity form" name="desc">
        <a-textarea v-model:value="formState.desc" />
      </a-form-item>
      <a-form-item :wrapper-col="{ span: 14, offset: 4 }">
        <a-button type="primary" @click="onSubmit">Create</a-button>
        <a-button style="margin-left: 10px" @click="resetForm">Reset</a-button>
      </a-form-item>
    </a-form>
  </a-config-provider>
</template>

<style scoped>
.colorSpan {
  cursor: pointer;
  width: 20px;
  height: 20px;
}
</style>