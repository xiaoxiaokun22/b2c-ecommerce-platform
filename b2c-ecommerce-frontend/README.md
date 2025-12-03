# B2C电商平台 - 前端项目

基于Vue 3 + TypeScript + Element Plus开发的B2C电商平台前端项目。

## 功能特性

### 用户管理模块
- ✅ 用户登录（支持手机号/邮箱登录）
- ✅ 用户注册（包含手机验证码）
- ✅ 个人信息管理（头像上传、基本信息编辑）
- ✅ 账号安全（密码修改、账号状态查看）
- ✅ 用户状态管理（Pinia）
- ✅ 路由守卫和权限控制

## 技术栈

- **框架**: Vue 3 + TypeScript
- **UI组件库**: Element Plus
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **HTTP客户端**: Axios
- **构建工具**: Vite
- **开发工具**: ESLint

## 项目结构

```
b2c-ecommerce-frontend/
├── src/
│   ├── api/                 # API接口
│   │   ├── request.ts      # Axios请求封装
│   │   └── user.ts         # 用户相关API
│   ├── components/         # 公共组件
│   ├── views/              # 页面组件
│   │   ├── auth/           # 认证相关页面
│   │   │   ├── Login.vue   # 登录页
│   │   │   └── Register.vue # 注册页
│   │   ├── user/           # 用户相关页面
│   │   │   └── Profile.vue # 个人中心
│   │   └── Home.vue        # 首页
│   ├── stores/             # 状态管理
│   │   └── user.ts         # 用户状态
│   ├── types/              # TypeScript类型定义
│   │   └── user.ts         # 用户类型
│   ├── router/             # 路由配置
│   │   └── index.ts        # 路由配置
│   ├── styles/             # 样式文件
│   │   └── index.css       # 全局样式
│   ├── App.vue             # 根组件
│   ├── main.ts             # 应用入口
│   └── env.d.ts            # 环境变量类型
├── public/                 # 静态资源
├── .env.development        # 开发环境变量
├── .env.production         # 生产环境变量
├── index.html              # HTML模板
├── package.json            # 项目配置
├── tsconfig.json           # TypeScript配置
├── vite.config.ts          # Vite配置
└── README.md               # 项目说明
```

## 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 启动开发服务器
```bash
npm run dev
```

### 3. 构建生产版本
```bash
npm run build
```

### 4. 预览生产版本
```bash
npm run preview
```

### 5. 代码检查和修复
```bash
npm run lint
```

## 环境配置

### 开发环境 (.env.development)
```
VITE_API_BASE_URL=http://localhost:8080
VITE_APP_TITLE=B2C电商平台-开发环境
```

### 生产环境 (.env.production)
```
VITE_API_BASE_URL=https://api.b2c-ecommerce.com
VITE_APP_TITLE=B2C电商平台
```

## 功能说明

### 用户认证
- 支持手机号和邮箱两种登录方式
- 手机验证码功能
- 记住登录状态
- 登录状态持久化

### 个人中心
- 个人信息展示和编辑
- 头像上传（支持JPG/PNG格式，大小不超过2MB）
- 密码修改
- 账号状态查看

### 权限控制
- 基于路由守卫的权限控制
- 需要登录的页面自动跳转到登录页
- 用户状态管理

## API接口

### 用户相关接口
- `POST /api/user/login` - 用户登录
- `POST /api/user/register` - 用户注册
- `GET /api/user/info` - 获取用户信息
- `PUT /api/user/profile` - 更新用户信息
- `POST /api/user/send-code` - 发送验证码
- `PUT /api/user/change-password` - 修改密码
- `POST /api/user/upload-avatar` - 上传头像

## 开发说明

### 状态管理
使用Pinia进行状态管理，用户状态包括：
- 用户信息
- 登录状态
- Token管理

### 请求拦截
- 自动添加Authorization头
- 统一错误处理
- 401状态自动退出登录

### 表单验证
使用Element Plus的表单验证功能：
- 手机号格式验证
- 邮箱格式验证
- 密码强度验证
- 确认密码一致性验证

## 注意事项

1. **后端接口**: 目前前端项目已完成，但需要后端接口支持才能正常运行
2. **跨域问题**: 开发时注意配置跨域
3. **环境变量**: 根据实际环境修改API_BASE_URL
4. **图片上传**: 需要配置文件上传接口

## 后续开发计划

- [ ] 商品管理模块
- [ ] 购物车功能
- [ ] 订单管理
- [ ] 支付功能
- [ ] 消息通知
- [ ] 搜索功能
- [ ] 地址管理

## 许可证

MIT License