// 促销规则引擎 - 解决促销冲突和优先级问题

import { ElMessage } from 'element-plus'

// 促销类型枚举
export enum PromotionType {
  COUPON = 'coupon',         // 优惠券
  DISCOUNT = 'discount',     // 折扣
  FULL_REDUCTION = 'full_reduction',  // 满减
  SECKILL = 'seckill',       // 秒杀
  GROUPBUY = 'groupbuy',     // 团购
  GIFT = 'gift',             // 赠品
  SHIPPING_FREE = 'shipping_free'  // 包邮
}

// 促销优先级
export const PromotionPriority = {
  [PromotionType.SECKILL]: 1,      // 秒杀优先级最高
  [PromotionType.GROUPBUY]: 2,     // 团购次之
  [PromotionType.COUPON]: 3,       // 优惠券
  [PromotionType.FULL_REDUCTION]: 4, // 满减
  [PromotionType.DISCOUNT]: 5,     // 商品折扣
  [PromotionType.GIFT]: 6,         // 赠品
  [PromotionType.SHIPPING_FREE]: 7 // 包邮优先级最低
} as const

// 促销规则
export interface PromotionRule {
  id: string
  name: string
  type: PromotionType
  priority: number
  exclusive: boolean  // 是否互斥（独占）
  stackable: boolean  // 是否可叠加
  conditions: PromotionCondition[]
  actions: PromotionAction[]
  validFrom: string
  validTo: string
  status: 'active' | 'inactive'
  userLimits?: UserLimit
  productLimits?: ProductLimit
}

// 促销条件
export interface PromotionCondition {
  type: 'cart_amount' | 'cart_quantity' | 'user_level' | 'product_category' | 'product_brand' | 'new_user' | 'first_order'
  operator: 'eq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'not_in'
  value: any
  description?: string
}

// 促销动作
export interface PromotionAction {
  type: 'discount_percent' | 'discount_amount' | 'gift_product' | 'shipping_free' | 'coupon_issue' | 'points_multiply'
  value: any
  description?: string
}

// 用户限制
export interface UserLimit {
  userLevels?: number[]      // 用户等级限制
  newUserOnly?: boolean      // 仅新用户
  usedLimit?: number         // 使用次数限制
  dailyLimit?: number        // 每日使用限制
}

// 商品限制
export interface ProductLimit {
  productIds?: string[]      // 指定商品
  categoryIds?: number[]     // 指定分类
  brandIds?: number[]        // 指定品牌
  excludeIds?: string[]      // 排除商品
}

// 购物车项目
export interface CartItem {
  productId: string
  skuId: string
  quantity: number
  price: number
  totalPrice: number
  categoryId: number
  brandId: number
  isSeckill?: boolean
  isGroupbuy?: boolean
}

// 购物车信息
export interface CartInfo {
  items: CartItem[]
  totalAmount: number
  totalQuantity: number
  userId: string
  userLevel: number
  isNewUser: boolean
  isFirstOrder: boolean
}

// 促销计算结果
export interface PromotionResult {
  applicableRules: ApplicableRule[]
  totalDiscount: number
  finalAmount: number
  appliedRules: AppliedRule[]
  conflictingRules: string[]
  giftItems: CartItem[]
  freeShipping: boolean
  pointsEarned: number
}

// 可应用的规则
export interface ApplicableRule {
  rule: PromotionRule
  discountAmount: number
  applicableItems: CartItem[]
}

// 已应用的规则
export interface AppliedRule extends ApplicableRule {
  appliedAt: string
}

// 规则冲突类型
export enum ConflictType {
  EXCLUSIVE = 'exclusive',     // 互斥规则冲突
  PRIORITY = 'priority',       // 优先级冲突
  OVERLAP = 'overlap'          // 适用范围重叠
}

// 规则冲突
export interface RuleConflict {
  type: ConflictType
  ruleIds: string[]
  description: string
  resolution: 'auto' | 'manual'
  resolved?: boolean
}

// 促销规则引擎
export class PromotionRuleEngine {
  private rules: Map<string, PromotionRule> = new Map()
  private conflicts: RuleConflict[] = []

  /**
   * 添加促销规则
   */
  addRule(rule: PromotionRule): void {
    this.rules.set(rule.id, rule)
    this.detectConflicts(rule)
  }

  /**
   * 移除促销规则
   */
  removeRule(ruleId: string): void {
    this.rules.delete(ruleId)
    this.conflicts = this.conflicts.filter(c => !c.ruleIds.includes(ruleId))
  }

  /**
   * 检测规则冲突
   */
  private detectConflicts(newRule?: PromotionRule): void {
    const ruleList = Array.from(this.rules.values())
    const newConflicts: RuleConflict[] = []

    // 检查互斥规则
    for (let i = 0; i < ruleList.length; i++) {
      for (let j = i + 1; j < ruleList.length; j++) {
        const rule1 = ruleList[i]
        const rule2 = ruleList[j]

        // 如果两个规则都是互斥的且类型相同
        if (rule1.exclusive && rule2.exclusive && rule1.type === rule2.type) {
          newConflicts.push({
            type: ConflictType.EXCLUSIVE,
            ruleIds: [rule1.id, rule2.id],
            description: `互斥规则冲突：${rule1.name} 和 ${rule2.name}`,
            resolution: 'auto'  // 自动选择优先级高的
          })
        }

        // 检查优先级冲突
        if (rule1.priority === rule2.priority && rule1.type !== rule2.type) {
          newConflicts.push({
            type: ConflictType.PRIORITY,
            ruleIds: [rule1.id, rule2.id],
            description: `优先级冲突：${rule1.name} 和 ${rule2.name} 具有相同优先级`,
            resolution: 'manual'  // 需要手动选择
          })
        }
      }
    }

    this.conflicts = newConflicts
  }

  /**
   * 计算最优促销方案
   */
  calculateOptimalPromotion(cartInfo: CartInfo): PromotionResult {
    // 1. 筛选适用的规则
    const applicableRules = this.filterApplicableRules(cartInfo)

    // 2. 处理冲突
    const { resolvedRules, conflicts } = this.resolveConflicts(applicableRules)

    // 3. 按优先级排序
    const sortedRules = this.sortRulesByPriority(resolvedRules)

    // 4. 逐个应用规则
    const appliedRules: AppliedRule[] = []
    let totalDiscount = 0
    let cartItems = [...cartInfo.items]
    const giftItems: CartItem[] = []
    let freeShipping = false
    let pointsEarned = 0

    for (const rule of sortedRules) {
      // 检查是否可以叠加
      if (!rule.stackable && appliedRules.length > 0) {
        // 如果不可叠加，检查是否与已应用规则冲突
        const hasConflict = appliedRules.some(applied =>
          this.hasRuleConflict(applied.rule, rule)
        )
        if (hasConflict) continue
      }

      // 应用规则
      const result = this.applyRule(rule, cartItems, cartInfo)
      if (result.discountAmount > 0) {
        totalDiscount += result.discountAmount
        appliedRules.push({
          ...result,
          appliedAt: new Date().toISOString()
        })

        // 更新购物车项目（如果规则影响了商品价格）
        if (rule.type === PromotionType.DISCOUNT || rule.type === PromotionType.SECKILL) {
          cartItems = result.applicableItems.map(item => ({
            ...item,
            price: item.price - (result.discountAmount / item.quantity)
          }))
        }

        // 处理赠品
        if (result.giftItems) {
          giftItems.push(...result.giftItems)
        }

        // 处理包邮
        if (rule.actions.some(a => a.type === 'shipping_free')) {
          freeShipping = true
        }

        // 处理积分
        const pointsAction = rule.actions.find(a => a.type === 'points_multiply')
        if (pointsAction) {
          pointsEarned += Math.floor(totalAmount * pointsAction.value)
        }
      }
    }

    const finalAmount = cartInfo.totalAmount - totalDiscount

    return {
      applicableRules: applicableRules.map(rule => ({
        rule,
        discountAmount: this.calculateRuleDiscount(rule, cartItems, cartInfo),
        applicableItems: this.getApplicableItems(rule, cartItems)
      })),
      totalDiscount,
      finalAmount,
      appliedRules,
      conflictingRules: conflicts.map(c => c.description),
      giftItems,
      freeShipping,
      pointsEarned
    }
  }

  /**
   * 筛选适用的规则
   */
  private filterApplicableRules(cartInfo: CartInfo): PromotionRule[] {
    return Array.from(this.rules.values()).filter(rule => {
      // 检查规则状态
      if (rule.status !== 'active') return false

      // 检查时间有效性
      const now = new Date()
      const validFrom = new Date(rule.validFrom)
      const validTo = new Date(rule.validTo)
      if (now < validFrom || now > validTo) return false

      // 检查用户限制
      if (!this.checkUserLimits(rule.userLimits, cartInfo)) return false

      // 检查商品限制
      if (!this.checkProductLimits(rule.productLimits, cartInfo)) return false

      // 检查其他条件
      return this.checkConditions(rule.conditions, cartInfo)
    })
  }

  /**
   * 检查用户限制
   */
  private checkUserLimits(userLimits: UserLimit | undefined, cartInfo: CartInfo): boolean {
    if (!userLimits) return true

    // 检查用户等级
    if (userLimits.userLevels && !userLimits.userLevels.includes(cartInfo.userLevel)) {
      return false
    }

    // 检查是否为新用户
    if (userLimits.newUserOnly && !cartInfo.isNewUser) {
      return false
    }

    // TODO: 检查使用次数限制
    // TODO: 检查每日使用限制

    return true
  }

  /**
   * 检查商品限制
   */
  private checkProductLimits(productLimits: ProductLimit | undefined, cartInfo: CartInfo): boolean {
    if (!productLimits) return true

    const hasValidItem = cartInfo.items.some(item => {
      // 检查指定商品
      if (productLimits.productIds && !productLimits.productIds.includes(item.productId)) {
        return false
      }

      // 检查排除商品
      if (productLimits.excludeIds && productLimits.excludeIds.includes(item.productId)) {
        return false
      }

      // 检查分类
      if (productLimits.categoryIds && !productLimits.categoryIds.includes(item.categoryId)) {
        return false
      }

      // 检查品牌
      if (productLimits.brandIds && !productLimits.brandIds.includes(item.brandId)) {
        return false
      }

      return true
    })

    return hasValidItem
  }

  /**
   * 检查其他条件
   */
  private checkConditions(conditions: PromotionCondition[], cartInfo: CartInfo): boolean {
    return conditions.every(condition => {
      switch (condition.type) {
        case 'cart_amount':
          return this.compareValue(cartInfo.totalAmount, condition.operator, condition.value)
        case 'cart_quantity':
          return this.compareValue(cartInfo.totalQuantity, condition.operator, condition.value)
        case 'user_level':
          return this.compareValue(cartInfo.userLevel, condition.operator, condition.value)
        case 'new_user':
          return condition.value ? cartInfo.isNewUser : !cartInfo.isNewUser
        case 'first_order':
          return condition.value ? cartInfo.isFirstOrder : !cartInfo.isFirstOrder
        default:
          return true
      }
    })
  }

  /**
   * 比较值
   */
  private compareValue(actual: any, operator: string, expected: any): boolean {
    switch (operator) {
      case 'eq': return actual === expected
      case 'gt': return actual > expected
      case 'gte': return actual >= expected
      case 'lt': return actual < expected
      case 'lte': return actual <= expected
      case 'in': return expected.includes(actual)
      case 'not_in': return !expected.includes(actual)
      default: return false
    }
  }

  /**
   * 解决规则冲突
   */
  private resolveConflicts(rules: PromotionRule[]): { resolvedRules: PromotionRule[]; conflicts: RuleConflict[] } {
    const resolvedRules: PromotionRule[] = []
    const conflicts: RuleConflict[] = []

    // 按类型分组
    const groupedRules = this.groupRulesByType(rules)

    // 处理互斥规则
    for (const [type, typeRules] of Object.entries(groupedRules)) {
      if (typeRules.length > 1) {
        // 按优先级排序，选择优先级最高的
        const sortedRules = typeRules.sort((a, b) => a.priority - b.priority)
        resolvedRules.push(sortedRules[0])

        // 记录冲突
        conflicts.push({
          type: ConflictType.EXCLUSIVE,
          ruleIds: sortedRules.slice(1).map(r => r.id),
          description: `互斥类型 ${type} 的规则被忽略`,
          resolution: 'auto',
          resolved: true
        })
      } else {
        resolvedRules.push(...typeRules)
      }
    }

    return { resolvedRules, conflicts }
  }

  /**
   * 按类型分组规则
   */
  private groupRulesByType(rules: PromotionRule[]): Record<string, PromotionRule[]> {
    const groups: Record<string, PromotionRule[]> = {}

    rules.forEach(rule => {
      if (!groups[rule.type]) {
        groups[rule.type] = []
      }
      groups[rule.type].push(rule)
    })

    return groups
  }

  /**
   * 按优先级排序规则
   */
  private sortRulesByPriority(rules: PromotionRule[]): PromotionRule[] {
    return rules.sort((a, b) => a.priority - b.priority)
  }

  /**
   * 检查规则是否冲突
   */
  private hasRuleConflict(rule1: PromotionRule, rule2: PromotionRule): boolean {
    // 如果都是互斥规则且类型相同，则冲突
    if (rule1.exclusive && rule2.exclusive && rule1.type === rule2.type) {
      return true
    }

    // 如果类型相同但不可叠加，则冲突
    if (rule1.type === rule2.type && (!rule1.stackable || !rule2.stackable)) {
      return true
    }

    return false
  }

  /**
   * 应用规则
   */
  private applyRule(rule: PromotionRule, items: CartItem[], cartInfo: CartInfo): ApplicableRule {
    const applicableItems = this.getApplicableItems(rule, items)
    const discountAmount = this.calculateRuleDiscount(rule, applicableItems, cartInfo)
    const giftItems: CartItem[] = []

    // 处理赠品
    const giftAction = rule.actions.find(a => a.type === 'gift_product')
    if (giftAction) {
      // TODO: 添加赠品到购物车
    }

    return {
      rule,
      discountAmount,
      applicableItems: giftItems.length > 0 ? [...applicableItems, ...giftItems] : applicableItems
    }
  }

  /**
   * 获取适用的商品
   */
  private getApplicableItems(rule: PromotionRule, items: CartItem[]): CartItem[] {
    if (!rule.productLimits) return items

    return items.filter(item => {
      if (rule.productLimits?.productIds && !rule.productLimits.productIds.includes(item.productId)) {
        return false
      }
      if (rule.productLimits?.excludeIds && rule.productLimits.excludeIds.includes(item.productId)) {
        return false
      }
      if (rule.productLimits?.categoryIds && !rule.productLimits.categoryIds.includes(item.categoryId)) {
        return false
      }
      if (rule.productLimits?.brandIds && !rule.productLimits.brandIds.includes(item.brandId)) {
        return false
      }
      return true
    })
  }

  /**
   * 计算规则折扣
   */
  private calculateRuleDiscount(rule: PromotionRule, items: CartItem[], cartInfo: CartInfo): number {
    let discount = 0

    rule.actions.forEach(action => {
      switch (action.type) {
        case 'discount_percent':
          discount += items.reduce((sum, item) => sum + item.totalPrice, 0) * action.value / 100
          break
        case 'discount_amount':
          discount += action.value
          break
        case 'shipping_free':
          // TODO: 计算运费
          break
      }
    })

    return Math.min(discount, items.reduce((sum, item) => sum + item.totalPrice, 0))
  }

  /**
   * 获取所有冲突
   */
  getConflicts(): RuleConflict[] {
    return this.conflicts
  }

  /**
   * 清空所有规则
   */
  clearRules(): void {
    this.rules.clear()
    this.conflicts = []
  }
}

// 创建单例实例
export const promotionRuleEngine = new PromotionRuleEngine()

export default promotionRuleEngine