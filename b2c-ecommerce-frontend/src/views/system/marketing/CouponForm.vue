<template>
  <div class="coupon-form">
    <div class="page-header">
      <h2>{{ isEdit ? '编辑优惠券' : '创建优惠券' }}</h2>
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
        <el-form-item label="优惠券名称" prop="name">
          <el-input
            v-model="form.name"
            placeholder="请输入优惠券名称"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="优惠券类型" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio value="full_reduction">满减券</el-radio>
            <el-radio value="discount">折扣券</el-radio>
            <el-radio value="cash">现金券</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="面额" prop="amount" v-if="form.type === 'cash'">
          <el-input-number
            v-model="form.amount"
            :min="1"
            :max="99999"
            placeholder="请输入面额"
          />
          <span style="margin-left: 8px">元</span>
        </el-form-item>

        <el-form-item label="满减门槛" prop="minAmount" v-if="form.type === 'full_reduction'">
          <el-input-number
            v-model="form.minAmount"
            :min="1"
            :max="99999"
            placeholder="请输入满减门槛"
          />
          <span style="margin-left: 8px">元</span>
        </el-form-item>

        <el-form-item label="减免金额" prop="discountAmount" v-if="form.type === 'full_reduction'">
          <el-input-number
            v-model="form.discountAmount"
            :min="1"
            :max="99999"
            placeholder="请输入减免金额"
          />
          <span style="margin-left: 8px">元</span>
        </el-form-item>

        <el-form-item label="折扣率" prop="discountRate" v-if="form.type === 'discount'">
          <el-input-number
            v-model="form.discountRate"
            :min="0.1"
            :max="9.9"
            :step="0.1"
            placeholder="请输入折扣率"
          />
          <span style="margin-left: 8px">折</span>
        </el-form-item>

        <el-form-item label="最高优惠" prop="maxDiscount" v-if="form.type === 'discount'">
          <el-input-number
            v-model="form.maxDiscount"
            :min="0"
            :max="99999"
            placeholder="请输入最高优惠金额（可选）"
          />
          <span style="margin-left: 8px">元</span>
        </el-form-item>

        <el-form-item label="发行数量" prop="total">
          <el-input-number
            v-model="form.total"
            :min="1"
            :max="999999"
            placeholder="请输入发行数量"
          />
        </el-form-item>

        <el-form-item label="每人限领" prop="limitPerUser">
          <el-input-number
            v-model="form.limitPerUser"
            :min="1"
            :max="99"
            placeholder="请输入每人限领数量"
          />
        </el-form-item>

        <el-form-item label="有效期" prop="validityType">
          <el-radio-group v-model="form.validityType">
            <el-radio value="days">领取后N天有效</el-radio>
            <el-radio value="daterange">固定有效期</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="有效天数" prop="validDays" v-if="form.validityType === 'days'">
          <el-input-number
            v-model="form.validDays"
            :min="1"
            :max="365"
            placeholder="请输入有效天数"
          />
          <span style="margin-left: 8px">天</span>
        </el-form-item>

        <el-form-item label="有效时间" prop="validTimeRange" v-if="form.validityType === 'daterange'">
          <el-date-picker
            v-model="form.validTimeRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>

        <el-form-item label="适用范围" prop="applicableType">
          <el-select v-model="form.applicableType" placeholder="请选择适用范围" style="width: 100%">
            <el-option label="全部商品" value="all" />
            <el-option label="指定分类" value="category" />
            <el-option label="指定商品" value="product" />
          </el-select>
        </el-form-item>

        <el-form-item label="适用分类" v-if="form.applicableType === 'category'">
          <el-select v-model="form.applicableCategories" multiple placeholder="请选择分类" style="width: 100%">
            <el-option
              v-for="item in categoryOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="适用商品" v-if="form.applicableType === 'product'">
          <el-select v-model="form.applicableProducts" multiple placeholder="请选择商品" style="width: 100%">
            <el-option
              v-for="item in productOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="使用门槛" prop="minOrderAmount">
          <el-input-number
            v-model="form.minOrderAmount"
            :min="0"
            :max="99999"
            placeholder="请输入最低订单金额（0表示无门槛）"
          />
          <span style="margin-left: 8px">元</span>
        </el-form-item>

        <el-form-item label="优惠券说明" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入优惠券使用说明"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio value="draft">草稿</el-radio>
            <el-radio value="active">启用</el-radio>
            <el-radio value="inactive">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <div class="form-footer">
        <el-button @click="handleBack">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          {{ isEdit ? '更新' : '创建' }}
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
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
  amount: 0,
  minAmount: 0,
  discountAmount: 0,
  discountRate: 8.0,
  maxDiscount: null,
  total: 1000,
  limitPerUser: 1,
  validityType: 'days',
  validDays: 30,
  validTimeRange: [],
  applicableType: 'all',
  applicableCategories: [],
  applicableProducts: [],
  minOrderAmount: 0,
  description: '',
  status: 'draft'
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入优惠券名称', trigger: 'blur' },
    { min: 2, max: 50, message: '名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择优惠券类型', trigger: 'change' }
  ],
  amount: [
    { required: true, message: '请输入面额', trigger: 'blur', type: 'number' }
  ],
  minAmount: [
    { required: true, message: '请输入满减门槛', trigger: 'blur', type: 'number' }
  ],
  discountAmount: [
    { required: true, message: '请输入减免金额', trigger: 'blur', type: 'number' }
  ],
  discountRate: [
    { required: true, message: '请输入折扣率', trigger: 'blur', type: 'number' }
  ],
  total: [
    { required: true, message: '请输入发行数量', trigger: 'blur', type: 'number' }
  ],
  limitPerUser: [
    { required: true, message: '请输入每人限领数量', trigger: 'blur', type: 'number' }
  ],
  validityType: [
    { required: true, message: '请选择有效期类型', trigger: 'change' }
  ],
  validDays: [
    { required: true, message: '请输入有效天数', trigger: 'blur', type: 'number' }
  ],
  validTimeRange: [
    { required: true, message: '请选择有效时间', trigger: 'change', type: 'array' }
  ],
  applicableType: [
    { required: true, message: '请选择适用范围', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 是否是编辑模式
const isEdit = computed(() => {
  return route.query.edit || route.params.id
})

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

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    submitting.value = true

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))

    ElMessage.success(isEdit.value ? '修改成功' : '创建成功')
    router.push('/system/coupons')

  } catch (error) {
    // 表单验证失败
  } finally {
    submitting.value = false
  }
}

// 返回列表
const handleBack = () => {
  router.back()
}

// 加载优惠券数据
const loadCoupon = async (id: string | string[]) => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))

    // 模拟返回的数据
    const mockData = {
      name: '双十一专享券',
      type: 'full_reduction',
      minAmount: 200,
      discountAmount: 50,
      total: 10000,
      limitPerUser: 2,
      validityType: 'days',
      validDays: 30,
      validTimeRange: [],
      applicableType: 'all',
      applicableCategories: [],
      applicableProducts: [],
      minOrderAmount: 0,
      description: '双十一期间专享优惠券，满200减50',
      status: 'active'
    }

    // 填充表单数据
    Object.assign(form, mockData)

  } catch (error) {
    ElMessage.error('加载优惠券数据失败')
  } finally {
    loading.value = false
  }
}

// 初始化
onMounted(() => {
  // 如果是编辑模式，加载数据
  if (isEdit.value) {
    const id = route.query.edit || route.params.id
    if (id) {
      loadCoupon(id)
    }
  }
})
</script>

<style scoped>
.coupon-form {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.form-footer {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
  text-align: center;
}

.form-footer .el-button {
  margin: 0 10px;
  width: 120px;
}
</style>