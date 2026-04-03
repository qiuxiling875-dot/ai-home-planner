// ============================================================
// 毛胚房AI规划神器 - 全局常量配置
//
// 【修改指南】
// - 修改定价 → 编辑 PLANS 数组的 price 字段
// - 增减风格 → 编辑 STYLES 数组
// - 修改房间列表 → 编辑 ROOMS 数组
// - 修改对比表格 → 编辑 COMPARISON_ROWS 数组
// ============================================================

// =====================
// 类型定义
// =====================

/** 定价方案 */
export interface Plan {
  id: "basic" | "pro" | "designer";
  name: string;
  price: number;
  badge: string | null;
  accent: string;
  dark?: boolean;
  features: string[];
  notIncluded: string[];
  description: string;
  cta: string;
}

/** 风格选项 */
export interface StyleOption {
  value: string;
  label: string;
  desc: string;
  emoji: string;
}

/** 风格渲染数据（色板+材质） */
export interface StyleRenderData {
  palette: string[];
  material: string;
  lightTone: string;
  accentTone: string;
}

/** 预算选项 */
export interface BudgetOption {
  value: string;
  label: string;
}

/** 对比表格行 */
export interface ComparisonRow {
  feature: string;
  basic: string;
  pro: string;
  designer: string;
}

// =====================
// 三层定价方案
// =====================

export const PLANS: Plan[] = [
  {
    id: "basic",
    name: "基础版",
    price: 39,
    badge: null,
    accent: "#8B7355",
    features: [
      "1套简单2D平面布局图",
      "基础文字建议清单",
      "整体空间规划方案",
      "基础风格配色推荐",
    ],
    notIncluded: [
      "3D渲染效果图",
      "小红书笔记模板",
      "无限修改",
      "专属网页链接",
    ],
    description: "快速了解空间布局可能性",
    cta: "立即体验",
  },
  {
    id: "pro",
    name: "专业版",
    price: 79,
    badge: "最受欢迎",  // 黄色徽章 + 默认选中
    accent: "#D4860B",
    features: [
      "3套精美渲染效果图",
      "小红书爆款笔记模板",
      "整体风格说明文档",
      "全屋风格一致性保证",
      "材质 & 软装推荐清单",
      "PDF完整报告下载",
    ],
    notIncluded: ["无限修改", "专属网页链接"],
    description: "性价比之王，适合大多数人",
    cta: "选择专业版",
  },
  {
    id: "designer",
    name: "设计师版",
    price: 199,
    badge: "旗舰体验",
    accent: "#C9A96E",
    dark: true,
    features: [
      "Photorealistic完美渲染图",
      "无限修改 · 1个月有效期",
      "专属永久网页工具链接",
      "全屋风格一致性保证",
      "小红书爆款笔记模板",
      "详细施工参考说明",
      "材质采购链接汇总",
      "1对1风格微调建议",
    ],
    notIncluded: [],
    description: "专业级出图，朋友圈炸裂",
    cta: "选择设计师版",
  },
];

// =====================
// 8种装修风格
// =====================

export const STYLES: StyleOption[] = [
  { value: "nordic",     label: "北欧极简", desc: "清爽白色+木质温暖",     emoji: "🌿" },
  { value: "minimal",    label: "现代简约", desc: "干净利落·少即是多",     emoji: "◻️" },
  { value: "warm",       label: "温馨暖居", desc: "奶咖色系·慵懒舒适",     emoji: "🕯️" },
  { value: "lowcost",    label: "高性价比", desc: "好看不贵·实用主义",     emoji: "💰" },
  { value: "japanese",   label: "日式侘寂", desc: "原木+留白·禅意空间",    emoji: "🏯" },
  { value: "cream",      label: "奶油风",   desc: "柔和曲线·治愈系",      emoji: "🍦" },
  { value: "industrial", label: "轻工业风", desc: "水泥+金属·个性表达",    emoji: "🔩" },
  { value: "retro",      label: "复古中古", desc: "时光沉淀·格调满分",     emoji: "📻" },
];

// =====================
// 房间列表与图标
// =====================

export const ROOMS: string[] = [
  "客厅", "厨房", "主卧", "次卧", "卫生间", "阳台", "玄关", "书房",
];

export const ROOM_ICONS: Record<string, string> = {
  客厅: "🛋️",
  厨房: "🍳",
  主卧: "🛏️",
  次卧: "🛏️",
  卫生间: "🚿",
  阳台: "🌿",
  玄关: "🚪",
  书房: "📚",
};

// =====================
// 每种风格对应的渲染参数
// =====================

export const STYLE_RENDER_DATA: Record<string, StyleRenderData> = {
  nordic: {
    palette: ["#F5F0EB", "#D4C5B2", "#8B9D83", "#FFFFFF", "#C9B99A"],
    material: "白橡木 + 亚麻布艺 + 黄铜细节",
    lightTone: "#FAF7F2",
    accentTone: "#8B9D83",
  },
  minimal: {
    palette: ["#FFFFFF", "#F0F0F0", "#333333", "#E8E8E8", "#999999"],
    material: "大理石 + 不锈钢 + 超白玻璃",
    lightTone: "#FAFAFA",
    accentTone: "#333333",
  },
  warm: {
    palette: ["#F2E6D9", "#D4B896", "#A67B5B", "#E8D5C4", "#8B6F47"],
    material: "胡桃木 + 丝绒软包 + 暖色灯带",
    lightTone: "#FBF5EE",
    accentTone: "#A67B5B",
  },
  lowcost: {
    palette: ["#FAFAFA", "#E8E0D8", "#B8A898", "#FFFFFF", "#C5B9A8"],
    material: "免漆板 + 棉麻布 + 基础五金",
    lightTone: "#FCFAF8",
    accentTone: "#B8A898",
  },
  japanese: {
    palette: ["#F5F0E8", "#D4C4A8", "#8B7355", "#E8DDD0", "#A69279"],
    material: "白蜡木 + 棉麻 + 和纸灯罩",
    lightTone: "#FAF6EE",
    accentTone: "#8B7355",
  },
  cream: {
    palette: ["#FFF8F0", "#F0E0D0", "#E8C8B0", "#FFFFF5", "#D4B8A0"],
    material: "圆弧家具 + 绒面皮革 + 奶白色调",
    lightTone: "#FFFCF7",
    accentTone: "#E8C8B0",
  },
  industrial: {
    palette: ["#D0D0D0", "#808080", "#333333", "#B0B0B0", "#C9A96E"],
    material: "水泥漆面 + 黑铁管件 + 裸露管线",
    lightTone: "#F0F0F0",
    accentTone: "#C9A96E",
  },
  retro: {
    palette: ["#E8D8C4", "#A67B5B", "#556B2F", "#D4A574", "#8B4513"],
    material: "藤编 + 丝绒沙发 + 黄铜把手",
    lightTone: "#F8F0E4",
    accentTone: "#556B2F",
  },
};

// =====================
// 预算范围选项
// =====================

export const BUDGET_OPTIONS: BudgetOption[] = [
  { value: "1-3万",  label: "1-3万（极简低成本）" },
  { value: "3-5万",  label: "3-5万（性价比之选）" },
  { value: "5-10万", label: "5-10万（品质生活）" },
  { value: "10万+",  label: "10万+（高端定制）" },
];

// =====================
// 版本对比表格数据
// =====================

export const COMPARISON_ROWS: ComparisonRow[] = [
  { feature: "2D平面布局图",     basic: "1套",       pro: "3套",           designer: "3套+" },
  { feature: "渲染效果图质量",    basic: "—",         pro: "高质量渲染",      designer: "Photorealistic" },
  { feature: "风格一致性保证",    basic: "基础",       pro: "✓ 全屋统一",     designer: "✓ 全屋统一" },
  { feature: "小红书笔记模板",    basic: "—",         pro: "✓",             designer: "✓" },
  { feature: "PDF报告下载",      basic: "—",         pro: "✓",             designer: "✓" },
  { feature: "风格说明文档",      basic: "基础建议",    pro: "✓ 详细说明",     designer: "✓ 施工级说明" },
  { feature: "材质采购链接",      basic: "—",         pro: "—",             designer: "✓" },
  { feature: "修改次数",         basic: "不支持",     pro: "1次",            designer: "无限·1个月" },
  { feature: "专属网页链接",      basic: "—",         pro: "—",             designer: "✓ 永久有效" },
  { feature: "1对1风格建议",     basic: "—",         pro: "—",             designer: "✓" },
];

// =====================
// 用户评价数据
// =====================

export const REVIEWS = [
  {
    name: "小鱼🐟",
    text: "39块钱看个布局图我觉得值了，新手特别友好，配色推荐直接抄作业！",
    plan: "基础版",
    avatar: "🧑‍🎨",
    rating: 5,
  },
  {
    name: "装修小白",
    text: "专业版三套图风格真的统一！客厅卧室看起来就是一个家，直接发小红书爆了",
    plan: "专业版",
    avatar: "👩‍💻",
    rating: 5,
  },
  {
    name: "CC的新家",
    text: "设计师版渲染图发给施工队，他们都以为我花了大几千请了设计师哈哈哈",
    plan: "设计师版",
    avatar: "👨‍🔧",
    rating: 5,
  },
];
