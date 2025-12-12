// 统一的分类层级表示方法

// 分类节点接口
export interface CategoryNode {
  id: number
  name: string
  parentId: number | null
  level: number  // 层级：1-一级，2-二级，3-三级等
  path: string   // 完整路径：1,11,111
  pathName: string // 完整路径名称：电子产品 > 手机 > iPhone
  icon?: string
  image?: string
  sort: number
  status: 'active' | 'inactive'
  description?: string
  seoKeywords?: string
  seoDescription?: string
  productCount: number
  hasChildren: boolean
  children?: CategoryNode[]
  createdAt: string
  updatedAt: string
}

// 分类表单数据
export interface CategoryForm {
  id?: number
  parentId: number | null
  name: string
  icon?: string
  image?: string
  sort: number
  status: 'active' | 'inactive'
  description?: string
  seoKeywords?: string
  seoDescription?: string
}

// 分类查询参数
export interface CategoryQueryParams {
  level?: number
  parentId?: number | null
  status?: string
  keyword?: string
  includeChildren?: boolean
}

// 分类树形结构
export interface CategoryTree {
  [key: number]: CategoryNode
}

// 分类路径工具类
export class CategoryPathUtils {
  /**
   * 构建分类路径
   * @param parentId 父级ID
   * @param level 当前层级
   * @param allCategories 所有分类映射
   * @returns 路径字符串和路径名称
   */
  static buildPath(
    parentId: number | null,
    level: number,
    allCategories: Map<number, CategoryNode>
  ): { path: string; pathName: string } {
    if (!parentId || level === 1) {
      return {
        path: '',
        pathName: ''
      }
    }

    const parent = allCategories.get(parentId)
    if (!parent) {
      return {
        path: '',
        pathName: ''
      }
    }

    const path = parent.path ? `${parent.path},${parentId}` : `${parentId}`
    const pathName = parent.pathName ? `${parent.pathName} > ${parent.name}` : parent.name

    return { path, pathName }
  }

  /**
   * 获取分类的完整路径ID数组
   * @param categoryId 分类ID
   * @param allCategories 所有分类映射
   * @returns ID数组
   */
  static getPathIds(categoryId: number, allCategories: Map<number, CategoryNode>): number[] {
    const category = allCategories.get(categoryId)
    if (!category || !category.path) {
      return categoryId ? [categoryId] : []
    }

    return category.path.split(',').map(id => parseInt(id)).concat(categoryId)
  }

  /**
   * 获取分类的完整路径名称
   * @param categoryId 分类ID
   * @param allCategories 所有分类映射
   * @returns 路径名称
   */
  static getPathName(categoryId: number, allCategories: Map<number, CategoryNode>): string {
    const category = allCategories.get(categoryId)
    return category?.pathName || category?.name || ''
  }

  /**
   * 检查是否为子分类
   * @param parentId 父级ID
   * @param childId 子级ID
   * @param allCategories 所有分类映射
   * @returns 是否为子分类
   */
  static isChildCategory(parentId: number, childId: number, allCategories: Map<number, CategoryNode>): boolean {
    const child = allCategories.get(childId)
    if (!child) return false

    return child.path.split(',').some(id => parseInt(id) === parentId)
  }

  /**
   * 获取所有子分类ID（包括子孙分类）
   * @param parentId 父级ID
   * @param allCategories 所有分类映射
   * @returns 子分类ID数组
   */
  static getAllChildIds(parentId: number, allCategories: Map<number, CategoryNode>): number[] {
    const childIds: number[] = []

    allCategories.forEach((category) => {
      if (category.id !== parentId && this.isChildCategory(parentId, category.id, allCategories)) {
        childIds.push(category.id)
      }
    })

    return childIds
  }

  /**
   * 构建树形结构
   * @param categories 分类列表
   * @param parentId 父级ID
   * @returns 树形结构
   */
  static buildTree(categories: CategoryNode[], parentId: number | null = null): CategoryNode[] {
    const tree: CategoryNode[] = []

    categories.forEach(category => {
      if (category.parentId === parentId) {
        const children = this.buildTree(categories, category.id)
        if (children.length > 0) {
          category.children = children
          category.hasChildren = true
        }
        tree.push(category)
      }
    })

    return tree.sort((a, b) => a.sort - b.sort)
  }

  /**
   * 将列表转换为映射
   * @param categories 分类列表
   * @returns ID到分类的映射
   */
  static toMap(categories: CategoryNode[]): Map<number, CategoryNode> {
    const map = new Map<number, CategoryNode>()
    categories.forEach(category => {
      map.set(category.id, category)
    })
    return map
  }

  /**
   * 验证分类层级深度
   * @param level 当前层级
   * @param maxLevel 最大层级
   * @returns 是否有效
   */
  static validateLevel(level: number, maxLevel: number = 5): boolean {
    return level >= 1 && level <= maxLevel
  }

  /**
   * 验证分类是否可以选择（检查循环引用）
   * @param categoryId 当前分类ID
   * @param targetParentId 目标父级ID
   * @param allCategories 所有分类映射
   * @returns 是否可以选择
   */
  static canSelectParent(categoryId: number, targetParentId: number | null, allCategories: Map<number, CategoryNode>): boolean {
    if (!targetParentId) return true

    // 不能选择自己作为父级
    if (categoryId === targetParentId) return false

    // 不能选择自己的子分类作为父级
    return !this.isChildCategory(categoryId, targetParentId, allCategories)
  }
}

// 分类API服务
export class CategoryService {
  /**
   * 获取分类树
   */
  static async getCategoryTree(): Promise<CategoryNode[]> {
    // 这里调用API获取分类列表
    // const response = await categoryApi.getList()
    // const categories = response.data

    // 模拟数据
    const categories: CategoryNode[] = [
      {
        id: 1,
        name: '电子产品',
        parentId: null,
        level: 1,
        path: '',
        pathName: '',
        sort: 1,
        status: 'active',
        productCount: 0,
        hasChildren: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]

    return CategoryPathUtils.buildTree(categories)
  }

  /**
   * 获取分类路径信息
   */
  static async getCategoryPath(categoryId: number): Promise<{ pathIds: number[]; pathName: string }> {
    // 获取所有分类
    const allCategories = await this.getAllCategoriesMap()

    return {
      pathIds: CategoryPathUtils.getPathIds(categoryId, allCategories),
      pathName: CategoryPathUtils.getPathName(categoryId, allCategories)
    }
  }

  /**
   * 获取所有分类映射
   */
  private static async getAllCategoriesMap(): Promise<Map<number, CategoryNode>> {
    // 调用API获取所有分类
    // const response = await categoryApi.getAll()
    // return CategoryPathUtils.toMap(response.data)

    // 模拟返回空映射
    return new Map()
  }
}

export default CategoryPathUtils