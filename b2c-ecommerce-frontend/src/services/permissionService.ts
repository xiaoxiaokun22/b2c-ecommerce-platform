import { userApi } from '@/api/user'
import type { User, Role, Permission } from '@/types/user'

// 扩展的权限类型
export enum ModulePermission {
  // 商品管理
  PRODUCT_VIEW = 'product:view',
  PRODUCT_CREATE = 'product:create',
  PRODUCT_UPDATE = 'product:update',
  PRODUCT_DELETE = 'product:delete',
  PRODUCT_EXPORT = 'product:export',
  PRODUCT_IMPORT = 'product:import',
  PRODUCT_AUDIT = 'product:audit',

  // 订单管理
  ORDER_VIEW = 'order:view',
  ORDER_CREATE = 'order:create',
  ORDER_UPDATE = 'order:update',
  ORDER_DELETE = 'order:delete',
  ORDER_EXPORT = 'order:export',
  ORDER_AUDIT = 'order:audit',
  ORDER_SHIP = 'order:ship',
  ORDER_CANCEL = 'order:cancel',
  ORDER_REFUND = 'order:refund',

  // 库存管理
  INVENTORY_VIEW = 'inventory:view',
  INVENTORY_CREATE = 'inventory:create',
  INVENTORY_UPDATE = 'inventory:update',
  INVENTORY_DELETE = 'inventory:delete',
  INVENTORY_ADJUST = 'inventory:adjust',
  INVENTORY_CHECK = 'inventory:check',
  INVENTORY_ALERT = 'inventory:alert',

  // 支付管理
  PAYMENT_VIEW = 'payment:view',
  PAYMENT_CREATE = 'payment:create',
  PAYMENT_UPDATE = 'payment:update',
  PAYMENT_DELETE = 'payment:delete',
  PAYMENT_REFUND = 'payment:refund',
  PAYMENT_CONFIG = 'payment:config',
  PAYMENT_RECONCILIATION = 'payment:reconciliation',

  // 营销管理
  MARKETING_VIEW = 'marketing:view',
  MARKETING_CREATE = 'marketing:create',
  MARKETING_UPDATE = 'marketing:update',
  MARKETING_DELETE = 'marketing:delete',
  COUPON_MANAGE = 'coupon:manage',
  PROMOTION_MANAGE = 'promotion:manage',
  SECKILL_MANAGE = 'seckill:manage',
  GROUPBUY_MANAGE = 'groupbuy:manage',

  // 用户管理
  USER_VIEW = 'user:view',
  USER_CREATE = 'user:create',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',
  USER_EXPORT = 'user:export',
  USER_IMPORT = 'user:import',

  // 角色管理
  ROLE_VIEW = 'role:view',
  ROLE_CREATE = 'role:create',
  ROLE_UPDATE = 'role:update',
  ROLE_DELETE = 'role:delete',
  ROLE_PERMISSION = 'role:permission',

  // 系统管理
  SYSTEM_CONFIG = 'system:config',
  SYSTEM_LOG = 'system:log',
  SYSTEM_MONITOR = 'system:monitor',
  SYSTEM_BACKUP = 'system:backup'
}

// 数据权限类型
export enum DataPermission {
  // 查看范围
  ALL_DATA = 'all_data',           // 全部数据
  DEPT_DATA = 'dept_data',         // 本部门数据
  SELF_DATA = 'self_data',         // 仅自己数据
  CUSTOM_DATA = 'custom_data'      // 自定义范围
}

// 操作日志类型
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  VIEW = 'view',
  EXPORT = 'export',
  IMPORT = 'import',
  AUDIT = 'audit',
  APPROVE = 'approve',
  REJECT = 'reject',
  CANCEL = 'cancel',
  SHIP = 'ship',
  REFUND = 'refund',
  ADJUST = 'adjust',
  LOGIN = 'login',
  LOGOUT = 'logout'
}

// 权限服务
export class PermissionService {
  private static instance: PermissionService
  private userPermissions: Set<string> = new Set()
  private userRole: string = ''
  private userDept: string = ''
  private dataPermissions: Record<string, DataPermission> = {}

  private constructor() {
    this.init()
  }

  static getInstance(): PermissionService {
    if (!PermissionService.instance) {
      PermissionService.instance = new PermissionService()
    }
    return PermissionService.instance
  }

  // 初始化权限
  private async init() {
    try {
      // 从本地存储或API获取用户权限信息
      const userInfo = this.getUserInfo()
      if (userInfo) {
        this.userRole = userInfo.role
        this.userDept = userInfo.dept
        this.userPermissions = new Set(userInfo.permissions || [])
        this.dataPermissions = userInfo.dataPermissions || {}
      }
    } catch (error) {
      console.error('初始化权限失败:', error)
    }
  }

  // 获取用户信息
  private getUserInfo(): any {
    const userInfoStr = localStorage.getItem('userInfo')
    return userInfoStr ? JSON.parse(userInfoStr) : null
  }

  // 检查模块权限
  hasModulePermission(permission: ModulePermission): boolean {
    return this.userPermissions.has(permission)
  }

  // 检查多个权限（需要全部满足）
  hasAllPermissions(permissions: ModulePermission[]): boolean {
    return permissions.every(p => this.userPermissions.has(p))
  }

  // 检查多个权限（满足其一即可）
  hasAnyPermission(permissions: ModulePermission[]): boolean {
    return permissions.some(p => this.userPermissions.has(p))
  }

  // 检查数据权限
  hasDataPermission(module: string, dataOwnerId?: string): boolean {
    const dataPermission = this.dataPermissions[module]

    switch (dataPermission) {
      case DataPermission.ALL_DATA:
        return true
      case DataPermission.DEPT_DATA:
        // 检查数据是否属于同一部门
        return true // 这里需要根据实际数据判断
      case DataPermission.SELF_DATA:
        // 检查数据是否属于当前用户
        return !dataOwnerId || dataOwnerId === this.getCurrentUserId()
      case DataPermission.CUSTOM_DATA:
        // 自定义权限规则
        return this.checkCustomDataPermission(module, dataOwnerId)
      default:
        return false
    }
  }

  // 获取当前用户ID
  private getCurrentUserId(): string {
    return localStorage.getItem('userId') || ''
  }

  // 检查自定义数据权限
  private checkCustomDataPermission(module: string, dataOwnerId?: string): boolean {
    // 这里可以根据实际业务实现自定义权限逻辑
    return true
  }

  // 记录操作日志
  async logOperation(data: {
    type: OperationType
    module: string
    operation: string
    targetId?: string
    targetName?: string
    data?: any
    remark?: string
  }): Promise<void> {
    try {
      const logData = {
        ...data,
        userId: this.getCurrentUserId(),
        userName: localStorage.getItem('userName') || '',
        userRole: this.userRole,
        userDept: this.userDept,
        ip: await this.getClientIP(),
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      }

      // 调用API记录日志
      // await logApi.create(logData)

      // 暂时只在控制台输出
      console.log('操作日志:', logData)
    } catch (error) {
      console.error('记录操作日志失败:', error)
    }
  }

  // 获取客户端IP
  private async getClientIP(): Promise<string> {
    try {
      // 可以调用第三方服务获取真实IP
      const response = await fetch('https://api.ipify.org?format=json')
      const data = await response.json()
      return data.ip
    } catch {
      return 'unknown'
    }
  }

  // 权限指令注册方法
  registerPermissionDirective(app: any) {
    app.directive('permission', {
      mounted(el: HTMLElement, binding: any) {
        const { value } = binding
        const permissionService = PermissionService.getInstance()

        if (value) {
          const hasPermission = Array.isArray(value)
            ? permissionService.hasAnyPermission(value)
            : permissionService.hasModulePermission(value)

          if (!hasPermission) {
            el.style.display = 'none'
            el.remove?.()
          }
        }
      }
    })

    app.directive('role', {
      mounted(el: HTMLElement, binding: any) {
        const { value } = binding
        const permissionService = PermissionService.getInstance()

        if (value && permissionService.userRole !== value) {
          el.style.display = 'none'
          el.remove?.()
        }
      }
    })
  }

  // 权限路由守卫
  checkRoutePermission(route: any): boolean {
    const permissionService = PermissionService.getInstance()

    // 检查路由是否需要权限
    if (route.meta?.permission) {
      return permissionService.hasModulePermission(route.meta.permission)
    }

    // 检查路由是否需要特定角色
    if (route.meta?.role) {
      return permissionService.userRole === route.meta.role
    }

    return true
  }

  // 获取用户可访问的菜单
  getAccessibleMenus(menus: any[]): any[] {
    const permissionService = PermissionService.getInstance()

    return menus.filter(menu => {
      // 检查菜单权限
      if (menu.meta?.permission && !permissionService.hasModulePermission(menu.meta.permission)) {
        return false
      }

      // 检查菜单角色
      if (menu.meta?.role && permissionService.userRole !== menu.meta.role) {
        return false
      }

      // 递归检查子菜单
      if (menu.children && menu.children.length > 0) {
        menu.children = permissionService.getAccessibleMenus(menu.children)
        return menu.children.length > 0
      }

      return true
    })
  }

  // 刷新权限缓存
  async refreshPermissions(): Promise<void> {
    try {
      // 重新获取用户信息
      // const response = await userApi.getCurrentUserInfo()
      // const userInfo = response.data

      // 更新权限缓存
      // localStorage.setItem('userInfo', JSON.stringify(userInfo))
      // await this.init()

      console.log('权限缓存已刷新')
    } catch (error) {
      console.error('刷新权限失败:', error)
    }
  }

  // 清除权限缓存
  clearPermissions(): void {
    this.userPermissions.clear()
    this.userRole = ''
    this.userDept = ''
    this.dataPermissions = {}
  }
}

// 创建单例实例
export const permissionService = PermissionService.getInstance()

// 导出权限检查方法
export const hasPermission = (permission: ModulePermission): boolean => {
  return permissionService.hasModulePermission(permission)
}

export const hasAnyPermission = (permissions: ModulePermission[]): boolean => {
  return permissionService.hasAnyPermission(permissions)
}

export const hasAllPermissions = (permissions: ModulePermission[]): boolean => {
  return permissionService.hasAllPermissions(permissions)
}

export const hasDataPermission = (module: string, dataOwnerId?: string): boolean => {
  return permissionService.hasDataPermission(module, dataOwnerId)
}

// 导出操作日志记录方法
export const logOperation = (data: {
  type: OperationType
  module: string
  operation: string
  targetId?: string
  targetName?: string
  data?: any
  remark?: string
}) => {
  return permissionService.logOperation(data)
}

export default permissionService