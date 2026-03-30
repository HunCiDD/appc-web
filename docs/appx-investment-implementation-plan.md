# 实现 appx-investment 财务模块回测报告功能

> 此文件为持久化存储的实施方案计划，原计划由 Claude Code 生成于 2026-03-31。

## 上下文
项目需要为新的财务模块 `appx-investment` 实现回测报告功能。该模块对接本地后端接口 `http://127.0.0.1:8080/openapi.json`，需要实现：
1. **回测任务列表**：显示所有回测任务
2. **回测任务报告**：点击任务详情跳转，展示：
   - a. 股票K线图
   - b. 回测曲线（收益曲线）
   - c. 具体回测时交易情况（表格）

## 现有项目架构分析
基于代码库探索，项目采用以下技术栈：
- **前端框架**: Vue 3 + TypeScript + Vite
- **状态管理**: Pinia
- **路由**: Vue Router（带权限控制 `requiresAuth`）
- **UI组件库**: Element Plus（已配置自动导入）
- **样式框架**: Tailwind CSS v4 + SCSS
- **模块化结构**: `src/apps/` 下分模块组织（现有 `appc-auth` 和 `appx-tracker`）
- **API请求**: 分层拦截器设计（支持Token自动刷新）
- **图表库**: 当前未集成任何图表库

## 关键设计决策

### 1. 图表库选择：ECharts
- **理由**: 功能全面，支持K线图、折线图等多种图表类型，社区活跃，与Vue 3集成良好
- **安装**: `npm install echarts vue-echarts`

### 2. OpenAPI处理策略
- **自动生成类型**: 使用 `openapi-typescript` 生成基础类型定义
- **手动补充核心类型**: 回测任务、报告、交易记录等核心业务类型手动定义，确保类型安全

### 3. 澄清后的决策（基于用户反馈）
- **OpenAPI文档**: 可直接访问 `http://127.0.0.1:8080/openapi.json`，将使用 `openapi-typescript` 自动生成类型定义
- **后端接口基础路径**: `/api/v1/investment`
- **权限控制**: 回测功能无需认证 (`requiresAuth: false`)，可公开访问
- **图表需求**: 标准K线图 + 收益曲线，支持常见时间周期

### 4. 模块结构设计
遵循现有模块模式，创建 `src/apps/appx-investment/` 目录：
```
appx-investment/
├── apis/              # API接口定义
├── components/        # 组件（含charts/和tables/子目录）
├── stores/           # Pinia状态管理
├── types/            # TypeScript类型定义
├── utils/            # 工具函数（请求封装、图表工具）
└── views/            # 页面视图
```

## 实现方案

### 第一阶段：基础架构搭建
1. **创建模块目录结构**
   - 按照上述结构创建 `src/apps/appx-investment/` 及子目录

2. **安装依赖**
   ```bash
   npm install echarts vue-echarts
   npm install -D openapi-typescript
   ```

3. **配置OpenAPI类型生成**
   - 在 `package.json` 中添加脚本：
   ```json
   {
     "scripts": {
       "generate-types": "openapi-typescript http://127.0.0.1:8080/openapi.json -o src/types/generated/openapi.d.ts"
     }
   }
   ```

### 第二阶段：类型定义和API层
1. **核心类型定义** (`src/apps/appx-investment/types/`)
   - `backtest.ts`: 回测任务、报告、交易记录类型
   - `kline.ts`: K线数据类型
   - 手动定义确保类型安全，补充自动生成类型的不足

2. **API接口定义** (`src/apps/appx-investment/apis/`)
   - `backtest.ts`: 回测相关API（任务列表、报告详情、交易记录）
   - `kline.ts`: K线数据API
   - 使用现有请求拦截器模式，创建模块专用请求实例

3. **请求封装** (`src/apps/appx-investment/utils/request/`)
   - 基于全局 `HttpRequest` 和 `InterceptorStrategy` 模式
   - 创建 `investmentRequest` 实例，可添加投资模块特定拦截逻辑

### 第三阶段：状态管理
1. **Pinia Store** (`src/apps/appx-investment/stores/investment.ts`)
   - 管理回测任务列表、当前任务、报告数据、交易记录、K线数据
   - 包含加载状态、分页信息、计算属性（如总收益、已完成任务筛选）
   - 提供异步action：获取任务列表、获取报告、获取交易记录、获取K线数据

### 第四阶段：核心组件开发
1. **K线图组件** (`src/apps/appx-investment/components/charts/KLineChart.vue`)
   - 基于ECharts实现K线图（蜡烛图）和成交量柱状图
   - 支持时间间隔切换（1m、5m、15m、30m、1h、4h、1d）
   - 响应式设计，支持数据缩放和十字准线提示

2. **回测曲线组件** (`src/apps/appx-investment/components/charts/BacktestCurveChart.vue`)
   - 展示资金曲线、基准对比（可选）
   - 支持收益率、回撤等关键指标标注

3. **交易记录表格** (`src/apps/appx-investment/components/tables/TradeTable.vue`)
   - 使用Element Plus表格展示交易详情
   - 支持分页、排序、筛选
   - 买卖方向颜色标识（红色卖出，绿色买入）

4. **任务列表组件** (`src/apps/appx-investment/components/BacktestTaskList.vue`)
   - 展示回测任务表格，支持状态筛选、搜索、分页
   - 任务状态标签（进行中、已完成、失败）
   - 点击行跳转到报告详情页

### 第五阶段：页面集成
1. **任务列表页面** (`src/apps/appx-investment/views/BacktestTaskListView.vue`)
   - 承载任务列表组件，提供创建新任务入口

2. **报告详情页面** (`src/apps/appx-investment/views/BacktestReportView.vue`)
   - 布局：顶部关键指标卡片 + 中部K线图和回测曲线 + 底部交易记录表格
   - 响应式设计：大屏幕并排显示图表，小屏幕堆叠显示
   - 加载状态管理

### 第六阶段：路由集成和权限控制
1. **路由配置** (`src/router/index.ts`)
   ```typescript
   {
     path: '/investment',
     name: 'investment',
     component: () => import('@/components/layout/AppLayout.vue'),
     meta: { requiresAuth: false }, // 无需认证，可公开访问
     children: [
       {
         path: 'backtest/tasks',
         name: 'BacktestTaskList',
         component: () => import('@/apps/appx-investment/views/BacktestTaskListView.vue'),
       },
       {
         path: 'backtest/report/:taskId',
         name: 'BacktestReport',
         component: () => import('@/apps/appx-investment/views/BacktestReportView.vue'),
         props: true,
       },
     ],
   }
   ```

### 第七阶段：样式和优化
1. **Tailwind CSS布局**
   - 使用网格系统布局图表区域
   - 响应式断点：移动端单列，桌面端多列
   - 卡片化设计，统一边框、阴影、圆角

2. **ECharts工具封装** (`src/apps/appx-investment/utils/chart/`)
   - 主题注册、基础配置生成、响应式处理

3. **性能优化**
   - 图表数据懒加载
   - 交易记录分页
   - 防抖搜索

## 关键文件路径
1. **模块入口**: `F:/Code/A-Self/Apps/appc-web/src/apps/appx-investment/index.ts`
2. **状态管理**: `F:/Code/A-Self/Apps/appc-web/src/apps/appx-investment/stores/investment.ts`
3. **核心API**: `F:/Code/A-Self/Apps/appc-web/src/apps/appx-investment/apis/backtest.ts`
4. **K线图组件**: `F:/Code/A-Self/Apps/appc-web/src/apps/appx-investment/components/charts/KLineChart.vue`
5. **任务列表组件**: `F:/Code/A-Self/Apps/appc-web/src/apps/appx-investment/components/BacktestTaskList.vue`
6. **路由配置**: `F:/Code/A-Self/Apps/appc-web/src/router/index.ts`
7. **类型定义**: `F:/Code/A-Self/Apps/appc-web/src/apps/appx-investment/types/backtest.ts`

## 已澄清事项
✅ **OpenAPI文档**: 可直接访问 `http://127.0.0.1:8080/openapi.json`，将自动生成类型定义
✅ **后端接口基础路径**: `/api/v1/investment`
✅ **权限控制**: 无需认证 (`requiresAuth: false`)，可公开访问
✅ **图表需求**: 标准K线图 + 收益曲线，支持常见时间周期

## 验证计划
1. **模块结构验证**: 检查目录创建是否正确
2. **类型检查**: 运行 `npm run type-check` 确保类型安全
3. **组件渲染测试**: 启动开发服务器，验证页面基本渲染
4. **API连通性测试**: 配置代理，测试后端接口连通性
5. **图表功能测试**: 验证K线图、回测曲线正常显示
6. **路由导航测试**: 测试任务列表到报告详情的跳转
7. **响应式测试**: 不同屏幕尺寸下的布局适配

## 后续扩展建议
1. **实时更新**: 进行中的回测任务进度实时更新
2. **报告导出**: PDF/Excel报告导出功能
3. **策略对比**: 多策略回测结果对比
4. **参数优化**: 回测参数网格搜索和优化
5. **风险指标**: 更丰富的风险指标计算和展示
6. **回测分享**: 报告分享和协作功能

---
*计划创建时间: 2026-03-31*
*预计工作量: 11-17个工作日*
*持久化存储时间: 2026-03-31*