<template>
  <div class="data-table">
    <!-- 搜索区域 -->
    <div class="search-section" v-if="showSearch">
      <el-form ref="searchFormRef" :model="searchForm" inline>
        <template v-for="field in searchFields" :key="field.prop">
          <el-form-item :label="field.label" :prop="field.prop">
            <!-- 输入框 -->
            <el-input
              v-if="field.type === 'input'"
              v-model="searchForm[field.prop]"
              :placeholder="field.placeholder || `请输入${field.label}`"
              clearable
              @keyup.enter="handleSearch"
            />

            <!-- 选择器 -->
            <el-select
              v-else-if="field.type === 'select'"
              v-model="searchForm[field.prop]"
              :placeholder="field.placeholder || `请选择${field.label}`"
              clearable
            >
              <el-option
                v-for="option in field.options"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>

            <!-- 日期选择器 -->
            <el-date-picker
              v-else-if="field.type === 'date'"
              v-model="searchForm[field.prop]"
              type="daterange"
              :placeholder="field.placeholder || '选择日期范围'"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />

            <!-- 数字输入框 -->
            <el-input-number
              v-else-if="field.type === 'number'"
              v-model="searchForm[field.prop]"
              :placeholder="field.placeholder || `请输入${field.label}`"
              :min="field.min"
              :max="field.max"
            />
          </el-form-item>
        </template>

        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
          <el-button v-if="showAdvancedSearch" text @click="showAdvanced = !showAdvanced">
            {{ showAdvanced ? '收起' : '高级搜索' }}
            <el-icon class="ml-1">
              <ArrowDown v-if="!showAdvanced" />
              <ArrowUp v-else />
            </el-icon>
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 高级搜索区域 -->
      <div v-if="showAdvancedSearch && showAdvanced" class="advanced-search mt-4">
        <el-form ref="advancedFormRef" :model="advancedForm" inline>
          <template v-for="field in advancedFields" :key="field.prop">
            <el-form-item :label="field.label" :prop="field.prop">
              <!-- 支持所有基础搜索的字段类型 -->
              <component
                :is="getFieldComponent(field.type)"
                v-model="advancedForm[field.prop]"
                v-bind="getFieldProps(field)"
              />
            </el-form-item>
          </template>
        </el-form>
      </div>
    </div>

    <!-- 操作按钮区域 -->
    <div class="action-section" v-if="actions.length > 0">
      <el-button
        v-for="action in actions"
        :key="action.key"
        :type="action.type || 'default'"
        :disabled="action.disabled"
        @click="action.handler"
      >
        <el-icon v-if="action.icon">
          <component :is="action.icon" />
        </el-icon>
        {{ action.label }}
      </el-button>
    </div>

    <!-- 表格主体 -->
    <el-table
      v-loading="loading"
      :data="data"
      :stripe="stripe"
      :border="border"
      :height="height"
      :max-height="maxHeight"
      @selection-change="handleSelectionChange"
    >
      <!-- 选择列 -->
      <el-table-column
        v-if="showSelection"
        type="selection"
        width="55"
        align="center"
      />

      <!-- 序号列 -->
      <el-table-column
        v-if="showIndex"
        type="index"
        label="序号"
        width="60"
        align="center"
      />

      <!-- 数据列 -->
      <template v-for="column in columns" :key="column.prop">
        <el-table-column
          v-bind="getColumnProps(column)"
        >
          <template #default="{ row, column: col, $index }">
            <!-- 插槽支持 -->
            <slot
              :name="`column-${column.prop}`"
              :row="row"
              :column="col"
              :index="$index"
            >
              <!-- 状态标签 -->
              <el-tag
                v-if="column.type === 'status'"
                :type="getStatusType(row[column.prop], column.statusMap)"
              >
                {{ getStatusText(row[column.prop], column.statusMap) }}
              </el-tag>

              <!-- 图片 -->
              <el-image
                v-else-if="column.type === 'image'"
                :src="row[column.prop]"
                :preview-src-list="[row[column.prop]]"
                style="width: 60px; height: 60px"
                fit="cover"
              />

              <!-- 金额 -->
              <span v-else-if="column.type === 'money'">
                ¥{{ formatMoney(row[column.prop]) }}
              </span>

              <!-- 日期时间 -->
              <span v-else-if="column.type === 'datetime'">
                {{ formatDateTime(row[column.prop]) }}
              </span>

              <!-- 操作按钮 -->
              <div v-else-if="column.type === 'actions'" class="table-actions">
                <el-button
                  v-for="action in column.actions"
                  :key="action.key"
                  :type="action.type || 'text'"
                  :size="action.size || 'small'"
                  :disabled="getActionDisabled(action, row)"
                  @click="action.handler(row)"
                >
                  {{ action.label }}
                </el-button>
              </div>

              <!-- 普通文本 -->
              <span v-else>{{ row[column.prop] }}</span>
            </slot>
          </template>
        </el-table-column>
      </template>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-section" v-if="showPagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="pageSizes"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Search,
  Refresh,
  ArrowDown,
  ArrowUp
} from '@element-plus/icons-vue'
import type { TableColumnCtx } from 'element-plus'

// 定义组件属性
interface Column {
  prop: string
  label: string
  width?: string | number
  minWidth?: string | number
  align?: 'left' | 'center' | 'right'
  type?: 'text' | 'status' | 'image' | 'money' | 'datetime' | 'actions'
  statusMap?: Record<string, { text: string; type: string }>
  actions?: Array<{
    key: string
    label: string
    type?: string
    size?: string
    handler: (row: any) => void
    disabled?: (row: any) => boolean
  }>
}

interface SearchField {
  prop: string
  label: string
  type: 'input' | 'select' | 'date' | 'number'
  placeholder?: string
  options?: Array<{ label: string; value: any }>
  min?: number
  max?: number
}

interface Action {
  key: string
  label: string
  type?: string
  icon?: any
  disabled?: boolean
  handler: () => void
}

const props = defineProps({
  // 数据
  data: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  total: {
    type: Number,
    default: 0
  },

  // 表格配置
  columns: {
    type: Array as () => Column[],
    required: true
  },
  stripe: {
    type: Boolean,
    default: true
  },
  border: {
    type: Boolean,
    default: true
  },
  height: [String, Number],
  maxHeight: [String, Number],

  // 功能开关
  showSearch: {
    type: Boolean,
    default: true
  },
  showSelection: {
    type: Boolean,
    default: true
  },
  showIndex: {
    type: Boolean,
    default: true
  },
  showPagination: {
    type: Boolean,
    default: true
  },
  showAdvancedSearch: {
    type: Boolean,
    default: false
  },

  // 搜索配置
  searchFields: {
    type: Array as () => SearchField[],
    default: () => []
  },
  advancedFields: {
    type: Array as () => SearchField[],
    default: () => []
  },

  // 操作按钮
  actions: {
    type: Array as () => Action[],
    default: () => []
  },

  // 分页配置
  page: {
    type: Number,
    default: 1
  },
  size: {
    type: Number,
    default: 10
  },
  pageSizes: {
    type: Array as () => number[],
    default: () => [10, 20, 50, 100]
  }
})

// 定义事件
const emit = defineEmits([
  'search',
  'reset',
  'selection-change',
  'size-change',
  'current-change'
])

// 响应式数据
const searchFormRef = ref()
const searchForm = reactive<Record<string, any>>({})
const advancedForm = reactive<Record<string, any>>({})
const showAdvanced = ref(false)
const selectedRows = ref<any[]>([])

// 分页数据
const currentPage = computed({
  get: () => props.page,
  set: (val) => emit('current-change', val)
})
const pageSize = computed({
  get: () => props.size,
  set: (val) => emit('size-change', val)
})

// 方法
const handleSearch = () => {
  const searchData = { ...searchForm }
  if (showAdvanced.value) {
    Object.assign(searchData, advancedForm)
  }
  emit('search', searchData)
}

const handleReset = () => {
  searchFormRef.value?.resetFields()
  Object.keys(advancedForm).forEach(key => {
    advancedForm[key] = undefined
  })
  emit('reset')
}

const handleSelectionChange = (selection: any[]) => {
  selectedRows.value = selection
  emit('selection-change', selection)
}

const handleSizeChange = (size: number) => {
  emit('size-change', size)
}

const handleCurrentChange = (page: number) => {
  emit('current-change', page)
}

// 获取字段组件
const getFieldComponent = (type: string) => {
  const componentMap: Record<string, string> = {
    input: 'el-input',
    select: 'el-select',
    date: 'el-date-picker',
    number: 'el-input-number'
  }
  return componentMap[type] || 'el-input'
}

// 获取字段属性
const getFieldProps = (field: SearchField) => {
  const props: any = {
    placeholder: field.placeholder
  }

  if (field.type === 'select') {
    props.options = field.options || []
    props.clearable = true
  }

  if (field.type === 'date') {
    props.type = 'daterange'
    props.format = 'YYYY-MM-DD'
    props.valueFormat = 'YYYY-MM-DD'
  }

  if (field.type === 'number') {
    props.min = field.min
    props.max = field.max
  }

  return props
}

// 获取列属性
const getColumnProps = (column: Column): Partial<TableColumnCtx<any>> => {
  const props: any = {
    prop: column.prop,
    label: column.label
  }

  if (column.width) props.width = column.width
  if (column.minWidth) props.minWidth = column.minWidth
  if (column.align) props.align = column.align

  return props
}

// 获取状态类型
const getStatusType = (value: any, statusMap?: Record<string, { text: string; type: string }>) => {
  if (!statusMap) return 'info'
  return statusMap[value]?.type || 'info'
}

// 获取状态文本
const getStatusText = (value: any, statusMap?: Record<string, { text: string; type: string }>) => {
  if (!statusMap) return value
  return statusMap[value]?.text || value
}

// 获取操作按钮禁用状态
const getActionDisabled = (action: any, row: any) => {
  if (typeof action.disabled === 'function') {
    return action.disabled(row)
  }
  return action.disabled || false
}

// 格式化金额
const formatMoney = (value: number) => {
  return value?.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

// 格式化日期时间
const formatDateTime = (value: string) => {
  if (!value) return ''
  return new Date(value).toLocaleString('zh-CN')
}
</script>

<style lang="scss" scoped>
.data-table {
  background: #fff;
  padding: 20px;
  border-radius: 4px;

  .search-section {
    margin-bottom: 20px;
  }

  .action-section {
    margin-bottom: 20px;
    display: flex;
    gap: 10px;
  }

  .advanced-search {
    background: #f5f7fa;
    padding: 15px;
    border-radius: 4px;
  }

  .table-actions {
    display: flex;
    gap: 8px;
  }

  .pagination-section {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }

  :deep(.el-table) {
    .el-table__row {
      &:hover {
        background-color: #f5f7fa;
      }
    }
  }
}
</style>