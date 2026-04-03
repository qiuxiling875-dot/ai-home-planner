# 🏠 毛胚房AI规划神器

> 整套房子AI设计工具 — 上传毛胚房照片，AI生成风格统一的全屋规划方案

面向25-35岁租房党/首套房年轻人，一次上传整套房子（客厅+厨房+主卧+次卧+卫生间）照片，AI确保所有房间风格高度一致。

---

## ✨ 功能特色

- **整套房子规划**：支持5-8张照片覆盖全屋所有房间
- **风格一致性保证**：通过风格种子(style_seed)技术锁定全屋色系、材质、家具语言、光影风格
- **三层定价**：基础版¥39 / 专业版¥79（最受欢迎） / 设计师版¥199
- **8种装修风格**：北欧极简 / 现代简约 / 温馨暖居 / 高性价比 / 日式侘寂 / 奶油风 / 轻工业风 / 复古中古
- **小红书笔记模板**：一键生成爆款文案（专业版及以上）
- **PDF报告导出**：完整规划方案下载
- **版本详细对比表格**：清晰展示各版本差异
- **响应式设计**：手机优先，完美适配移动端

## 🛠️ 技术栈

| 技术 | 说明 |
|------|------|
| Next.js 14 | App Router + Server Components |
| TypeScript | 完整类型安全 |
| Tailwind CSS | 原子化CSS + 自定义设计系统 |
| shadcn/ui 体系 | CSS变量 + Radix UI + cn工具函数 |
| Decor8 AI API | 主要AI渲染服务（支持style_seed） |
| ReimagineHome API | 备选AI渲染服务（自动fallback） |

## 📁 项目结构

```
ai-home-planner/
├── app/
│   ├── layout.tsx              # 根布局（SEO元数据+字体）
│   ├── page.tsx                # 主页面（完整用户流程）
│   ├── globals.css             # 全局样式 + Tailwind + CSS变量
│   └── api/
│       └── render/
│           └── route.ts        # AI渲染后端路由（保护API Key）
├── components/
│   ├── FloatingParticles.tsx   # 背景装饰粒子
│   ├── HeroSection.tsx         # 首屏大标题+统计数据
│   ├── PricingCard.tsx         # 单个定价卡片（支持徽章+深色模式）
│   ├── ComparisonTable.tsx     # 版本详细对比表格
│   ├── UploadArea.tsx          # 拖拽多选上传+房间标签分配
│   ├── StyleSelector.tsx       # 可视化风格选择网格
│   ├── LoadingOverlay.tsx      # 全屏加载动画+进度条
│   ├── ResultPage.tsx          # 结果展示（效果图+一致性报告+小红书模板）
│   ├── ReviewSection.tsx       # 用户评价区
│   └── Footer.tsx              # 页脚免责声明（每页永久显示）
├── lib/
│   ├── constants.ts            # 全部常量配置（定价/风格/房间/对比数据）
│   ├── ai-api.ts               # AI API集成模块（批量渲染+风格一致性）
│   └── utils.ts                # 工具函数（cn/复制/格式化）
├── .env.example                # 环境变量模板（含详细中文注释）
├── .gitignore
├── .eslintrc.json
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── postcss.config.js
├── package.json
└── README.md
```

## 🚀 快速开始

### 本地开发

```bash
# 1. 进入项目目录
cd ai-home-planner

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env.local
# 编辑 .env.local，填入你的AI API Key

# 4. 启动开发服务器
npm run dev

# 5. 打开浏览器
# http://localhost:3000
```

### Vercel一键部署

#### 方法一：通过GitHub（推荐）

```bash
# 1. 初始化Git仓库
git init
git add .
git commit -m "Initial commit: 毛胚房AI规划神器"

# 2. 推送到GitHub
# 在GitHub创建新仓库后：
git remote add origin https://github.com/YOUR_USERNAME/ai-home-planner.git
git push -u origin main
```

3. 登录 [Vercel](https://vercel.com)
4. 点击 **New Project** → 导入你的GitHub仓库
5. 在 **Settings → Environment Variables** 中添加：

| 变量名 | 值 | 必填 |
|--------|-----|------|
| `DECOR8_API_KEY` | 你的Decor8 AI Key | 是（主要API） |
| `REIMAGINE_API_KEY` | 你的ReimagineHome Key | 否（备选fallback） |
| `NEXT_PUBLIC_XHS_SHOP_URL` | 小红书店铺链接 | 否 |

6. 点击 **Deploy** 即可

#### 方法二：Vercel CLI

```bash
npm i -g vercel
vercel login
vercel              # 首次部署
vercel --prod       # 生产环境部署

# 设置环境变量
vercel env add DECOR8_API_KEY
vercel env add REIMAGINE_API_KEY
```

## 🔧 自定义配置指南

### 修改定价

编辑 `lib/constants.ts` 中的 `PLANS` 数组：

```typescript
{
  id: "pro",
  name: "专业版",
  price: 79,           // ← 修改价格
  badge: "最受欢迎",    // ← 修改/删除徽章（设null隐藏）
  accent: "#D4860B",   // ← 修改主题色
  // ...
}
```

### 替换小红书店铺链接

方式一：环境变量（推荐）
```
NEXT_PUBLIC_XHS_SHOP_URL=https://www.xiaohongshu.com/your-real-shop
```

方式二：直接修改代码
编辑 `components/ResultPage.tsx` 中的 `XHS_SHOP_URL` 变量

### 替换AI渲染API

1. 在 `lib/ai-api.ts` 中搜索 `TODO: UNCOMMENT FOR REAL API`
2. 取消注释真实API调用代码块
3. 注释掉或删除模拟数据返回块
4. 在 `.env.local` 中填入真实API Key

### 添加支付功能（后续扩展）

推荐集成方案：

| 方案 | 适用场景 | 说明 |
|------|---------|------|
| 微信支付H5 | 微信内打开 | 通过微信支付商户平台接入 |
| 支付宝手机网页支付 | 支付宝内打开 | 通过支付宝开放平台接入 |
| Stripe | 海外用户 | 国际支付方案 |
| 小红书店铺 | 小红书生态 | 直接跳转店铺下单（当前方案） |

### 添加自动发货逻辑

在 `app/api/` 下新建webhook路由：

```typescript
// app/api/webhook/payment/route.ts
export async function POST(request: NextRequest) {
  // 1. 验证支付回调签名
  // 2. 确认支付成功
  // 3. 触发 batchRenderRooms() 批量处理
  // 4. 将结果PDF发送到用户邮箱
  // 5. 或生成专属链接存储到数据库
}
```

## ⚠️ 注意事项

1. **API Key安全**：绝不要将Key硬编码在前端代码中，务必通过环境变量+API Route调用
2. **演示模式**：未配置API Key时，效果图区域显示占位图，不影响UI体验
3. **免责声明**：已集成在Footer组件中每页底部永久显示，请勿删除
4. **图片大小**：单张照片最大10MB，建议上传前适当压缩
5. **风格一致性**：核心依赖API的style_seed功能，确保选用支持此特性的AI服务

## 📝 License

MIT
