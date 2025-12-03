import type {
  Permission,
  Role,
  UserWithRoles,
  RoleWithPermissions,
  PermissionType,
  RoleQueryParams,
  PermissionQueryParams,
  UserQueryParams
} from '@/types/permission'
import type { User } from '@/types/user'

// 模拟权限数据
const mockPermissions: Permission[] = [
  // 系统管理
  {
    id: 1,
    code: 'system',
    name: '系统管理',
    description: '系统管理相关权限',
    type: 'menu' as PermissionType,
    parentId: null,
    path: '/system',
    icon: 'Setting',
    sort: 1,
    status: 1,
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00'
  },
  {
    id: 2,
    code: 'user:manage',
    name: '用户管理',
    description: '用户管理页面和操作权限',
    type: 'menu' as PermissionType,
    parentId: 1,
    path: '/system/users',
    icon: 'User',
    sort: 1,
    status: 1,
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00'
  },
  {
    id: 3,
    code: 'user:view',
    name: '查看用户',
    description: '查看用户列表和详情',
    type: 'button' as PermissionType,
    parentId: 2,
    sort: 1,
    status: 1,
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00'
  },
  {
    id: 4,
    code: 'user:create',
    name: '创建用户',
    description: '创建新用户',
    type: 'button' as PermissionType,
    parentId: 2,
    sort: 2,
    status: 1,
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00'
  },
  {
    id: 5,
    code: 'user:edit',
    name: '编辑用户',
    description: '编辑用户信息',
    type: 'button' as PermissionType,
    parentId: 2,
    sort: 3,
    status: 1,
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00'
  },
  {
    id: 6,
    code: 'user:delete',
    name: '删除用户',
    description: '删除用户',
    type: 'button' as PermissionType,
    parentId: 2,
    sort: 4,
    status: 1,
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00'
  },
  {
    id: 7,
    code: 'role:manage',
    name: '角色管理',
    description: '角色管理页面和操作权限',
    type: 'menu' as PermissionType,
    parentId: 1,
    path: '/system/roles',
    icon: 'UserFilled',
    sort: 2,
    status: 1,
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00'
  },
  {
    id: 8,
    code: 'role:view',
    name: '查看角色',
    description: '查看角色列表和详情',
    type: 'button' as PermissionType,
    parentId: 7,
    sort: 1,
    status: 1,
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00'
  },
  {
    id: 9,
    code: 'role:create',
    name: '创建角色',
    description: '创建新角色',
    type: 'button' as PermissionType,
    parentId: 7,
    sort: 2,
    status: 1,
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00'
  },
  {
    id: 10,
    code: 'role:edit',
    name: '编辑角色',
    description: '编辑角色信息',
    type: 'button' as PermissionType,
    parentId: 7,
    sort: 3,
    status: 1,
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00'
  },
  {
    id: 11,
    code: 'role:delete',
    name: '删除角色',
    description: '删除角色',
    type: 'button' as PermissionType,
    parentId: 7,
    sort: 4,
    status: 1,
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00'
  },
  {
    id: 12,
    code: 'permission:manage',
    name: '权限管理',
    description: '权限管理页面和操作权限',
    type: 'menu' as PermissionType,
    parentId: 1,
    path: '/system/permissions',
    icon: 'Lock',
    sort: 3,
    status: 1,
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00'
  },
  {
    id: 13,
    code: 'permission:view',
    name: '查看权限',
    description: '查看权限列表和详情',
    type: 'button' as PermissionType,
    parentId: 12,
    sort: 1,
    status: 1,
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00'
  },
  {
    id: 14,
    code: 'permission:create',
    name: '创建权限',
    description: '创建新权限',
    type: 'button' as PermissionType,
    parentId: 12,
    sort: 2,
    status: 1,
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00'
  },
  {
    id: 15,
    code: 'permission:edit',
    name: '编辑权限',
    description: '编辑权限信息',
    type: 'button' as PermissionType,
    parentId: 12,
    sort: 3,
    status: 1,
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00'
  },
  {
    id: 16,
    code: 'permission:delete',
    name: '删除权限',
    description: '删除权限',
    type: 'button' as PermissionType,
    parentId: 12,
    sort: 4,
    status: 1,
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00'
  },
  // 商品管理
  {
    id: 17,
    code: 'product',
    name: '商品管理',
    description: '商品管理相关权限',
    type: 'menu' as PermissionType,
    parentId: null,
    path: '/product',
    icon: 'Goods',
    sort: 2,
    status: 1,
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00'
  },
  {
    id: 18,
    code: 'product:view',
    name: '查看商品',
    description: '查看商品列表和详情',
    type: 'button' as PermissionType,
    parentId: 17,
    sort: 1,
    status: 1,
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00'
  },
  {
    id: 19,
    code: 'product:create',
    name: '创建商品',
    description: '创建新商品',
    type: 'button' as PermissionType,
    parentId: 17,
    sort: 2,
    status: 1,
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00'
  },
  {
    id: 20,
    code: 'product:edit',
    name: '编辑商品',
    description: '编辑商品信息',
    type: 'button' as PermissionType,
    parentId: 17,
    sort: 3,
    status: 1,
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00'
  },
  {
    id: 21,
    code: 'product:delete',
    name: '删除商品',
    description: '删除商品',
    type: 'button' as PermissionType,
    parentId: 17,
    sort: 4,
    status: 1,
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00'
  }
]

// 模拟角色数据
const mockRoles: Role[] = [
  {
    id: 1,
    code: 'SUPER_ADMIN',
    name: '超级管理员',
    description: '系统超级管理员，拥有所有权限',
    status: 1,
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00'
  },
  {
    id: 2,
    code: 'ADMIN',
    name: '管理员',
    description: '系统管理员，拥有大部分权限',
    status: 1,
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00'
  },
  {
    id: 3,
    code: 'USER_MANAGER',
    name: '用户管理员',
    description: '负责用户管理的管理员',
    status: 1,
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00'
  },
  {
    id: 4,
    code: 'PRODUCT_MANAGER',
    name: '商品管理员',
    description: '负责商品管理的管理员',
    status: 1,
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00'
  },
  {
    id: 5,
    code: 'USER',
    name: '普通用户',
    description: '普通用户，只有基本权限',
    status: 1,
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00'
  }
]

// 模拟用户数据
const mockUsers: User[] = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    phone: '13800138001',
    nickname: '超级管理员',
    gender: 1,
    birthday: '1990-01-01',
    status: 1,
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00'
  },
  {
    id: 2,
    username: 'manager',
    email: 'manager@example.com',
    phone: '13800138002',
    nickname: '管理员',
    gender: 1,
    birthday: '1992-05-15',
    status: 1,
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00'
  },
  {
    id: 3,
    username: 'user001',
    email: 'user001@example.com',
    phone: '13800138003',
    nickname: '用户001',
    gender: 2,
    birthday: '1995-10-20',
    status: 1,
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00'
  },
  {
    id: 4,
    username: 'user002',
    email: 'user002@example.com',
    phone: '13800138004',
    nickname: '用户002',
    gender: 1,
    birthday: '1993-07-08',
    status: 2,
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00'
  }
]

// 用户角色关联
const mockUserRoles = [
  { userId: 1, roleId: 1 }, // admin -> SUPER_ADMIN
  { userId: 2, roleId: 2 }, // manager -> ADMIN
  { userId: 3, roleId: 5 }, // user001 -> USER
  { userId: 4, roleId: 5 }  // user002 -> USER
]

// 角色权限关联
const mockRolePermissions = [
  // 超级管理员拥有所有权限
  ...mockPermissions.map(p => ({ roleId: 1, permissionId: p.id })),

  // 管理员权限（除了超级管理员专属权限）
  ...mockPermissions.filter(p => p.id !== 1).map(p => ({ roleId: 2, permissionId: p.id })),

  // 用户管理员权限
  { roleId: 3, permissionId: 3 }, // user:view
  { roleId: 3, permissionId: 4 }, // user:create
  { roleId: 3, permissionId: 5 }, // user:edit
  { roleId: 3, permissionId: 8 }, // role:view
  { roleId: 3, permissionId: 13 }, // permission:view

  // 商品管理员权限
  { roleId: 4, permissionId: 18 }, // product:view
  { roleId: 4, permissionId: 19 }, // product:create
  { roleId: 4, permissionId: 20 }, // product:edit

  // 普通用户权限
  { roleId: 5, permissionId: 18 }  // product:view
]

// 权限相关API
export const permissionApi = {
  // 获取权限列表
  getPermissions: async (params: PermissionQueryParams) => {
    await new Promise(resolve => setTimeout(resolve, 300))

    let filteredPermissions = [...mockPermissions]

    if (params.code) {
      filteredPermissions = filteredPermissions.filter(p =>
        p.code.toLowerCase().includes(params.code!.toLowerCase())
      )
    }
    if (params.name) {
      filteredPermissions = filteredPermissions.filter(p =>
        p.name.toLowerCase().includes(params.name!.toLowerCase())
      )
    }
    if (params.type) {
      filteredPermissions = filteredPermissions.filter(p => p.type === params.type)
    }
    if (params.status) {
      filteredPermissions = filteredPermissions.filter(p => p.status === params.status)
    }

    const start = (params.page - 1) * params.size
    const end = start + params.size

    return {
      data: filteredPermissions.slice(start, end),
      total: filteredPermissions.length,
      page: params.page,
      size: params.size
    }
  },

  // 获取权限树形结构
  getPermissionTree: async () => {
    await new Promise(resolve => setTimeout(resolve, 300))

    const buildTree = (permissions: Permission[], parentId: number | null = null): Permission[] => {
      return permissions
        .filter(p => p.parentId === parentId)
        .sort((a, b) => a.sort - b.sort)
        .map(permission => ({
          ...permission,
          children: buildTree(permissions, permission.id)
        }))
    }

    return buildTree(mockPermissions)
  },

  // 获取权限详情
  getPermission: async (id: number) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    const permission = mockPermissions.find(p => p.id === id)
    if (!permission) {
      throw new Error('权限不存在')
    }
    return permission
  },

  // 创建权限
  createPermission: async (data: Omit<Permission, 'id' | 'createTime' | 'updateTime'>) => {
    await new Promise(resolve => setTimeout(resolve, 300))

    const newPermission: Permission = {
      ...data,
      id: Math.max(...mockPermissions.map(p => p.id)) + 1,
      createTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
      updateTime: new Date().toISOString().replace('T', ' ').substring(0, 19)
    }

    mockPermissions.push(newPermission)
    return newPermission
  },

  // 更新权限
  updatePermission: async (id: number, data: Partial<Permission>) => {
    await new Promise(resolve => setTimeout(resolve, 300))

    const index = mockPermissions.findIndex(p => p.id === id)
    if (index === -1) {
      throw new Error('权限不存在')
    }

    mockPermissions[index] = {
      ...mockPermissions[index],
      ...data,
      updateTime: new Date().toISOString().replace('T', ' ').substring(0, 19)
    }

    return mockPermissions[index]
  },

  // 删除权限
  deletePermission: async (id: number) => {
    await new Promise(resolve => setTimeout(resolve, 300))

    const index = mockPermissions.findIndex(p => p.id === id)
    if (index === -1) {
      throw new Error('权限不存在')
    }

    // 检查是否有子权限
    const hasChildren = mockPermissions.some(p => p.parentId === id)
    if (hasChildren) {
      throw new Error('存在子权限，无法删除')
    }

    mockPermissions.splice(index, 1)

    // 删除相关的角色权限关联
    const rpIndex = mockRolePermissions.findIndex(rp => rp.permissionId === id)
    if (rpIndex !== -1) {
      mockRolePermissions.splice(rpIndex, 1)
    }

    return { success: true }
  }
}

// 角色相关API
export const roleApi = {
  // 获取角色列表
  getRoles: async (params: RoleQueryParams) => {
    await new Promise(resolve => setTimeout(resolve, 300))

    let filteredRoles = [...mockRoles]

    if (params.code) {
      filteredRoles = filteredRoles.filter(r =>
        r.code.toLowerCase().includes(params.code!.toLowerCase())
      )
    }
    if (params.name) {
      filteredRoles = filteredRoles.filter(r =>
        r.name.toLowerCase().includes(params.name!.toLowerCase())
      )
    }
    if (params.status) {
      filteredRoles = filteredRoles.filter(r => r.status === params.status)
    }

    const start = (params.page - 1) * params.size
    const end = start + params.size

    return {
      data: filteredRoles.slice(start, end),
      total: filteredRoles.length,
      page: params.page,
      size: params.size
    }
  },

  // 获取角色详情
  getRole: async (id: number) => {
    await new Promise(resolve => setTimeout(resolve, 200))

    const role = mockRoles.find(r => r.id === id)
    if (!role) {
      throw new Error('角色不存在')
    }

    // 获取角色权限
    const rolePermissionIds = mockRolePermissions
      .filter(rp => rp.roleId === id)
      .map(rp => rp.permissionId)

    const permissions = mockPermissions.filter(p => rolePermissionIds.includes(p.id))

    return {
      ...role,
      permissions
    } as RoleWithPermissions
  },

  // 创建角色
  createRole: async (data: Omit<Role, 'id' | 'createTime' | 'updateTime'>) => {
    await new Promise(resolve => setTimeout(resolve, 300))

    const newRole: Role = {
      ...data,
      id: Math.max(...mockRoles.map(r => r.id)) + 1,
      createTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
      updateTime: new Date().toISOString().replace('T', ' ').substring(0, 19)
    }

    mockRoles.push(newRole)
    return newRole
  },

  // 更新角色
  updateRole: async (id: number, data: Partial<Role>) => {
    await new Promise(resolve => setTimeout(resolve, 300))

    const index = mockRoles.findIndex(r => r.id === id)
    if (index === -1) {
      throw new Error('角色不存在')
    }

    mockRoles[index] = {
      ...mockRoles[index],
      ...data,
      updateTime: new Date().toISOString().replace('T', ' ').substring(0, 19)
    }

    return mockRoles[index]
  },

  // 删除角色
  deleteRole: async (id: number) => {
    await new Promise(resolve => setTimeout(resolve, 300))

    const index = mockRoles.findIndex(r => r.id === id)
    if (index === -1) {
      throw new Error('角色不存在')
    }

    // 检查是否有用户使用该角色
    const hasUsers = mockUserRoles.some(ur => ur.roleId === id)
    if (hasUsers) {
      throw new Error('该角色下存在用户，无法删除')
    }

    mockRoles.splice(index, 1)

    // 删除相关的用户角色关联和角色权限关联
    mockUserRoles.splice(0, mockUserRoles.length, ...mockUserRoles.filter(ur => ur.roleId !== id))
    mockRolePermissions.splice(0, mockRolePermissions.length, ...mockRolePermissions.filter(rp => rp.roleId !== id))

    return { success: true }
  },

  // 分配角色权限
  assignRolePermissions: async (roleId: number, permissionIds: number[]) => {
    await new Promise(resolve => setTimeout(resolve, 300))

    // 删除原有的角色权限关联
    mockRolePermissions.splice(0, mockRolePermissions.length, ...mockRolePermissions.filter(rp => rp.roleId !== roleId))

    // 添加新的角色权限关联
    permissionIds.forEach(permissionId => {
      mockRolePermissions.push({ roleId, permissionId })
    })

    return { success: true }
  }
}

// 用户相关API（扩展原有用户API）
export const userPermissionApi = {
  // 获取用户列表（包含角色信息）
  getUsersWithRoles: async (params: UserQueryParams) => {
    await new Promise(resolve => setTimeout(resolve, 300))

    let filteredUsers = [...mockUsers]

    if (params.username) {
      filteredUsers = filteredUsers.filter(u =>
        u.username.toLowerCase().includes(params.username!.toLowerCase())
      )
    }
    if (params.email) {
      filteredUsers = filteredUsers.filter(u =>
        u.email.toLowerCase().includes(params.email!.toLowerCase())
      )
    }
    if (params.status) {
      filteredUsers = filteredUsers.filter(u => u.status === params.status)
    }

    const start = (params.page - 1) * params.size
    const end = start + params.size

    const usersWithRoles = filteredUsers.slice(start, end).map(user => {
      const userRoles = mockUserRoles
        .filter(ur => ur.userId === user.id)
        .map(ur => mockRoles.find(r => r.id === ur.roleId))
        .filter(Boolean) as Role[]

      return {
        ...user,
        roles: userRoles
      } as UserWithRoles
    })

    return {
      data: usersWithRoles,
      total: filteredUsers.length,
      page: params.page,
      size: params.size
    }
  },

  // 获取用户详情（包含角色信息）
  getUserWithRoles: async (id: number) => {
    await new Promise(resolve => setTimeout(resolve, 200))

    const user = mockUsers.find(u => u.id === id)
    if (!user) {
      throw new Error('用户不存在')
    }

    const userRoles = mockUserRoles
      .filter(ur => ur.userId === id)
      .map(ur => mockRoles.find(r => r.id === ur.roleId))
      .filter(Boolean) as Role[]

    return {
      ...user,
      roles: userRoles
    } as UserWithRoles
  },

  // 分配用户角色
  assignUserRoles: async (userId: number, roleIds: number[]) => {
    await new Promise(resolve => setTimeout(resolve, 300))

    // 删除原有的用户角色关联
    mockUserRoles.splice(0, mockUserRoles.length, ...mockUserRoles.filter(ur => ur.userId !== userId))

    // 添加新的用户角色关联
    roleIds.forEach(roleId => {
      mockUserRoles.push({ userId, roleId })
    })

    return { success: true }
  }
}