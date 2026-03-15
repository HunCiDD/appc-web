# APPC Web 项目

这是一个基于 Vue 3 的 Web 应用，包含用户认证授权和日常跟踪两个核心模块。

## 项目概述

- **项目名称**: APPC Web
- **技术栈**: Vue 3 + TypeScript + Vite
- **状态**: 开发中
- **主要功能**:
  - **appc-auth**: 用户认证、用户管理、角色管理、资源权限管理
    - 后台对应项目 ../appc-auth 
  - **appx-tracker**: 日常时间跟踪、动作数据、事物数据、标签管理
    - 后台对应项目 ../appc-tracker

## 技术栈

### 核心框架
- **Vue 3**: 前端框架
- **TypeScript**: 类型安全
- **Vite**: 构建工具

### UI 组件库
- **Element Plus**: UI 组件库
- **Tailwind CSS**: 实用优先的 CSS 框架
- **Sass**: CSS 预处理器

### 状态管理 & 路由
- **Pinia**: 状态管理
- **Vue Router**: 路由管理

### 网络请求
- **Axios**: HTTP 客户端

### 开发工具
- **ESLint**: 代码检查
- **Prettier**: 代码格式化
- **Vitest**: 单元测试
- **Vue Test Utils**: Vue 组件测试

### 构建优化
- **unplugin-auto-import**: 自动导入
- **unplugin-vue-components**: 自动导入组件
- **unplugin-icons**: 图标自动导入

## 项目结构

```
appc-web/
├── src/
│   ├── apps/                    # 应用模块
│   │   ├── appc-auth/          # 认证授权模块
│   │   │   ├── apis/           # API 接口
│   │   │   ├── components/     # 组件
│   │   │   ├── stores/         # Pinia store
│   │   │   ├── types/          # 类型定义
│   │   │   └── views/          # 页面视图
│   │   └── appx-tracker/       # 日常跟踪模块
│   │       ├── apis/
│   │       ├── types/
│   │       └── views/
│   ├── components/              # 公共组件
│   │   ├── layout/             # 布局组件
│   │   └── ui/                 # UI 基础组件
│   ├── configs/                # 配置文件
│   ├── router/                 # 路由配置
│   ├── stores/                 # 全局 store
│   ├── utils/                  # 工具函数
│   ├── views/                  # 公共页面
│   └── main.ts                 # 应用入口
├── public/                     # 静态资源
└── package.json
```

## 路由配置

应用采用基于权限的路由系统：

- `/` → 重定向到 `/home`
- `/home` → 主布局页面（需要认证）
  - `/auth/admin/users` → 用户管理
  - `/auth/admin/roles` → 角色管理
  - `/auth/admin/resource` → 资源管理
  - `/daily-tracker/time-spend` → 时间花费统计
  - `/daily-tracker/action/data` → 动作数据
  - `/daily-tracker/thing/data` → 事物数据
  - `/daily-tracker/tag/data` → 标签数据
- `/login` → 登录页面
- `/about` → 关于页面
- `/test` → 测试页面

## 开发指南

### 环境要求
- Node.js (建议最新 LTS 版本)
- npm 或 yarn

### 安装依赖
```bash
npm install
```

### 开发服务器
```bash
npm run dev
```
启动后访问 `http://localhost:5173`

### 构建生产版本
```bash
npm run build
```

### 类型检查
```bash
npm run type-check
```

### 代码检查与格式化
```bash
npm run lint   # ESLint 检查并修复
npm run format # Prettier 格式化
```

### 运行测试
```bash
npm run test:unit
```

## 代码规范

### 组件命名
- Vue 组件使用 PascalCase (如 `UserAdmin.vue`)
- 组件文件与组件名保持一致

### 目录结构
- 每个功能模块放在 `src/apps/` 下
- 公共组件放在 `src/components/`
- 页面视图放在模块的 `views/` 目录

### TypeScript
- 使用严格模式
- 为 API 响应和状态定义类型
- 避免使用 `any` 类型

### CSS
- 使用 Tailwind CSS 类优先
- 需要自定义样式时使用 Sass
- 遵循 BEM 命名规范（如需要）

## 注意事项

1. **认证拦截**: 路由守卫会检查需要认证的页面，未登录用户将被重定向到登录页
2. **API 请求**: 所有 API 请求通过 `src/apis/request.ts` 的统一拦截器
3. **状态管理**: 使用 Pinia 进行状态管理，避免直接修改 store 状态
4. **图标使用**: 使用 Element Plus 图标库，通过自动导入使用
5. **组件导入**: Vue 组件和 Composition API 已配置自动导入，无需手动导入

## 常见问题

### 如何添加新模块？
1. 在 `src/apps/` 下创建新模块目录
2. 按照现有模块结构组织代码
3. 在 `src/router/index.ts` 中添加路由
4. 如需权限控制，在路由 meta 中添加 `requiresAuth: true`

### 如何添加新的 UI 组件？
1. 如果是公共组件，放在 `src/components/ui/`
2. 如果是模块特定组件，放在模块的 `components/` 目录
3. 组件会自动导入，无需手动注册

### 如何调用 API？
1. 在模块的 `apis/` 目录下创建 API 文件
2. 使用 `src/apis/request.ts` 中的 `request` 实例
3. 定义 TypeScript 类型在 `types/` 目录

## 扩展建议

- 考虑添加国际化支持
- 集成更完善的错误监控系统
- 添加性能监控和优化
- 实现服务端渲染（SSR）以提高首屏加载速度
- 添加 PWA 支持

---

*最后更新: 2026-03-16*