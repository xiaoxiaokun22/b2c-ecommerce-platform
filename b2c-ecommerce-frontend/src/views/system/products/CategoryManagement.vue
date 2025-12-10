<template>
  <div class="category-management">
    <div class="page-header">
      <div class="header-content">
        <h2>商品分类管理</h2>
        <p>管理商品的多级分类体系，支持三级分类</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          添加分类
        </el-button>
      </div>
    </div>

    <!-- 分类树形表格 -->
    <div class="table-container">
      <el-table
        :data="categoryTree"
        row-key="id"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        v-loading="loading"
        border
      >
        <el-table-column prop="name" label="分类名称" min-width="300">
          <template #default="{ row }">
            <div class="category-name">
              <el-avatar v-if="row.icon" :size="24" :src="row.icon" />
              <el-icon v-else :size="20" color="#909399"><Files /></el-icon>
              <span class="name-text">{{ row.name }}</span>
              <el-tag v-if="getCategoryLevel(row) === 1" type="primary" size="small" class="level-tag">一级</el-tag>
              <el-tag v-else-if="getCategoryLevel(row) === 2" type="success" size="small" class="level-tag">二级</el-tag>
              <el-tag v-else type="warning" size="small" class="level-tag">三级</el-tag>
            </div>
            <div class="category-path" v-if="getCategoryPath(row).length > 1">
              {{ getCategoryPath(row).join(' > ') }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="80" align="center" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'">
              {{ row.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="productCount" label="商品数量" width="100" align="center">
          <template #default="{ row }">
            <el-badge :value="row.productCount" type="primary" />
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <div class="table-action-buttons" data-buttons="3">
              <el-button type="primary" link @click="handleEdit(row)">
                <el-icon><Edit /></el-icon>
                <span>编辑</span>
              </el-button>
              <el-button type="success" link @click="handleAddSub(row)">
                <el-icon><Plus /></el-icon>
                <span>添加子分类</span>
              </el-button>
              <el-popconfirm
                :title="`确定要删除分类「${row.name}」吗？`"
                width="180"
                @confirm="handleDelete(row)"
              >
                <template #reference>
                  <el-button type="danger" link>
                    <el-icon><Delete /></el-icon>
                    <span>删除</span>
                  </el-button>
                </template>
              </el-popconfirm>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分类表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="resetForm"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="上级分类" prop="parentId" v-if="!isEditingRoot">
          <el-cascader
            v-model="form.parentId"
            :options="categoryOptions"
            :props="{ value: 'id', label: 'name', children: 'children', checkStrictly: true }"
            placeholder="请选择上级分类"
            clearable
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="分类图标" prop="icon">
          <el-input v-model="form.icon" placeholder="请输入图标URL">
            <template #append>
              <el-upload
                :show-file-list="false"
                :before-upload="beforeIconUpload"
                accept="image/*"
              >
                <el-button>上传</el-button>
              </el-upload>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" :min="0" :max="999" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="active">启用</el-radio>
            <el-radio label="inactive">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="分类描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入分类描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Edit, Delete, Files } from '@element-plus/icons-vue'

// 类型定义
interface Category {
  id: number
  name: string
  parentId: number | null
  icon?: string
  sort: number
  status: 'active' | 'inactive'
  description?: string
  productCount: number
  createdAt: string
  children?: Category[]
  hasChildren?: boolean
}

// 响应式数据
const loading = ref(false)
const dialogVisible = ref(false)
const submitting = ref(false)
const isEditingRoot = ref(false)
const formRef = ref<FormInstance>()
const categoryTree = ref<Category[]>([])
const flatCategories = ref<Category[]>([])

// 表单数据
const form = reactive({
  id: undefined as number | undefined,
  parentId: null as number | null,
  name: '',
  icon: '',
  sort: 0,
  status: 'active' as 'active' | 'inactive',
  description: ''
})

// 表单验证规则
const rules: FormRules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { min: 2, max: 50, message: '分类名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  sort: [
    { required: true, message: '请输入排序', trigger: 'blur' },
    { type: 'number', min: 0, max: 999, message: '排序值在 0 到 999 之间', trigger: 'blur' }
  ]
}

// 计算属性
const dialogTitle = computed(() => {
  if (form.id) {
    return isEditingRoot.value ? '编辑根分类' : '编辑分类'
  }
  return isEditingRoot.value ? '添加根分类' : '添加子分类'
})

const categoryOptions = computed(() => {
  return categoryTree.value
})

// 方法
const loadCategories = async () => {
  loading.value = true
  try {
    // 这里应该调用实际的API
    // const response = await categoryApi.getCategoryTree()
    // 模拟数据
    const mockData: Category[] = [
      {
        id: 1,
        name: '电子产品',
        parentId: null,
        icon: '',
        sort: 1,
        status: 'active',
        description: '各类电子设备和配件',
        productCount: 156,
        createdAt: '2024-01-01 10:00:00',
        children: [
          {
            id: 11,
            name: '手机',
            parentId: 1,
            icon: '',
            sort: 1,
            status: 'active',
            description: '智能手机',
            productCount: 89,
            createdAt: '2024-01-01 10:30:00',
            children: [
              {
                id: 111,
                name: 'iPhone',
                parentId: 11,
                icon: '',
                sort: 1,
                status: 'active',
                description: '苹果手机',
                productCount: 23,
                createdAt: '2024-01-01 11:00:00'
              },
              {
                id: 112,
                name: 'Android手机',
                parentId: 11,
                icon: '',
                sort: 2,
                status: 'active',
                description: '安卓手机',
                productCount: 66,
                createdAt: '2024-01-01 11:30:00'
              }
            ]
          },
          {
            id: 12,
            name: '电脑',
            parentId: 1,
            icon: '',
            sort: 2,
            status: 'active',
            description: '笔记本电脑和台式机',
            productCount: 67,
            createdAt: '2024-01-01 12:00:00'
          }
        ]
      },
      {
        id: 2,
        name: '服装',
        parentId: null,
        icon: '',
        sort: 2,
        status: 'active',
        description: '各类服装服饰',
        productCount: 234,
        createdAt: '2024-01-01 13:00:00',
        children: [
          {
            id: 21,
            name: '男装',
            parentId: 2,
            icon: '',
            sort: 1,
            status: 'active',
            description: '男士服装',
            productCount: 112,
            createdAt: '2024-01-01 13:30:00'
          },
          {
            id: 22,
            name: '女装',
            parentId: 2,
            icon: '',
            sort: 2,
            status: 'active',
            description: '女士服装',
            productCount: 122,
            createdAt: '2024-01-01 14:00:00'
          }
        ]
      }
    ]
    categoryTree.value = mockData
    flatCategories.value = flattenCategories(mockData)
  } catch (error) {
    ElMessage.error('加载分类数据失败')
  } finally {
    loading.value = false
  }
}

const flattenCategories = (categories: Category[]): Category[] => {
  let result: Category[] = []
  categories.forEach(category => {
    result.push(category)
    if (category.children && category.children.length > 0) {
      result = result.concat(flattenCategories(category.children))
    }
  })
  return result
}

// 获取分类路径
const getCategoryPath = (category: Category): string[] => {
  const path: string[] = [category.name]
  const parent = getParentCategory(category)
  if (parent) {
    const parentPath = getCategoryPath(parent)
    return [...parentPath, ...path]
  }
  return path
}

// 获取分类层级
const getCategoryLevel = (category: Category): number => {
  if (!category.parentId) return 1

  // 在扁平数据中查找父分类
  const parent = flatCategories.value.find(cat => cat.id === category.parentId)
  if (!parent) return 1

  // 递归获取父分类的层级
  return getCategoryLevel(parent) + 1
}

// 获取父分类
const getParentCategory = (category: Category): Category | null => {
  if (!category.parentId) return null

  // 在扁平数据中查找，更可靠
  return flatCategories.value.find(cat => cat.id === category.parentId) || null
}

const handleAdd = () => {
  resetForm()
  isEditingRoot.value = true
  dialogVisible.value = true
}

const handleAddSub = (row: Category) => {
  resetForm()
  form.parentId = row.id
  isEditingRoot.value = false
  dialogVisible.value = true
}

const handleEdit = (row: Category) => {
  Object.assign(form, {
    id: row.id,
    parentId: row.parentId,
    name: row.name,
    icon: row.icon || '',
    sort: row.sort,
    status: row.status,
    description: row.description || ''
  })
  isEditingRoot.value = row.parentId === null
  dialogVisible.value = true
}

const handleDelete = async (row: Category) => {
  if (row.children && row.children.length > 0) {
    ElMessage.warning('该分类下还有子分类，不能删除')
    return
  }

  if (row.productCount > 0) {
    ElMessage.warning('该分类下还有商品，不能删除')
    return
  }

  try {
    await ElMessageBox.confirm('确定要删除这个分类吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    // 这里应该调用实际的API
    // await categoryApi.deleteCategory(row.id)

    ElMessage.success('删除成功')
    await loadCategories()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true

    // 这里应该调用实际的API
    if (form.id) {
      // await categoryApi.updateCategory(form.id, form)
      ElMessage.success('更新成功')
    } else {
      // await categoryApi.createCategory(form)
      ElMessage.success('创建成功')
    }

    dialogVisible.value = false
    await loadCategories()
  } catch (error) {
    if (error !== false) {
      ElMessage.error(form.id ? '更新失败' : '创建失败')
    }
  } finally {
    submitting.value = false
  }
}

const resetForm = () => {
  formRef.value?.resetFields()
  Object.assign(form, {
    id: undefined,
    parentId: null,
    name: '',
    icon: '',
    sort: 0,
    status: 'active',
    description: ''
  })
}

const beforeIconUpload = (file: File) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return false
  }

  // 这里应该上传文件并获取URL
  // const url = await uploadApi.uploadFile(file)
  // form.icon = url
  ElMessage.success('图标上传功能需要后端支持')
  return false // 阻止默认上传
}

// 生命周期
onMounted(() => {
  loadCategories()
})
</script>

<style scoped>
@import '@/styles/table-actions.css';

.category-management {
  padding: 16px;
  background: white;
  border-radius: 8px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
}

.header-content h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.header-content p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.table-container {
  background: white;
}

.category-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.category-name .el-avatar,
.category-name .el-icon {
  flex-shrink: 0;
}

.name-text {
  font-weight: 500;
  color: #303133;
}

.level-tag {
  margin-left: 8px;
  font-size: 12px;
}

.category-path {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  padding-left: 32px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

:deep(.el-table__row .el-table__cell) {
  padding: 12px 0;
}

/* 优化树形表格的缩进 */
:deep(.el-table__expand-icon) {
  margin-right: 8px;
}

:deep(.el-table__indent) {
  padding-left: 20px !important;
}

:deep(.el-table__expand-column .cell) {
  padding-left: 12px !important;
}

/* 子分类行的背景色区分 */
:deep(.el-table__row--level-1) {
  background-color: #fafafa;
}

:deep(.el-table__row--level-2) {
  background-color: #f5f5f5;
}

:deep(.el-cascader) {
  width: 100%;
}
</style>