<template>
  <el-dialog
    v-model="visible"
    :title="title"
    :width="width"
    :fullscreen="fullscreen"
    :draggable="draggable"
    :close-on-click-modal="closeOnClickModal"
    :close-on-press-escape="closeOnPressEscape"
    :show-close="showClose"
    :before-close="handleBeforeClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      :label-width="labelWidth"
      :label-position="labelPosition"
      :disabled="disabled"
      @submit.prevent
    >
      <el-row :gutter="gutter">
        <template v-for="field in fields" :key="field.prop">
          <el-col :span="field.span || 24">
            <el-form-item
              :label="field.label"
              :prop="field.prop"
              :required="field.required"
            >
              <!-- 输入框 -->
              <el-input
                v-if="field.type === 'input'"
                v-model="formData[field.prop]"
                :placeholder="field.placeholder || `请输入${field.label}`"
                :type="field.inputType || 'text'"
                :maxlength="field.maxlength"
                :show-word-limit="field.showWordLimit"
                :clearable="field.clearable !== false"
                :disabled="field.disabled"
                :readonly="field.readonly"
                :prefix-icon="field.prefixIcon"
                :suffix-icon="field.suffixIcon"
                @blur="handleFieldBlur(field)"
                @change="handleFieldChange(field, $event)"
              />

              <!-- 文本域 -->
              <el-input
                v-else-if="field.type === 'textarea'"
                v-model="formData[field.prop]"
                type="textarea"
                :placeholder="field.placeholder || `请输入${field.label}`"
                :rows="field.rows || 4"
                :maxlength="field.maxlength"
                :show-word-limit="field.showWordLimit"
                :autosize="field.autosize"
                :disabled="field.disabled"
                :readonly="field.readonly"
                @blur="handleFieldBlur(field)"
                @change="handleFieldChange(field, $event)"
              />

              <!-- 数字输入框 -->
              <el-input-number
                v-else-if="field.type === 'number'"
                v-model="formData[field.prop]"
                :placeholder="field.placeholder || `请输入${field.label}`"
                :min="field.min"
                :max="field.max"
                :step="field.step || 1"
                :precision="field.precision"
                :controls="field.controls !== false"
                :controls-position="field.controlsPosition"
                :disabled="field.disabled"
                @change="handleFieldChange(field, $event)"
              />

              <!-- 选择器 -->
              <el-select
                v-else-if="field.type === 'select'"
                v-model="formData[field.prop]"
                :placeholder="field.placeholder || `请选择${field.label}`"
                :multiple="field.multiple"
                :clearable="field.clearable !== false"
                :filterable="field.filterable"
                :remote="field.remote"
                :remote-method="field.remoteMethod"
                :loading="field.loading"
                :disabled="field.disabled"
                @change="handleFieldChange(field, $event)"
                @visible-change="handleSelectVisibleChange(field, $event)"
              >
                <el-option
                  v-for="option in getFieldOptions(field)"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                  :disabled="option.disabled"
                >
                  <slot
                    v-if="field.optionSlot"
                    :name="`option-${field.prop}`"
                    :option="option"
                  >
                    {{ option.label }}
                  </slot>
                </el-option>
              </el-select>

              <!-- 单选框组 -->
              <el-radio-group
                v-else-if="field.type === 'radio'"
                v-model="formData[field.prop]"
                :disabled="field.disabled"
                @change="handleFieldChange(field, $event)"
              >
                <el-radio
                  v-for="option in getFieldOptions(field)"
                  :key="option.value"
                  :label="option.value"
                  :disabled="option.disabled"
                >
                  {{ option.label }}
                </el-radio>
              </el-radio-group>

              <!-- 复选框组 -->
              <el-checkbox-group
                v-else-if="field.type === 'checkbox'"
                v-model="formData[field.prop]"
                :disabled="field.disabled"
                @change="handleFieldChange(field, $event)"
              >
                <el-checkbox
                  v-for="option in getFieldOptions(field)"
                  :key="option.value"
                  :label="option.value"
                  :disabled="option.disabled"
                >
                  {{ option.label }}
                </el-checkbox>
              </el-checkbox-group>

              <!-- 日期选择器 -->
              <el-date-picker
                v-else-if="field.type === 'date'"
                v-model="formData[field.prop]"
                :type="field.dateType || 'date'"
                :placeholder="field.placeholder || `请选择${field.label}`"
                :format="field.format"
                :value-format="field.valueFormat"
                :clearable="field.clearable !== false"
                :disabled="field.disabled"
                @change="handleFieldChange(field, $event)"
              />

              <!-- 时间选择器 -->
              <el-time-picker
                v-else-if="field.type === 'time'"
                v-model="formData[field.prop]"
                :placeholder="field.placeholder || `请选择${field.label}`"
                :format="field.format"
                :value-format="field.valueFormat"
                :clearable="field.clearable !== false"
                :disabled="field.disabled"
                @change="handleFieldChange(field, $event)"
              />

              <!-- 开关 -->
              <el-switch
                v-else-if="field.type === 'switch'"
                v-model="formData[field.prop]"
                :active-text="field.activeText"
                :inactive-text="field.inactiveText"
                :active-value="field.activeValue"
                :inactive-value="field.inactiveValue"
                :disabled="field.disabled"
                @change="handleFieldChange(field, $event)"
              />

              <!-- 滑块 -->
              <el-slider
                v-else-if="field.type === 'slider'"
                v-model="formData[field.prop]"
                :min="field.min"
                :max="field.max"
                :step="field.step || 1"
                :marks="field.marks"
                :disabled="field.disabled"
                @change="handleFieldChange(field, $event)"
              />

              <!-- 评分 -->
              <el-rate
                v-else-if="field.type === 'rate'"
                v-model="formData[field.prop]"
                :max="field.max || 5"
                :disabled="field.disabled"
                @change="handleFieldChange(field, $event)"
              />

              <!-- 颜色选择器 -->
              <el-color-picker
                v-else-if="field.type === 'color'"
                v-model="formData[field.prop]"
                :show-alpha="field.showAlpha"
                :predefine="field.predefine"
                :disabled="field.disabled"
                @change="handleFieldChange(field, $event)"
              />

              <!-- 上传组件 -->
              <el-upload
                v-else-if="field.type === 'upload'"
                v-bind="getUploadProps(field)"
                :on-success="(response, file) => handleUploadSuccess(field, response, file)"
                :on-remove="(file) => handleUploadRemove(field, file)"
              >
                <el-button type="primary">
                  <el-icon><Upload /></el-icon>
                  点击上传
                </el-button>
                <template #tip>
                  <div class="el-upload__tip">
                    {{ field.tip }}
                  </div>
                </template>
              </el-upload>

              <!-- 富文本编辑器 -->
              <div v-else-if="field.type === 'editor'" class="editor-container">
                <!-- 这里可以集成富文本编辑器，如 tinymce, quill 等 -->
                <el-input
                  v-model="formData[field.prop]"
                  type="textarea"
                  :rows="8"
                  placeholder="富文本内容"
                />
              </div>

              <!-- 自定义插槽 -->
              <slot
                v-else-if="field.slot"
                :name="`field-${field.prop}`"
                :field="field"
                :value="formData[field.prop]"
                :onChange="(value) => handleFieldValueChange(field, value)"
              />

              <!-- 只读显示 -->
              <span v-else-if="field.readonly">
                {{ formatDisplayValue(formData[field.prop], field) }}
              </span>
            </el-form-item>
          </el-col>
        </template>
      </el-row>
    </el-form>

    <template #footer v-if="showFooter">
      <el-button @click="handleCancel">取消</el-button>
      <el-button
        type="primary"
        :loading="loading"
        @click="handleConfirm"
      >
        {{ confirmText }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Upload } from '@element-plus/icons-vue'
import type { FormInstance, FormRules, UploadProps } from 'element-plus'

// 定义字段类型
interface FormField {
  prop: string
  label: string
  type: 'input' | 'textarea' | 'number' | 'select' | 'radio' | 'checkbox' |
        'date' | 'time' | 'switch' | 'slider' | 'rate' | 'color' | 'upload' | 'editor' | 'slot'
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  span?: number

  // 通用属性
  placeholder?: string
  clearable?: boolean
  options?: Array<{ label: string; value: any; disabled?: boolean }>
  optionSlot?: boolean

  // 输入框特定
  inputType?: string
  maxlength?: number
  showWordLimit?: boolean
  prefixIcon?: any
  suffixIcon?: any

  // 文本域特定
  rows?: number
  autosize?: boolean | { minRows?: number; maxRows?: number }

  // 数字输入框特定
  min?: number
  max?: number
  step?: number
  precision?: number
  controls?: boolean
  controlsPosition?: 'right' | 'left'

  // 选择器特定
  multiple?: boolean
  filterable?: boolean
  remote?: boolean
  remoteMethod?: (query: string) => void
  loading?: boolean

  // 日期时间特定
  dateType?: 'year' | 'month' | 'date' | 'dates' | 'week' | 'datetime' | 'datetimerange' | 'daterange'
  format?: string
  valueFormat?: string

  // 开关特定
  activeText?: string
  inactiveText?: string
  activeValue?: any
  inactiveValue?: any

  // 滑块特定
  marks?: Record<number, string>

  // 评分特定
  max?: number

  // 颜色选择器特定
  showAlpha?: boolean
  predefine?: string[]

  // 上传特定
  action?: string
  accept?: string
  limit?: number
  fileSize?: number
  fileType?: string[]
  listType?: 'text' | 'picture' | 'picture-card'
  tip?: string

  // 验证规则
  rules?: any[]

  // 事件
  onChange?: (value: any) => void
  onBlur?: () => void
}

const props = defineProps({
  // 对话框属性
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '表单'
  },
  width: {
    type: String,
    default: '600px'
  },
  fullscreen: {
    type: Boolean,
    default: false
  },
  draggable: {
    type: Boolean,
    default: true
  },
  closeOnClickModal: {
    type: Boolean,
    default: false
  },
  closeOnPressEscape: {
    type: Boolean,
    default: true
  },
  showClose: {
    type: Boolean,
    default: true
  },
  showFooter: {
    type: Boolean,
    default: true
  },

  // 表单属性
  fields: {
    type: Array as () => FormField[],
    required: true
  },
  formData: {
    type: Object as () => Record<string, any>,
    default: () => ({})
  },
  formRules: {
    type: Object as () => FormRules,
    default: () => ({})
  },
  labelWidth: {
    type: String,
    default: '120px'
  },
  labelPosition: {
    type: String as () => 'left' | 'right' | 'top',
    default: 'right'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  gutter: {
    type: Number,
    default: 20
  },

  // 确认按钮
  confirmText: {
    type: String,
    default: '确定'
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'update:modelValue',
  'confirm',
  'cancel',
  'field-change'
])

// 表单引用
const formRef = ref<FormInstance>()

// 对话框可见性
const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 初始化表单数据
const initFormData = () => {
  const data: Record<string, any> = {}
  props.fields.forEach(field => {
    if (field.type === 'checkbox') {
      data[field.prop] = []
    } else if (field.type === 'switch') {
      data[field.prop] = field.inactiveValue || false
    } else {
      data[field.prop] = ''
    }
  })
  Object.assign(data, props.formData)
  return data
}

// 内部表单数据
const internalFormData = ref(initFormData())

// 监听外部数据变化
watch(
  () => props.formData,
  (newVal) => {
    Object.assign(internalFormData.value, newVal)
  },
  { deep: true }
)

// 获取字段选项
const getFieldOptions = (field: FormField) => {
  if (typeof field.options === 'function') {
    return field.options()
  }
  return field.options || []
}

// 获取上传属性
const getUploadProps = (field: FormField): Partial<UploadProps> => {
  return {
    action: field.action,
    accept: field.accept,
    limit: field.limit,
    listType: field.listType,
    beforeUpload: (file) => {
      // 文件大小检查
      if (field.fileSize && file.size > field.fileSize * 1024 * 1024) {
        ElMessage.error(`文件大小不能超过 ${field.fileSize}MB`)
        return false
      }

      // 文件类型检查
      if (field.fileType && field.fileType.length > 0) {
        const ext = file.name.split('.').pop()?.toLowerCase()
        if (!ext || !field.fileType.includes(ext)) {
          ElMessage.error(`文件类型只能是 ${field.fileType.join('、')}`)
          return false
        }
      }

      return true
    }
  }
}

// 处理字段值变化
const handleFieldValueChange = (field: FormField, value: any) => {
  internalFormData.value[field.prop] = value
  emit('field-change', field.prop, value)
  field.onChange?.(value)
}

// 处理字段变化
const handleFieldChange = (field: FormField, value: any) => {
  handleFieldValueChange(field, value)
}

// 处理字段失焦
const handleFieldBlur = (field: FormField) => {
  field.onBlur?.()
}

// 处理选择器可见性变化
const handleSelectVisibleChange = (field: FormField, visible: boolean) => {
  if (visible && field.remote && field.remoteMethod) {
    field.remoteMethod('')
  }
}

// 处理上传成功
const handleUploadSuccess = (field: FormField, response: any, file: any) => {
  // 这里根据实际响应格式处理
  const url = response?.data?.url || response?.url
  if (url) {
    handleFieldValueChange(field, url)
  }
}

// 处理移除上传文件
const handleUploadRemove = (field: FormField, file: any) => {
  handleFieldValueChange(field, '')
}

// 格式化显示值
const formatDisplayValue = (value: any, field: FormField) => {
  if (field.type === 'select' && field.options) {
    const option = field.options.find(opt => opt.value === value)
    return option?.label || value
  }

  if (field.type === 'date' && value) {
    return new Date(value).toLocaleString()
  }

  return value
}

// 处理确认
const handleConfirm = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    emit('confirm', internalFormData.value)
  } catch (error) {
    ElMessage.error('请检查表单填写是否正确')
  }
}

// 处理取消
const handleCancel = () => {
  visible.value = false
  emit('cancel')
}

// 处理关闭前
const handleBeforeClose = (done: () => void) => {
  if (props.loading) return
  done()
}

// 重置表单
const resetForm = () => {
  formRef.value?.resetFields()
  internalFormData.value = initFormData()
}

// 验证表单
const validate = () => {
  return formRef.value?.validate()
}

// 清除验证
const clearValidate = () => {
  formRef.value?.clearValidate()
}

// 暴露方法
defineExpose({
  resetForm,
  validate,
  clearValidate,
  formData: internalFormData
})
</script>

<style lang="scss" scoped>
.editor-container {
  width: 100%;
}

:deep(.el-form-item__content) {
  .el-upload {
    width: 100%;

    .el-upload-dragger {
      width: 100%;
    }
  }
}
</style>