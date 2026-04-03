import { NextRequest, NextResponse } from "next/server";

// ============================================================
// AI渲染后端API路由 — 已修正为Decor8真实API格式
//
// 【Decor8 AI 真实API规范】(来自 api-docs.decor8.ai)
//
// Endpoint:  POST https://api.decor8.ai/generate_designs_for_room
// Headers:   Content-Type: application/json
//            Authorization: Bearer <API_KEY>
// Body(JSON):
//   {
//     "input_image_url": "https://公开可访问的图片URL",
//     "room_type": "livingroom",
//     "design_style": "scandinavian",
//     "num_images": 1
//   }
// Response:
//   {
//     "info": {
//       "images": [
//         { "url": "https://prod-files.decor8.ai/..." }
//       ]
//     }
//   }
//
// 【关键问题】Decor8不接受直接上传图片文件！
// 它要求 input_image_url 是一个公开可访问的URL。
// 所以我们需要先把用户上传的图片转成base64 data URL
// 或者上传到云存储拿到URL。
//
// 方案A（本文件采用）：先上传到免费图床拿URL
// 方案B：使用支持直接上传的API（如Replicate）
//
// 【API Key获取】
// 1. 去 https://prod-app.decor8.ai 注册登录
// 2. 左侧菜单 → APIs → Generate API Key
// 3. 复制Key → Vercel环境变量 DECOR8_API_KEY
// 4. Redeploy
// ============================================================

const DECOR8_API_KEY = process.env.DECOR8_API_KEY || "";

// Decor8 真实API endpoint
const DECOR8_ENDPOINT = "https://api.decor8.ai/generate_designs_for_room";

// 风格映射：我们的风格名 → Decor8支持的 design_style 枚举值
// 完整列表见 api-docs.decor8.ai
const STYLE_MAP: Record<string, string> = {
  scandinavian: "scandinavian",
  minimalist: "minimalist",
  cozy_warm: "farmhouse",       // Decor8没有cozy_warm，用farmhouse近似
  budget_friendly: "modern",     // 用modern近似
  japandi: "japandi",
  soft_modern: "contemporary",   // 用contemporary近似
  industrial: "industrial",
  mid_century_modern: "midcenturymodern",
  // 也兼容直接传来的Decor8原生值
  modern: "modern",
  boho: "boho",
  traditional: "traditional",
  coastal: "coastal",
  farmhouse: "farmhouse",
  contemporary: "contemporary",
};

// 房间映射：中文房间名 → Decor8支持的 room_type 枚举值
const ROOM_MAP: Record<string, string> = {
  客厅: "livingroom",
  厨房: "kitchen",
  主卧: "bedroom",
  次卧: "bedroom",
  卫生间: "bathroom",
  阳台: "balcony",
  玄关: "foyer",
  书房: "study_room",
  餐厅: "diningroom",
  儿童房: "kidsroom",
  // 英文直传兼容
  livingroom: "livingroom",
  kitchen: "kitchen",
  bedroom: "bedroom",
  bathroom: "bathroom",
};

/**
 * 将上传的图片文件转成 base64 data URL
 * 用于临时图片托管（部分API支持data URL作为input_image_url）
 */
async function fileToBase64Url(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  const mimeType = file.type || "image/jpeg";
  return `data:${mimeType};base64,${base64}`;
}

/**
 * 将图片上传到免费图床获取公开URL
 * 使用 imgbb.com 免费API（不需要注册也有基础额度）
 * 
 * 如果你有自己的云存储（七牛/阿里云OSS/Cloudinary），
 * 替换此函数上传到你的存储服务即可
 */
async function uploadToTempHost(file: File): Promise<string> {
  // 方案1：使用 Vercel Blob（推荐，需要安装 @vercel/blob）
  // import { put } from '@vercel/blob';
  // const blob = await put(file.name, file, { access: 'public' });
  // return blob.url;

  // 方案2：直接用base64 data URL（某些API支持）
  // 注意：Decor8可能不支持data URL，需要测试
  const base64Url = await fileToBase64Url(file);
  return base64Url;

  // 方案3：使用免费图床 API（如 imgbb, imgur等）
  // 取消下面的注释并设置 IMGBB_API_KEY 环境变量
  /*
  const IMGBB_KEY = process.env.IMGBB_API_KEY || "";
  if (IMGBB_KEY) {
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const formData = new FormData();
    formData.append("key", IMGBB_KEY);
    formData.append("image", base64);
    const res = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      body: formData,
    });
    if (res.ok) {
      const data = await res.json();
      return data.data.url;
    }
  }
  */
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log("=".repeat(50));
  console.log("[route.ts] 请求到达:", new Date().toISOString());
  console.log("[route.ts] DECOR8_API_KEY:", DECOR8_API_KEY ? `存在(${DECOR8_API_KEY.length}字符)` : "❌ 未配置");

  try {
    const contentType = request.headers.get("content-type") || "";

    // ============================================================
    // JSON请求：生成风格种子
    // ============================================================
    if (contentType.includes("application/json")) {
      const body = await request.json();
      if (body.action === "generate_style_seed") {
        const seed = `seed_${body.style || "scandinavian"}_${Date.now()}`;
        return NextResponse.json({ styleSeed: seed });
      }
      return NextResponse.json({ error: "未知action" }, { status: 400 });
    }

    // ============================================================
    // FormData请求：渲染单个房间
    // ============================================================
    const formData = await request.formData();
    const image = formData.get("image") as File | null;
    const style = (formData.get("style") as string) || "scandinavian";
    const roomType = (formData.get("room_type") as string) || "客厅";
    const planId = (formData.get("plan_id") as string) || "pro";

    if (!image || !image.type.startsWith("image/")) {
      return NextResponse.json({ error: "请上传有效图片" }, { status: 400 });
    }

    console.log("[route.ts] 图片:", image.name, image.size, "bytes", image.type);
    console.log("[route.ts] 风格:", style, "房间:", roomType);

    // ============================================================
    // 调用 Decor8 AI
    // ============================================================
    if (!DECOR8_API_KEY) {
      console.error("[route.ts] ❌ DECOR8_API_KEY 未配置!");
      return NextResponse.json({
        rendered_image_url: "",
        design_description: "请先配置API Key",
        recommended_materials: [],
        _error: "DECOR8_API_KEY 环境变量未设置。请在Vercel → Settings → Environment Variables中添加",
      });
    }

    // 步骤1：把图片转成可访问的URL
    console.log("[route.ts] 正在处理图片...");
    let imageUrl: string;
    try {
      imageUrl = await uploadToTempHost(image);
      console.log("[route.ts] 图片URL类型:", imageUrl.startsWith("data:") ? "base64 data URL" : "HTTP URL");
      console.log("[route.ts] URL长度:", imageUrl.length);
    } catch (uploadErr) {
      console.error("[route.ts] 图片处理失败:", uploadErr);
      return NextResponse.json({
        rendered_image_url: "",
        _error: "图片处理失败",
      });
    }

    // 步骤2：构造Decor8 API请求
    const decor8RoomType = ROOM_MAP[roomType] || ROOM_MAP["客厅"] || "livingroom";
    const decor8Style = STYLE_MAP[style] || "modern";
    const numImages = planId === "basic" ? 1 : planId === "designer" ? 1 : 1;

    const requestBody = {
      input_image_url: imageUrl,
      room_type: decor8RoomType,
      design_style: decor8Style,
      num_images: numImages,
    };

    console.log("[route.ts] Decor8请求体:", {
      ...requestBody,
      input_image_url: requestBody.input_image_url.substring(0, 60) + "...",
    });

    // 步骤3：调用Decor8 API
    try {
      const response = await fetch(DECOR8_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${DECOR8_API_KEY}`,
        },
        body: JSON.stringify(requestBody),
      });

      console.log("[route.ts] Decor8状态码:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("[route.ts] Decor8返回keys:", JSON.stringify(Object.keys(data)));

        // Decor8 返回格式: { info: { images: [{ url: "..." }] } }
        const renderedUrl =
          data?.info?.images?.[0]?.url ||
          data?.info?.url ||
          data?.images?.[0]?.url ||
          data?.url ||
          data?.image_url ||
          data?.rendered_url ||
          data?.output_url ||
          "";

        const elapsed = Date.now() - startTime;
        console.log("[route.ts] 渲染图URL:", renderedUrl ? renderedUrl.substring(0, 100) : "❌ 空");
        console.log(`[route.ts] 耗时: ${elapsed}ms`);

        if (renderedUrl) {
          console.log("[route.ts] ✅ 成功!");
          return NextResponse.json({
            rendered_image_url: renderedUrl,
            design_description: `${roomType} - ${decor8Style}风格AI渲染完成`,
            recommended_materials: [],
          });
        } else {
          // API返回200但没找到图片URL
          console.warn("[route.ts] ⚠️ API返回200但无图片URL");
          console.warn("[route.ts] 完整返回:", JSON.stringify(data).substring(0, 1000));
          return NextResponse.json({
            rendered_image_url: "",
            _error: "API返回成功但未包含图片URL",
            _raw_keys: Object.keys(data),
            _raw_preview: JSON.stringify(data).substring(0, 300),
          });
        }
      } else {
        const errorText = await response.text().catch(() => "无法读取");
        console.error(`[route.ts] ❌ Decor8错误 ${response.status}:`, errorText.substring(0, 500));

        const errorMessages: Record<number, string> = {
          401: "API Key无效。去 prod-app.decor8.ai → APIs 重新生成Key",
          403: "API Key无权限或账户被停用",
          404: "API endpoint不存在（不应该发生，请联系开发者）",
          422: "请求参数有误（可能是图片URL格式不对或room_type/design_style值无效）",
          429: "调用频率超限，请稍后重试",
        };

        return NextResponse.json({
          rendered_image_url: "",
          _error: errorMessages[response.status] || `Decor8返回${response.status}`,
          _detail: errorText.substring(0, 300),
        });
      }
    } catch (fetchErr) {
      console.error("[route.ts] Decor8请求异常:", fetchErr);
      return NextResponse.json({
        rendered_image_url: "",
        _error: `网络请求失败: ${String(fetchErr)}`,
      });
    }
  } catch (error) {
    console.error("[route.ts] 未捕获异常:", error);
    return NextResponse.json(
      { error: "服务异常", details: String(error) },
      { status: 500 }
    );
  }
}
