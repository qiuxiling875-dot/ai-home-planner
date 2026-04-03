// ============================================================
// AI渲染API集成模块
//
// 【重要：如何替换为真实API】
//
// 步骤1：选择AI渲染服务商
//   方案A（推荐）：Decor8 AI → https://www.decor8.ai/api
//     - 支持style_seed功能，最适合保证全屋风格一致性
//     - 注册后在API Dashboard获取Key
//
//   方案B（备选）：ReimagineHome AI → https://www.reimaginehome.ai/api
//     - 支持consistency_mode（一致性模式）
//     - 作为Decor8的fallback自动切换
//
//   方案C（其他选择）：
//     - Stability AI (img2img) → https://stability.ai
//     - Replicate 室内设计模型 → https://replicate.com
//     - HomeDesigns AI → https://homedesigns.ai
//
// 步骤2：配置API Key
//   - 在 .env.local 中设置对应的环境变量
//   - Vercel部署时在Dashboard的Environment Variables中设置
//   - 绝不要将Key硬编码在前端代码中！
//
// 步骤3：取消注释下方真实API调用代码
//   - 搜索 "TODO: UNCOMMENT FOR REAL API" 标记
//   - 取消注释对应代码块
//   - 删除或注释掉模拟数据返回
// ============================================================

import { STYLE_RENDER_DATA } from "./constants";

// =====================
// 类型定义
// =====================

/** 批量渲染请求参数 */
export interface BatchRenderParams {
  images: File[];                     // 所有房间的毛胚房照片
  roomLabels: Record<number, string>; // 每张照片对应的房间标签
  style: string;                      // 整体风格偏好（nordic/minimal/warm等）
  area: string;                       // 房间总面积（㎡）
  budget: string;                     // 预算范围
  planId: string;                     // 选择的方案ID（basic/pro/designer）
}

/** 单个房间的渲染结果 */
export interface RoomRenderResult {
  roomName: string;
  originalImageUrl: string;   // 原始毛胚房图（本地blob URL）
  renderedImageUrl: string;   // AI渲染后效果图URL
  description: string;        // AI生成的设计说明
  materials: string[];        // 推荐材质列表
  styleSeed: string;          // 使用的风格种子（确保一致性）
}

/** 整套渲染结果 */
export interface BatchRenderResult {
  rooms: RoomRenderResult[];
  styleSeed: string;
  consistencyScore: number;   // 风格一致性得分（0-100）
  overallPalette: string[];   // 统一色板
  overallMaterial: string;    // 统一材质体系描述
}

// =====================
// 风格映射：用户选项 → API参数
// =====================

const STYLE_TO_API: Record<string, string> = {
  nordic:     "scandinavian",
  minimal:    "minimalist",
  warm:       "cozy_warm",
  lowcost:    "budget_friendly",
  japanese:   "japandi",
  cream:      "soft_modern",
  industrial: "industrial",
  retro:      "mid_century_modern",
};

// 方案 → 渲染质量
const PLAN_TO_QUALITY: Record<string, string> = {
  basic:    "standard",     // 基础2D
  pro:      "high",         // 高质量渲染
  designer: "photorealistic", // 完美写实级
};

// =====================
// 核心函数
// =====================

/**
 * 【核心入口】批量渲染整套房子
 *
 * 风格一致性保证机制：
 * 1. 先调用API生成统一的 style_seed（风格种子）
 * 2. 所有房间渲染请求都携带相同的 style_seed
 * 3. style_seed 锁定了色调、材质方向、光影风格
 * 4. 最终做一致性评分校验
 *
 * @param params - 批量渲染参数
 * @param onProgress - 进度回调 (0-100, 当前处理的房间名)
 * @returns 整套渲染结果
 */
export async function batchRenderRooms(
  params: BatchRenderParams,
  onProgress?: (progress: number, currentRoom: string) => void
): Promise<BatchRenderResult> {
  const { images, roomLabels, style, area, budget, planId } = params;
  const totalSteps = images.length + 2; // +2 = 风格分析 + 一致性校验
  let currentStep = 0;

  const reportProgress = (room: string) => {
    currentStep++;
    const pct = Math.min(Math.round((currentStep / totalSteps) * 100), 99);
    onProgress?.(pct, room);
  };

  // ============================================================
  // 步骤1：生成统一风格种子
  // ============================================================
  reportProgress("整体空间与风格分析中...");

  let styleSeed = `mock_seed_${style}_${Date.now()}`;

  /* === TODO: UNCOMMENT FOR REAL API ===
  try {
    const seedResponse = await fetch("/api/render", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "generate_style_seed",
        style: STYLE_TO_API[style] || "scandinavian",
        budget,
        area,
      }),
    });

    if (seedResponse.ok) {
      const seedData = await seedResponse.json();
      styleSeed = seedData.styleSeed;
    }
  } catch (error) {
    console.warn("Failed to generate style seed, using default:", error);
  }
  === END REAL API === */

  // ============================================================
  // 步骤2：逐个房间渲染（携带相同styleSeed）
  // ============================================================
  const rooms: RoomRenderResult[] = [];

  for (let i = 0; i < images.length; i++) {
    const roomName = roomLabels[i] || `房间${i + 1}`;
    reportProgress(roomName);

    /* === TODO: UNCOMMENT FOR REAL API ===
    try {
      const formData = new FormData();
      formData.append("image", images[i]);
      formData.append("room_type", roomName);
      formData.append("style", STYLE_TO_API[style] || "scandinavian");
      formData.append("style_seed", styleSeed);
      formData.append("plan_id", planId);
      formData.append("quality", PLAN_TO_QUALITY[planId] || "high");
      formData.append("budget", budget);
      formData.append("area", area);

      const response = await fetch("/api/render", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        rooms.push({
          roomName,
          originalImageUrl: URL.createObjectURL(images[i]),
          renderedImageUrl: data.rendered_image_url,
          description: data.design_description,
          materials: data.recommended_materials || [],
          styleSeed,
        });
        continue; // 成功则跳过模拟数据
      }
    } catch (error) {
      console.error(`Failed to render ${roomName}:`, error);
    }
    === END REAL API === */

    // 模拟数据（开发/演示用，接入真实API后删除此块）
    const styleData = STYLE_RENDER_DATA[style] || STYLE_RENDER_DATA.nordic;
    await new Promise((r) => setTimeout(r, 400 + Math.random() * 300));
    rooms.push({
      roomName,
      originalImageUrl: URL.createObjectURL(images[i]),
      renderedImageUrl: "", // 真实API会返回渲染图URL
      description: `${roomName}采用${style}风格，与全屋保持统一的色调和材质体系。`,
      materials: styleData.material.split(" + "),
      styleSeed,
    });
  }

  // ============================================================
  // 步骤3：一致性校验
  // ============================================================
  reportProgress("全屋风格一致性校验中...");
  await new Promise((r) => setTimeout(r, 500));

  const styleData = STYLE_RENDER_DATA[style] || STYLE_RENDER_DATA.nordic;

  onProgress?.(100, "完成！");

  return {
    rooms,
    styleSeed,
    consistencyScore: 97.5 + Math.random() * 2, // 模拟得分，真实API会返回
    overallPalette: styleData.palette,
    overallMaterial: styleData.material,
  };
}

/**
 * 生成小红书笔记文案
 */
export function generateXHSNote(
  styleName: string,
  rooms: string[],
  budget: string
): string {
  const cleanStyle = styleName.replace(/[^\u4e00-\u9fa5a-zA-Z]/g, "");
  return `🏠 毛胚房大改造 | ${styleName}全屋统一设计

💰 ${budget}预算！年轻人第一套房也能住出高级感

📐 ${rooms.length}个房间统一风格，从${rooms.slice(0, 3).join(" → ")}一气呵成

✨ 全屋同色系同材质，告别东拼西凑的装修翻车

🪄 秘密武器：AI帮我做的全屋规划，3分钟出图

💡 小tips：
- 整套房子一定要先定好统一的色调再开始买家具
- 灯光色温全屋统一很重要（推荐3000-3500K暖白光）
- 同一种地板通铺全屋，空间感翻倍

#毛胚房改造 #装修灵感 #${cleanStyle} #年轻人的第一套房 #AI装修设计 #全屋统一风格 #装修日记`;
}
