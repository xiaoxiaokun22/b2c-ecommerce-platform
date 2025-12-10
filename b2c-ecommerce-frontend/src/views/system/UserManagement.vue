<template>
  <div class="user-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            添加用户
          </el-button>
        </div>
      </template>

      <!-- 搜索区域 -->
      <div class="search-form">
        <el-form :inline="true" :model="searchForm" class="search-form-content">
          <el-form-item label="用户名">
            <el-input
              v-model="searchForm.username"
              placeholder="请输入用户名"
              clearable
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          <el-form-item label="邮箱">
            <el-input
              v-model="searchForm.email"
              placeholder="请输入邮箱"
              clearable
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
              <el-option label="正常" :value="1" />
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
      <el-table v-loading="loading" :data="userList" border stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="nickname" label="昵称" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="phone" label="手机号" />
        <el-table-column label="角色" width="200">
          <template #default="{ row }">
            <el-tag
              v-for="role in row.roles"
              :key="role.id"
              size="small"
              class="mr-1"
            >
              {{ role.name }}
            </el-tag>
            <span v-if="!row.roles?.length" class="text-gray-400">暂无角色</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="320" fixed="right">
          <template #default="{ row }">
            <div class="table-action-buttons" data-buttons="5">
              <el-button type="primary" link @click="handleView(row)">
                <el-icon><View /></el-icon>
                <span>查看</span>
              </el-button>
              <el-button type="primary" link @click="handleEdit(row)">
                <el-icon><Edit /></el-icon>
                <span>编辑</span>
              </el-button>
              <el-button type="success" link @click="handleAssignRoles(row)">
                <el-icon><User /></el-icon>
                <span>分配角色</span>
              </el-button>
              <el-button
                :type="row.status === 1 ? 'warning' : 'success'"
                link
                @click="handleToggleStatus(row)"
              >
                <el-icon><Switch /></el-icon>
                <span>{{ row.status === 1 ? '禁用' : '启用' }}</span>
              </el-button>
              <el-popconfirm
                :title="`确定要删除用户「${row.username}」吗？此操作不可撤销！`"
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

    <!-- 用户表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form
        ref="userFormRef"
        :model="userForm"
        :rules="userFormRules"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="userForm.username"
            placeholder="请输入用户名"
            :disabled="dialogMode === 'edit' || dialogMode === 'view'"
          />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input
            v-model="userForm.nickname"
            placeholder="请输入昵称"
            :disabled="dialogMode === 'view'"
          />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="userForm.email"
            placeholder="请输入邮箱"
            :disabled="dialogMode === 'view'"
          />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input
            v-model="userForm.phone"
            placeholder="请输入手机号"
            :disabled="dialogMode === 'view'"
          />
        </el-form-item>
        <el-form-item v-if="dialogMode === 'add'" label="密码" prop="password">
          <el-input
            v-model="userForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-select
            v-model="userForm.gender"
            placeholder="请选择性别"
            :disabled="dialogMode === 'view'"
          >
            <el-option label="未知" :value="0" />
            <el-option label="男" :value="1" />
            <el-option label="女" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="生日" prop="birthday">
          <el-date-picker
            v-model="userForm.birthday"
            type="date"
            placeholder="请选择生日"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            :disabled="dialogMode === 'view'"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="userForm.status" :disabled="dialogMode === 'view'">
            <el-radio :label="1">正常</el-radio>
            <el-radio :label="2">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="角色">
          <div v-if="userForm.roles && userForm.roles.length > 0">
            <el-tag
              v-for="role in userForm.roles"
              :key="role.id"
              size="small"
              class="mr-1"
            >
              {{ role.name }}
            </el-tag>
          </div>
          <span v-else class="text-gray-400">暂无角色</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">
            {{ dialogMode === 'view' ? '关闭' : '取消' }}
          </el-button>
          <el-button
            v-if="dialogMode !== 'view'"
            type="primary"
            @click="handleSubmit"
            :loading="submitLoading"
          >
            确认
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 分配角色对话框 -->
    <el-dialog v-model="roleDialogVisible" title="分配角色" width="500px">
      <el-form label-width="80px">
        <el-form-item label="用户">
          <span>{{ currentUser?.username }} ({{ currentUser?.nickname }})</span>
        </el-form-item>
        <el-form-item label="角色">
          <el-checkbox-group v-model="selectedRoleIds">
            <el-checkbox
              v-for="role in roleList"
              :key="role.id"
              :label="role.id"
              :value="role.id"
            >
              {{ role.name }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="roleDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleRoleSubmit" :loading="roleSubmitLoading">
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
import { Plus, Search, Refresh, View, Edit, User, Switch, Delete } from '@element-plus/icons-vue'
import { getUsersWithRoles, getUserWithRoles, assignUserRoles } from '@/api/permission'
import { getRoles } from '@/api/permission'
import type { UserWithRoles, Role, UserQueryParams } from '@/types/permission'

// 响应式数据
const loading = ref(false)
const userList = ref<UserWithRoles[]>([])
const roleList = ref<Role[]>([])

// 搜索表单
const searchForm = reactive({
  username: '',
  email: '',
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
const userFormRef = ref<FormInstance>()
const submitLoading = ref(false)

// 用户表单
const userForm = reactive({
  id: 0,
  username: '',
  nickname: '',
  email: '',
  phone: '',
  password: '',
  gender: 0,
  birthday: '',
  status: 1,
  roles: [] as Role[]
})

// 表单验证规则
const userFormRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
}

// 角色分配相关
const roleDialogVisible = ref(false)
const currentUser = ref<UserWithRoles | null>(null)
const selectedRoleIds = ref<number[]>([])
const roleSubmitLoading = ref(false)

// 获取用户列表
const fetchUserList = async () => {
  loading.value = true
  try {
    const params: UserQueryParams = {
      page: pagination.page,
      size: pagination.size,
      ...(searchForm.username && { username: searchForm.username }),
      ...(searchForm.email && { email: searchForm.email }),
      ...(searchForm.status && { status: searchForm.status })
    }

    const response = await getUsersWithRoles(params)
    userList.value = response.data
    pagination.total = response.total
  } catch (error) {
    ElMessage.error('获取用户列表失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 获取角色列表
const fetchRoleList = async () => {
  try {
    const response = await getRoles({ page: 1, size: 100 })
    roleList.value = response.data
  } catch (error) {
    ElMessage.error('获取角色列表失败')
    console.error(error)
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  fetchUserList()
}

// 重置
const handleReset = () => {
  Object.assign(searchForm, {
    username: '',
    email: '',
    status: undefined
  })
  pagination.page = 1
  fetchUserList()
}

// 分页处理
const handleSizeChange = (size: number) => {
  pagination.size = size
  pagination.page = 1
  fetchUserList()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  fetchUserList()
}

// 添加用户
const handleAdd = () => {
  dialogMode.value = 'add'
  dialogTitle.value = '添加用户'
  resetUserForm()
  dialogVisible.value = true
}

// 查看用户
const handleView = async (row: UserWithRoles) => {
  dialogMode.value = 'view'
  dialogTitle.value = '查看用户'

  try {
    const userDetail = await getUserWithRoles(row.id)
    Object.assign(userForm, userDetail)
    dialogVisible.value = true
  } catch (error) {
    ElMessage.error('获取用户详情失败')
    console.error(error)
  }
}

// 编辑用户
const handleEdit = async (row: UserWithRoles) => {
  dialogMode.value = 'edit'
  dialogTitle.value = '编辑用户'

  try {
    const userDetail = await getUserWithRoles(row.id)
    Object.assign(userForm, userDetail)
    dialogVisible.value = true
  } catch (error) {
    ElMessage.error('获取用户详情失败')
    console.error(error)
  }
}

// 删除用户
const handleDelete = async (row: UserWithRoles) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户 "${row.username}" 吗？此操作不可撤销！`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // TODO: 调用删除用户API
    // await deleteUser(row.id)

    ElMessage.success('删除成功')
    fetchUserList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
      console.error(error)
    }
  }
}

// 切换用户状态
const handleToggleStatus = async (row: UserWithRoles) => {
  const action = row.status === 1 ? '禁用' : '启用'
  try {
    await ElMessageBox.confirm(
      `确定要${action}用户 "${row.username}" 吗？`,
      `${action}确认`,
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // TODO: 调用更新用户状态API
    // await updateUserStatus(row.id, row.status === 1 ? 2 : 1)

    ElMessage.success(`${action}成功`)
    fetchUserList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(`${action}失败`)
      console.error(error)
    }
  }
}

// 分配角色
const handleAssignRoles = async (row: UserWithRoles) => {
  try {
    const userDetail = await getUserWithRoles(row.id)
    currentUser.value = userDetail
    selectedRoleIds.value = userDetail.roles.map(role => role.id)
    roleDialogVisible.value = true
  } catch (error) {
    ElMessage.error('获取用户详情失败')
    console.error(error)
  }
}

// 提交用户表单
const handleSubmit = async () => {
  if (!userFormRef.value) return

  try {
    await userFormRef.value.validate()
    submitLoading.value = true

    // TODO: 调用创建或更新用户API
    if (dialogMode.value === 'add') {
      // await createUser(userForm)
      ElMessage.success('添加成功')
    } else {
      // await updateUser(userForm.id, userForm)
      ElMessage.success('更新成功')
    }

    dialogVisible.value = false
    fetchUserList()
  } catch (error) {
    console.error(error)
  } finally {
    submitLoading.value = false
  }
}

// 提交角色分配
const handleRoleSubmit = async () => {
  if (!currentUser.value) return

  try {
    roleSubmitLoading.value = true
    await assignUserRoles(currentUser.value.id, selectedRoleIds.value)
    ElMessage.success('角色分配成功')
    roleDialogVisible.value = false
    fetchUserList()
  } catch (error) {
    ElMessage.error('角色分配失败')
    console.error(error)
  } finally {
    roleSubmitLoading.value = false
  }
}

// 重置用户表单
const resetUserForm = () => {
  Object.assign(userForm, {
    id: 0,
    username: '',
    nickname: '',
    email: '',
    phone: '',
    password: '',
    gender: 0,
    birthday: '',
    status: 1,
    roles: []
  })
}

// 关闭对话框
const handleDialogClose = () => {
  if (userFormRef.value) {
    userFormRef.value.resetFields()
  }
  resetUserForm()
}

// 初始化
onMounted(() => {
  fetchUserList()
  fetchRoleList()
})
</script>

<style scoped>
@import '@/styles/table-actions.css';

.user-management {
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

.mr-1 {
  margin-right: 4px;
}

.text-gray-400 {
  color: #9ca3af;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>