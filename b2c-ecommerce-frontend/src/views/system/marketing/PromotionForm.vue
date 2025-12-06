<template>
  <div class="promotion-form">
    <div class="page-header">
      <h2>{{ isEdit ? '编辑促销活动' : '创建促销活动' }}</h2>
      <div class="actions">
        <el-button @click="handleBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
      </div>
    </div>

    <el-card v-loading="loading">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
      >
        <el-form-item label="活动名称" prop="name">
          <el-input
            v-model="form.name"
            placeholder="请输入活动名称"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="活动类型" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio value="full_reduction">满减优惠</el-radio>
            <el-radio value="discount">折扣优惠</el-radio>
            <el-radio value="limited_offer">限时特价</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="活动描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入活动描述"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="活动时间" prop="timeRange">
          <el-date-picker
            v-model="form.timeRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>

        <!-- 满减规则 -->
        <template v-if="form.type === 'full_reduction'">
          <el-form-item label="优惠规则">
            <div class="rule-list">
              <div
                v-for="(rule, index) in form.rules"
                :key="index"
                class="rule-item"
              >
                <el-input-number
                  v-model="rule.minAmount"
                  placeholder="满"
                  :min="0"
                  style="width: 120px; margin-right: 10px;"
                />
                <el-input-number
                  v-model="rule.discountAmount"
                  placeholder="减"
                  :min="0"
                  style="width: 120px; margin-right: 10px;"
                />
                <span style="margin-right: 10px;">元</span>
                <el-button
                  type="danger"
                  size="small"
                  @click="removeRule(index)"
                  :disabled="form.rules.length <= 1"
                >
                  删除
                </el-button>
              </div>
              <el-button type="primary" size="small" @click="addRule">
                添加规则
              </el-button>
            </div>
          </el-form-item>
        </template>

        <!-- 折扣规则 -->
        <template v-if="form.type === 'discount'">
          <el-form-item label="折扣设置" prop="discountRate">
            <el-input-number
              v-model="form.discountRate"
              :min="0.1"
              :max="0.99"
              :step="0.1"
              placeholder="请输入折扣率"
              style="width: 200px"
            />
            <span style="margin-left: 10px;">折</span>
          </el-form-item>
          <el-form-item label="最大优惠金额">
            <el-input-number
              v-model="form.maxDiscountAmount"
              :min="0"
              placeholder="不限制可不填"
              style="width: 200px"
            />
            <span style="margin-left: 10px;">元</span>
          </el-form-item>
        </template>

        <!-- 限时特价 -->
        <template v-if="form.type === 'limited_offer'">
          <el-form-item label="商品选择" prop="productIds">
            <el-select
              v-model="form.productIds"
              multiple
              placeholder="请选择商品"
              style="width: 100%"
              filterable
            >
              <el-option
                v-for="item in productOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </template>

        <el-form-item label="适用商品">
          <el-radio-group v-model="form.applicableType">
            <el-radio value="all">全部商品</el-radio>
            <el-radio value="category">指定分类</el-radio>
            <el-radio value="product">指定商品</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item v-if="form.applicableType === 'category'" label="商品分类">
          <el-select
            v-model="form.applicableCategories"
            multiple
            placeholder="请选择分类"
            style="width: 100%"
          >
            <el-option
              v-for="item in categoryOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item v-if="form.applicableType === 'product'" label="商品选择">
          <el-select
            v-model="form.applicableProducts"
            multiple
            placeholder="请选择商品"
            style="width: 100%"
            filterable
          >
            <el-option
              v-for="item in productOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="用户限制" prop="maxUsagePerUser">
          <el-input-number
            v-model="form.maxUsagePerUser"
            :min="1"
            placeholder="请输入限制次数"
            style="width: 200px"
          />
          <span style="margin-left: 10px;">次/人</span>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            {{ isEdit ? '保存修改' : '创建活动' }}
          </el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button @click="handleBack">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

// 响应式数据
const loading = ref(false)
const submitting = ref(false)
const formRef = ref()

// 表单数据
const form = reactive({
  name: '',
  type: 'full_reduction',
  description: '',
  timeRange: [],
  rules: [
    {
      minAmount: 0,
      discountAmount: 0
    }
  ],
  discountRate: 0.8,
  maxDiscountAmount: null,
  productIds: [],
  applicableType: 'all',
  applicableCategories: [],
  applicableProducts: [],
  maxUsagePerUser: 1
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入活动名称', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择活动类型', trigger: 'change' }
  ],
  description: [
    { required: true, message: '请输入活动描述', trigger: 'blur' }
  ],
  timeRange: [
    { required: true, message: '请选择活动时间', trigger: 'change' }
  ],
  maxUsagePerUser: [
    { required: true, message: '请输入用户限制', trigger: 'blur' }
  ]
}

// 是否是编辑模式
const isEdit = computed(() => route.query.edit || route.params.id)

// 商品选项
const productOptions = [
  { label: 'Apple iPhone 14 Pro', value: 'PRD001' },
  { label: 'Apple MacBook Pro', value: 'PRD002' },
  { label: 'Sony WH-1000XM5', value: 'PRD003' }
]

// 分类选项
const categoryOptions = [
  { label: '手机数码', value: 'phone' },
  { label: '电脑办公', value: 'computer' },
  { label: '家用电器', value: 'appliance' }
]

// 添加规则
const addRule = () => {
  form.rules.push({
    minAmount: 0,
    discountAmount: 0
  })
}

// 删除规则
const removeRule = (index: number) => {
  if (form.rules.length > 1) {
    form.rules.splice(index, 1)
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    submitting.value = true

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))

    ElMessage.success(isEdit.value ? '修改成功' : '创建成功')
    router.push('/system/promotions')

  } catch (error) {
    // 表单验证失败
  } finally {
    submitting.value = false
  }
}

// 重置表单
const handleReset = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// 返回列表
const handleBack = () => {
  router.back()
}

// 初始化
onMounted(() => {
  // 如果是编辑模式，加载活动数据
  if (isEdit.value) {
    // TODO: 加载活动数据
    console.log('Edit mode:', route.query.edit || route.params.id)
  }
})
</script>

<style scoped>
.promotion-form {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  color: #303133;
}

.rule-list {
  width: 100%;
}

.rule-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
</style>