// 权限类型枚举
export enum PermissionType {
  MENU = 'menu',     // 菜单权限
  BUTTON = 'button', // 按钮权限
  API = 'api'        // API权限
}

// 权限接口
export interface Permission {
  id: number
  code: string        // 权限编码
  name: string        // 权限名称
  description?: string // 权限描述
  type: PermissionType
  parentId?: number   // 父权限ID，用于树形结构
  path?: string       // 菜单路径
  icon?: string       // 图标
  sort: number        // 排序
  status: number      // 状态：1-启用，2-禁用
  createTime: string
  updateTime: string
  children?: Permission[] // 子权限
}

// 角色接口
export interface Role {
  id: number
  code: string        // 角色编码
  name: string        // 角色名称
  description?: string // 角色描述
  status: number      // 状态：1-启用，2-禁用
  createTime: string
  updateTime: string
}

// 用户-角色关联
export interface UserRole {
  userId: number
  roleId: number
}

// 角色-权限关联
export interface RolePermission {
  roleId: number
  permissionId: number
}

// 导入User类型
import type { User } from './user'

// 带角色的用户信息
export interface UserWithRoles extends User {
  roles: Role[]
}

// 带权限的角色信息
export interface RoleWithPermissions extends Role {
  permissions: Permission[]
}

// 权限树形数据
export interface PermissionTree extends Permission {
  children: PermissionTree[]
}

// 角色表单数据
export interface RoleForm {
  code: string
  name: string
  description?: string
  status: number
}

// 权限表单数据
export interface PermissionForm {
  code: string
  name: string
  description?: string
  type: PermissionType
  parentId?: number
  path?: string
  icon?: string
  sort: number
  status: number
}

// 用户角色分配表单
export interface UserRoleForm {
  userId: number
  roleIds: number[]
}

// 角色权限分配表单
export interface RolePermissionForm {
  roleId: number
  permissionIds: number[]
}

// 查询参数
export interface RoleQueryParams {
  page: number
  size: number
  code?: string
  name?: string
  status?: number
}

export interface PermissionQueryParams {
  page: number
  size: number
  code?: string
  name?: string
  type?: PermissionType
  status?: number
}

export interface UserQueryParams {
  page: number
  size: number
  username?: string
  email?: string
  status?: number
}