<template>
  <div class="role-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>角色管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            添加角色
          </el-button>
        </div>
      </template>

      <!-- 搜索区域 -->
      <div class="search-form">
        <el-form :inline="true" :model="searchForm" class="search-form-content">
          <el-form-item label="角色编码">
            <el-input
              v-model="searchForm.code"
              placeholder="请输入角色编码"
              clearable
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          <el-form-item label="角色名称">
            <el-input
              v-model="searchForm.name"
              placeholder="请输入角色名称"
              clearable
              @keyup.enter="handleSearch"
            />
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
      <el-table v-loading="loading" :data="roleList" border stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="code" label="角色编码" />
        <el-table-column prop="name" label="角色名称" />
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column prop="updateTime" label="更新时间" width="180" />
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
              <el-button type="success" link @click="handleAssignPermissions(row)">
                <el-icon><Key /></el-icon>
                <span>分配权限</span>
              </el-button>
              <el-popconfirm
                :title="`确定要删除角色「${row.name}」吗？此操作不可撤销！`"
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

    <!-- 角色表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form
        ref="roleFormRef"
        :model="roleForm"
        :rules="roleFormRules"
        label-width="100px"
      >
        <el-form-item label="角色编码" prop="code">
          <el-input
            v-model="roleForm.code"
            placeholder="请输入角色编码"
            :disabled="dialogMode === 'edit'"
          />
        </el-form-item>
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="roleForm.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input
            v-model="roleForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入角色描述"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="roleForm.status">
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

    <!-- 分配权限对话框 -->
    <el-dialog v-model="permissionDialogVisible" title="分配权限" width="800px">
      <el-form label-width="80px">
        <el-form-item label="角色">
          <span>{{ currentRole?.name }} ({{ currentRole?.code }})</span>
        </el-form-item>
        <el-form-item label="权限">
          <el-tree
            ref="permissionTreeRef"
            :data="permissionTree"
            show-checkbox
            node-key="id"
            :props="{ label: 'name', children: 'children' }"
            :default-expanded-keys="[1, 17]"
            style="border: 1px solid #dcdfe6; padding: 10px; border-radius: 4px;"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="permissionDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handlePermissionSubmit" :loading="permissionSubmitLoading">
            确认
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Search, Refresh, View, Edit, Key, Delete } from '@element-plus/icons-vue'
import { getRoles, getRole, assignRolePermissions } from '@/api/permission'
import { getPermissionTree } from '@/api/permission'
import type { Role, RoleWithPermissions, RoleQueryParams } from '@/types/permission'

// 响应式数据
const loading = ref(false)
const roleList = ref<Role[]>([])
const permissionTree = ref<any[]>([])

// 搜索表单
const searchForm = reactive({
  code: '',
  name: '',
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
const dialogMode = ref<'add' | 'edit' | 'view'>('add')
const dialogTitle = ref('')
const roleFormRef = ref<FormInstance>()
const submitLoading = ref(false)

// 角色表单
const roleForm = reactive({
  id: 0,
  code: '',
  name: '',
  description: '',
  status: 1
})

// 表单验证规则
const roleFormRules: FormRules = {
  code: [
    { required: true, message: '请输入角色编码', trigger: 'blur' },
    { pattern: /^[A-Z_]+$/, message: '角色编码只能包含大写字母和下划线', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' }
  ]
}

// 权限分配相关
const permissionDialogVisible = ref(false)
const currentRole = ref<RoleWithPermissions | null>(null)
const permissionTreeRef = ref()
const permissionSubmitLoading = ref(false)

// 获取角色列表
const fetchRoleList = async () => {
  loading.value = true
  try {
    const params: RoleQueryParams = {
      page: pagination.page,
      size: pagination.size,
      ...(searchForm.code && { code: searchForm.code }),
      ...(searchForm.name && { name: searchForm.name }),
      ...(searchForm.status && { status: searchForm.status })
    }

    const response = await getRoles(params)
    roleList.value = response.data
    pagination.total = response.total
  } catch (error) {
    ElMessage.error('获取角色列表失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 获取权限树
const fetchPermissionTree = async () => {
  try {
    const permissions = await getPermissionTree()
    permissionTree.value = permissions
  } catch (error) {
    ElMessage.error('获取权限树失败')
    console.error(error)
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  fetchRoleList()
}

// 重置
const handleReset = () => {
  Object.assign(searchForm, {
    code: '',
    name: '',
    status: undefined
  })
  pagination.page = 1
  fetchRoleList()
}

// 分页处理
const handleSizeChange = (size: number) => {
  pagination.size = size
  pagination.page = 1
  fetchRoleList()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  fetchRoleList()
}

// 添加角色
const handleAdd = () => {
  dialogMode.value = 'add'
  dialogTitle.value = '添加角色'
  resetRoleForm()
  dialogVisible.value = true
}

// 查看角色
const handleView = async (row: Role) => {
  dialogMode.value = 'view'
  dialogTitle.value = '查看角色'

  try {
    const roleDetail = await getRole(row.id)
    Object.assign(roleForm, roleDetail)
    dialogVisible.value = true
  } catch (error) {
    ElMessage.error('获取角色详情失败')
    console.error(error)
  }
}

// 编辑角色
const handleEdit = async (row: Role) => {
  dialogMode.value = 'edit'
  dialogTitle.value = '编辑角色'

  try {
    const roleDetail = await getRole(row.id)
    Object.assign(roleForm, roleDetail)
    dialogVisible.value = true
  } catch (error) {
    ElMessage.error('获取角色详情失败')
    console.error(error)
  }
}

// 删除角色
const handleDelete = async (row: Role) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除角色 "${row.name}" 吗？此操作不可撤销！`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // TODO: 调用删除角色API
    // await deleteRole(row.id)

    ElMessage.success('删除成功')
    fetchRoleList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
      console.error(error)
    }
  }
}

// 分配权限
const handleAssignPermissions = async (row: Role) => {
  try {
    const roleDetail = await getRole(row.id)
    currentRole.value = roleDetail

    // 设置选中的权限
    const selectedPermissionIds = roleDetail.permissions.map(p => p.id)

    // 等待DOM更新后再设置选中的节点
    setTimeout(() => {
      if (permissionTreeRef.value) {
        permissionTreeRef.value.setCheckedKeys(selectedPermissionIds)
      }
    }, 100)

    permissionDialogVisible.value = true
  } catch (error) {
    ElMessage.error('获取角色详情失败')
    console.error(error)
  }
}

// 提交角色表单
const handleSubmit = async () => {
  if (!roleFormRef.value) return

  try {
    await roleFormRef.value.validate()
    submitLoading.value = true

    // TODO: 调用创建或更新角色API
    if (dialogMode.value === 'add') {
      // await createRole(roleForm)
      ElMessage.success('添加成功')
    } else {
      // await updateRole(roleForm.id, roleForm)
      ElMessage.success('更新成功')
    }

    dialogVisible.value = false
    fetchRoleList()
  } catch (error) {
    console.error(error)
  } finally {
    submitLoading.value = false
  }
}

// 提交权限分配
const handlePermissionSubmit = async () => {
  if (!currentRole.value || !permissionTreeRef.value) return

  try {
    permissionSubmitLoading.value = true
    const checkedKeys = permissionTreeRef.value.getCheckedKeys()
    const halfCheckedKeys = permissionTreeRef.value.getHalfCheckedKeys()

    // 合并全选和半选的节点ID
    const allCheckedKeys = [...checkedKeys, ...halfCheckedKeys]

    await assignRolePermissions(currentRole.value.id, allCheckedKeys as number[])
    ElMessage.success('权限分配成功')
    permissionDialogVisible.value = false
  } catch (error) {
    ElMessage.error('权限分配失败')
    console.error(error)
  } finally {
    permissionSubmitLoading.value = false
  }
}

// 重置角色表单
const resetRoleForm = () => {
  Object.assign(roleForm, {
    id: 0,
    code: '',
    name: '',
    description: '',
    status: 1
  })
}

// 关闭对话框
const handleDialogClose = () => {
  if (roleFormRef.value) {
    roleFormRef.value.resetFields()
  }
  resetRoleForm()
}

// 初始化
onMounted(() => {
  fetchRoleList()
  fetchPermissionTree()
})
</script>

<style scoped>
@import '@/styles/table-actions.css';

.role-management {
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