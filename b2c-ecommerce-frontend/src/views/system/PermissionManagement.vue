<template>
  <div class="permission-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>权限管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            添加权限
          </el-button>
        </div>
      </template>

      <!-- 搜索区域 -->
      <div class="search-form">
        <el-form :inline="true" :model="searchForm" class="search-form-content">
          <el-form-item label="权限编码">
            <el-input
              v-model="searchForm.code"
              placeholder="请输入权限编码"
              clearable
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          <el-form-item label="权限名称">
            <el-input
              v-model="searchForm.name"
              placeholder="请输入权限名称"
              clearable
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          <el-form-item label="权限类型">
            <el-select v-model="searchForm.type" placeholder="请选择权限类型" clearable>
              <el-option label="菜单权限" value="menu" />
              <el-option label="按钮权限" value="button" />
              <el-option label="API权限" value="api" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
              <el-option label="启用" :value="1" />
              <el-option label="禁用" :value="2" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
            <el-button @click="handleReset">
              <el-icon><Refresh /></el-icon>
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 表格区域 -->
      <el-table
        v-loading="loading"
        :data="permissionList"
        border
        stripe
        row-key="id"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        :default-expand-all="false"
      >
        <el-table-column prop="code" label="权限编码" width="200" />
        <el-table-column prop="name" label="权限名称" width="200" />
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column label="类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)">
              {{ getTypeLabel(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="path" label="路径" width="200" show-overflow-tooltip />
        <el-table-column prop="icon" label="图标" width="100">
          <template #default="{ row }">
            <el-icon v-if="row.icon">
              <component :is="row.icon" />
            </el-icon>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="80" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <div class="table-action-buttons" data-buttons="4">
              <el-button type="primary" link @click="handleView(row)">
                <el-icon><View /></el-icon>
                <span>查看</span>
              </el-button>
              <el-button type="primary" link @click="handleEdit(row)">
                <el-icon><Edit /></el-icon>
                <span>编辑</span>
              </el-button>
              <el-button type="success" link @click="handleAddChild(row)">
                <el-icon><Plus /></el-icon>
                <span>添加子权限</span>
              </el-button>
              <el-popconfirm
                :title="`确定要删除权限「${row.name}」吗？此操作不可撤销！`"
                width="220"
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

      <!-- 分页区域 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 权限表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="700px"
      @close="handleDialogClose"
    >
      <el-form
        ref="permissionFormRef"
        :model="permissionForm"
        :rules="permissionFormRules"
        label-width="120px"
      >
        <el-form-item label="权限编码" prop="code">
          <el-input
            v-model="permissionForm.code"
            placeholder="请输入权限编码"
            :disabled="dialogMode === 'edit'"
          />
        </el-form-item>
        <el-form-item label="权限名称" prop="name">
          <el-input v-model="permissionForm.name" placeholder="请输入权限名称" />
        </el-form-item>
        <el-form-item label="权限类型" prop="type">
          <el-select v-model="permissionForm.type" placeholder="请选择权限类型" :disabled="dialogMode === 'addChild'">
            <el-option label="菜单权限" value="menu" />
            <el-option label="按钮权限" value="button" />
            <el-option label="API权限" value="api" />
          </el-select>
        </el-form-item>
        <el-form-item label="父权限">
          <el-tree-select
            v-model="permissionForm.parentId"
            :data="parentPermissionOptions"
            placeholder="请选择父权限"
            clearable
            check-strictly
            :props="{ label: 'name', value: 'id' }"
            :disabled="dialogMode === 'addChild'"
          />
        </el-form-item>
        <el-form-item v-if="permissionForm.type === 'menu'" label="路径" prop="path">
          <el-input v-model="permissionForm.path" placeholder="请输入菜单路径" />
        </el-form-item>
        <el-form-item v-if="permissionForm.type === 'menu'" label="图标">
          <el-input v-model="permissionForm.icon" placeholder="请输入图标名称" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="permissionForm.sort" :min="0" :max="9999" />
        </el-form-item>
        <el-form-item label="权限描述">
          <el-input
            v-model="permissionForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入权限描述"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="permissionForm.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="2">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
            确认
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Search, Refresh, View, Edit, Delete } from '@element-plus/icons-vue'
import {
  getPermissions,
  getPermissionTree,
  getPermission,
  createPermission,
  updatePermission,
  deletePermission
} from '@/api/permission'
import type { Permission, PermissionType, PermissionQueryParams } from '@/types/permission'

// 响应式数据
const loading = ref(false)
const permissionList = ref<Permission[]>([])
const parentPermissionOptions = ref<any[]>([])

// 搜索表单
const searchForm = reactive({
  code: '',
  name: '',
  type: undefined as PermissionType | undefined,
  status: undefined as number | undefined
})

// 分页数据
const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

// 对话框相关
const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit' | 'view' | 'addChild'>('add')
const dialogTitle = ref('')
const permissionFormRef = ref<FormInstance>()
const submitLoading = ref(false)

// 权限表单
const permissionForm = reactive({
  id: 0,
  code: '',
  name: '',
  description: '',
  type: 'menu' as PermissionType,
  parentId: undefined as number | undefined,
  path: '',
  icon: '',
  sort: 0,
  status: 1
})

// 表单验证规则
const permissionFormRules: FormRules = {
  code: [
    { required: true, message: '请输入权限编码', trigger: 'blur' },
    { pattern: /^[a-z:_]+$/, message: '权限编码只能包含小写字母、冒号和下划线', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入权限名称', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择权限类型', trigger: 'change' }
  ],
  sort: [
    { required: true, message: '请输入排序', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 权限类型相关方法
const getTypeLabel = (type: PermissionType) => {
  const typeMap = {
    menu: '菜单权限',
    button: '按钮权限',
    api: 'API权限'
  }
  return typeMap[type] || type
}

const getTypeTagType = (type: PermissionType) => {
  const typeMap = {
    menu: 'primary',
    button: 'success',
    api: 'warning'
  }
  return typeMap[type] || ''
}

// 构建父权限选项（扁平化处理）
const buildParentOptions = (permissions: Permission[], level = 0) => {
  const options: any[] = []

  permissions.forEach(permission => {
    const option = {
      ...permission,
      name: '　'.repeat(level) + permission.name
    }
    options.push(option)

    if (permission.children && permission.children.length > 0) {
      options.push(...buildParentOptions(permission.children, level + 1))
    }
  })

  return options
}

// 获取权限列表
const fetchPermissionList = async () => {
  loading.value = true
  try {
    const params: PermissionQueryParams = {
      page: pagination.page,
      size: pagination.size,
      ...(searchForm.code && { code: searchForm.code }),
      ...(searchForm.name && { name: searchForm.name }),
      ...(searchForm.type && { type: searchForm.type }),
      ...(searchForm.status && { status: searchForm.status })
    }

    const response = await getPermissions(params)
    permissionList.value = response.data
    pagination.total = response.total
  } catch (error) {
    ElMessage.error('获取权限列表失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 获取权限树（用于父权限选择）
const fetchPermissionTree = async () => {
  try {
    const permissions = await getPermissionTree()
    parentPermissionOptions.value = buildParentOptions(permissions)
  } catch (error) {
    ElMessage.error('获取权限树失败')
    console.error(error)
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  fetchPermissionList()
}

// 重置
const handleReset = () => {
  Object.assign(searchForm, {
    code: '',
    name: '',
    type: undefined,
    status: undefined
  })
  pagination.page = 1
  fetchPermissionList()
}

// 分页处理
const handleSizeChange = (size: number) => {
  pagination.size = size
  pagination.page = 1
  fetchPermissionList()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  fetchPermissionList()
}

// 添加权限
const handleAdd = () => {
  dialogMode.value = 'add'
  dialogTitle.value = '添加权限'
  resetPermissionForm()
  dialogVisible.value = true
}

// 添加子权限
const handleAddChild = (row: Permission) => {
  dialogMode.value = 'addChild'
  dialogTitle.value = '添加子权限'
  resetPermissionForm()

  // 设置父权限和权限类型
  permissionForm.parentId = row.id
  if (row.type === 'menu') {
    permissionForm.type = 'button' // 菜单权限通常添加按钮权限作为子权限
  }

  dialogVisible.value = true
}

// 查看权限
const handleView = async (row: Permission) => {
  dialogMode.value = 'view'
  dialogTitle.value = '查看权限'

  try {
    const permissionDetail = await getPermission(row.id)
    Object.assign(permissionForm, permissionDetail)
    dialogVisible.value = true
  } catch (error) {
    ElMessage.error('获取权限详情失败')
    console.error(error)
  }
}

// 编辑权限
const handleEdit = async (row: Permission) => {
  dialogMode.value = 'edit'
  dialogTitle.value = '编辑权限'

  try {
    const permissionDetail = await getPermission(row.id)
    Object.assign(permissionForm, permissionDetail)
    dialogVisible.value = true
  } catch (error) {
    ElMessage.error('获取权限详情失败')
    console.error(error)
  }
}

// 删除权限
const handleDelete = async (row: Permission) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除权限 "${row.name}" 吗？此操作不可撤销！`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await deletePermission(row.id)
    ElMessage.success('删除成功')
    fetchPermissionList()
    fetchPermissionTree() // 重新加载权限树
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
      console.error(error)
    }
  }
}

// 提交权限表单
const handleSubmit = async () => {
  if (!permissionFormRef.value) return

  try {
    await permissionFormRef.value.validate()
    submitLoading.value = true

    if (dialogMode.value === 'add' || dialogMode.value === 'addChild') {
      await createPermission(permissionForm)
      ElMessage.success('添加成功')
    } else {
      await updatePermission(permissionForm.id, permissionForm)
      ElMessage.success('更新成功')
    }

    dialogVisible.value = false
    fetchPermissionList()
    fetchPermissionTree() // 重新加载权限树
  } catch (error) {
    console.error(error)
  } finally {
    submitLoading.value = false
  }
}

// 重置权限表单
const resetPermissionForm = () => {
  Object.assign(permissionForm, {
    id: 0,
    code: '',
    name: '',
    description: '',
    type: 'menu',
    parentId: undefined,
    path: '',
    icon: '',
    sort: 0,
    status: 1
  })
}

// 关闭对话框
const handleDialogClose = () => {
  if (permissionFormRef.value) {
    permissionFormRef.value.resetFields()
  }
  resetPermissionForm()
}

// 初始化
onMounted(() => {
  fetchPermissionList()
  fetchPermissionTree()
})
</script>

<style scoped>
@import '@/styles/table-actions.css';

.permission-management {
  padding: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-form {
  margin-bottom: 20px;
}

.search-form-content {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>