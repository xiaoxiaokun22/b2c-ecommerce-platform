import type { Product, ProductForm, Category, ProductReview } from '../product'

// 模拟商品数据
export const mockProducts: Product[] = [
  {
    id: 1,
    name: 'iPhone 15 Pro Max',
    categoryId: 111,
    categoryName: '电子产品 > 手机 > iPhone',
    brand: 'Apple',
    mainImage: 'https://via.placeholder.com/300x300',
    images: [
      'https://via.placeholder.com/300x300',
      'https://via.placeholder.com/300x300',
      'https://via.placeholder.com/300x300'
    ],
    skuCount: 3,
    minPrice: 9999,
    maxPrice: 12999,
    totalStock: 150,
    sales: 1234,
    status: 'active',
    description: '最新的iPhone 15 Pro Max，搭载A17 Pro芯片，钛金属设计',
    weight: 0.22,
    volume: 0.001,
    sort: 1,
    createdAt: '2024-01-01 10:00:00',
    updatedAt: '2024-01-01 10:00:00'
  },
  {
    id: 2,
    name: 'Samsung Galaxy S24 Ultra',
    categoryId: 112,
    categoryName: '电子产品 > 手机 > Android手机',
    brand: 'Samsung',
    mainImage: 'https://via.placeholder.com/300x300',
    images: [
      'https://via.placeholder.com/300x300',
      'https://via.placeholder.com/300x300'
    ],
    skuCount: 2,
    minPrice: 8999,
    maxPrice: 10999,
    totalStock: 80,
    sales: 567,
    status: 'active',
    description: '三星旗舰手机，S Pen手写笔，200MP摄像头',
    weight: 0.23,
    volume: 0.0012,
    sort: 2,
    createdAt: '2024-01-02 11:00:00',
    updatedAt: '2024-01-02 11:00:00'
  },
  {
    id: 3,
    name: 'MacBook Pro 16"',
    categoryId: 12,
    categoryName: '电子产品 > 电脑',
    brand: 'Apple',
    mainImage: 'https://via.placeholder.com/300x300',
    images: [
      'https://via.placeholder.com/300x300'
    ],
    skuCount: 4,
    minPrice: 19999,
    maxPrice: 29999,
    totalStock: 45,
    sales: 234,
    status: 'active',
    description: '专业级笔记本电脑，M3 Max芯片',
    weight: 2.1,
    volume: 0.008,
    sort: 3,
    createdAt: '2024-01-03 12:00:00',
    updatedAt: '2024-01-03 12:00:00'
  },
  {
    id: 4,
    name: '男士纯棉T恤',
    categoryId: 21,
    categoryName: '服装 > 男装',
    brand: 'Uniqlo',
    mainImage: 'https://via.placeholder.com/300x300',
    images: [
      'https://via.placeholder.com/300x300'
    ],
    skuCount: 5,
    minPrice: 99,
    maxPrice: 199,
    totalStock: 500,
    sales: 3456,
    status: 'inactive',
    description: '100%纯棉，舒适透气，多色可选',
    weight: 0.2,
    volume: 0.0008,
    sort: 4,
    createdAt: '2024-01-04 13:00:00',
    updatedAt: '2024-01-04 13:00:00'
  },
  {
    id: 5,
    name: '女士连衣裙',
    categoryId: 22,
    categoryName: '服装 > 女装',
    brand: 'Zara',
    mainImage: 'https://via.placeholder.com/300x300',
    images: [
      'https://via.placeholder.com/300x300'
    ],
    skuCount: 8,
    minPrice: 299,
    maxPrice: 799,
    totalStock: 200,
    sales: 789,
    status: 'draft',
    description: '时尚连衣裙，优质面料，修身版型',
    weight: 0.3,
    volume: 0.001,
    sort: 5,
    createdAt: '2024-01-05 14:00:00',
    updatedAt: '2024-01-05 14:00:00'
  }
]

// 模拟分类数据
export const mockCategories: Category[] = [
  {
    id: 1,
    name: '电子产品',
    parentId: null,
    icon: 'https://via.placeholder.com/50x50',
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
    icon: 'https://via.placeholder.com/50x50',
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

// 模拟评价数据
export const mockReviews: ProductReview[] = [
  {
    id: 1,
    productId: 1,
    productName: 'iPhone 15 Pro Max',
    skuName: '黑色 256GB',
    productImage: 'https://via.placeholder.com/60x60',
    userId: 1,
    userNickname: '张三',
    userPhone: '13812345678',
    userAvatar: 'https://via.placeholder.com/32x32',
    rating: 5,
    content: '手机很不错，拍照清晰，运行流畅，物流也很快，客服态度很好！强烈推荐！',
    images: [
      'https://via.placeholder.com/100x100',
      'https://via.placeholder.com/100x100',
      'https://via.placeholder.com/100x100'
    ],
    status: 'approved',
    merchantReply: {
      content: '感谢您的认可！我们会继续提供优质的服务。',
      createdAt: '2024-01-02 10:30:00'
    },
    createdAt: '2024-01-01 09:15:00'
  },
  {
    id: 2,
    productId: 2,
    productName: 'Samsung Galaxy S24 Ultra',
    skuName: '银色 512GB',
    productImage: 'https://via.placeholder.com/60x60',
    userId: 2,
    userNickname: '李四',
    userPhone: '13887654321',
    userAvatar: '',
    rating: 4,
    content: '手机整体不错，就是价格有点贵，希望能有更多优惠活动。相机效果很好，续航也可以。',
    images: [],
    status: 'pending',
    createdAt: '2024-01-02 14:20:00'
  },
  {
    id: 3,
    productId: 3,
    productName: 'MacBook Pro 16"',
    skuName: '深空灰 1TB',
    productImage: 'https://via.placeholder.com/60x60',
    userId: 3,
    userNickname: '王五',
    userPhone: '13666666666',
    userAvatar: 'https://via.placeholder.com/32x32',
    rating: 3,
    content: '性能很好，但是发热有点严重，希望能改进。屏幕显示效果不错，键盘手感也可以。',
    images: ['https://via.placeholder.com/100x100'],
    status: 'rejected',
    createdAt: '2024-01-03 16:45:00'
  },
  {
    id: 4,
    productId: 1,
    productName: 'iPhone 15 Pro Max',
    skuName: '蓝色 512GB',
    productImage: 'https://via.placeholder.com/60x60',
    userId: 4,
    userNickname: '赵六',
    userPhone: '13555555555',
    userAvatar: 'https://via.placeholder.com/32x32',
    rating: 5,
    content: '非常满意的购物体验！手机很漂亮，系统流畅，拍照效果惊艳。',
    images: [
      'https://via.placeholder.com/100x100',
      'https://via.placeholder.com/100x100'
    ],
    status: 'approved',
    merchantReply: {
      content: '谢谢您的支持！期待您的下次光临。',
      createdAt: '2024-01-04 09:20:00'
    },
    createdAt: '2024-01-03 11:30:00'
  },
  {
    id: 5,
    productId: 4,
    productName: '男士纯棉T恤',
    skuName: '白色 L码',
    productImage: 'https://via.placeholder.com/60x60',
    userId: 5,
    userNickname: '钱七',
    userPhone: '13444444444',
    userAvatar: '',
    rating: 4,
    content: '质量不错，穿着舒适，就是洗了之后有点缩水。整体来说还是值得购买的。',
    images: [],
    status: 'pending',
    createdAt: '2024-01-04 15:10:00'
  }
]

// 模拟商品详情数据
export const mockProductDetail: ProductForm = {
  id: 1,
  name: 'iPhone 15 Pro Max',
  categoryId: [1, 11, 111],
  brand: 'Apple',
  status: 'active',
  description: '最新的iPhone 15 Pro Max，搭载A17 Pro芯片，钛金属设计，支持USB-C接口，拍照效果惊艳。',
  mainImage: 'https://via.placeholder.com/300x300',
  images: [
    'https://via.placeholder.com/300x300',
    'https://via.placeholder.com/300x300',
    'https://via.placeholder.com/300x300'
  ],
  specs: [
    {
      id: '1',
      name: '颜色',
      values: ['黑色', '银色', '金色', '蓝色']
    },
    {
      id: '2',
      name: '容量',
      values: ['256GB', '512GB', '1TB']
    }
  ],
  skus: [
    {
      id: '1',
      specValues: ['黑色', '256GB'],
      skuCode: 'IP15PM-BK-256',
      price: 9999,
      marketPrice: 10999,
      stock: 50,
      enabled: true
    },
    {
      id: '2',
      specValues: ['黑色', '512GB'],
      skuCode: 'IP15PM-BK-512',
      price: 11999,
      marketPrice: 12999,
      stock: 30,
      enabled: true
    },
    {
      id: '3',
      specValues: ['黑色', '1TB'],
      skuCode: 'IP15PM-BK-1TB',
      price: 13999,
      marketPrice: 14999,
      stock: 20,
      enabled: true
    }
  ],
  weight: 0.22,
  volume: 0.001,
  sort: 1
}

export default {
  mockProducts,
  mockCategories,
  mockReviews,
  mockProductDetail
}