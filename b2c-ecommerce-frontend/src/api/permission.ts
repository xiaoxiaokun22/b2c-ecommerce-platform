import { permissionApi, roleApi, userPermissionApi } from './mock/permission'
import type {
  Permission,
  Role,
  UserWithRoles,
  RoleWithPermissions,
  PermissionTree,
  RoleQueryParams,
  PermissionQueryParams,
  UserQueryParams,
  RoleForm,
  PermissionForm,
  UserRoleForm,
  RolePermissionForm
} from '@/types/permission'

// 权限管理API
export const getPermissions = (params: PermissionQueryParams) => {
  return permissionApi.getPermissions(params)
}

export const getPermissionTree = (): Promise<Permission[]> => {
  return permissionApi.getPermissionTree()
}

export const getPermission = (id: number): Promise<Permission> => {
  return permissionApi.getPermission(id)
}

export const createPermission = (data: Omit<PermissionForm, 'id' | 'createTime' | 'updateTime'>) => {
  return permissionApi.createPermission(data as any)
}

export const updatePermission = (id: number, data: Partial<PermissionForm>) => {
  return permissionApi.updatePermission(id, data as any)
}

export const deletePermission = (id: number) => {
  return permissionApi.deletePermission(id)
}

// 角色管理API
export const getRoles = (params: RoleQueryParams) => {
  return roleApi.getRoles(params)
}

export const getRole = (id: number): Promise<RoleWithPermissions> => {
  return roleApi.getRole(id)
}

export const createRole = (data: Omit<RoleForm, 'id' | 'createTime' | 'updateTime'>) => {
  return roleApi.createRole(data as any)
}

export const updateRole = (id: number, data: Partial<RoleForm>) => {
  return roleApi.updateRole(id, data as any)
}

export const deleteRole = (id: number) => {
  return roleApi.deleteRole(id)
}

export const assignRolePermissions = (roleId: number, permissionIds: number[]) => {
  return roleApi.assignRolePermissions(roleId, permissionIds)
}

// 用户权限管理API
export const getUsersWithRoles = (params: UserQueryParams) => {
  return userPermissionApi.getUsersWithRoles(params)
}

export const getUserWithRoles = (id: number): Promise<UserWithRoles> => {
  return userPermissionApi.getUserWithRoles(id)
}

export const assignUserRoles = (userId: number, roleIds: number[]) => {
  return userPermissionApi.assignUserRoles(userId, roleIds)
}