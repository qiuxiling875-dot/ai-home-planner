import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

// ============================================================
// AI渲染后端API路由 — 最终修正版
//
// 【完整调用链路】
// 1. 前端上传图片 → 本route接收
// 2. 图片上传到 Vercel Blob → 拿到 https:// 公开URL
// 3. 用这个URL调用 Decor8 API → 拿到渲染图URL
// 4. 返回渲染图URL给前端显示
//
// 【前置条件】
// 1. Vercel Dashboard → Storage → 创建 Blob Store
//    （创建后自动添加 BLOB_READ_WRITE_TOKEN 环境变量）
// 2. 安装依赖: npm install @vercel/blob
// 3. 环境变量 DECOR8_API_KEY 已配置
// 4. Redeploy
// ============================================================

const DECOR8_API_KEY = process.env.DECOR8_API_KEY || "";
const DECOR8_ENDPOINT = "https://api.decor8.ai/generate_designs_for_room";

// 风格映射
const STYLE_MAP: Record<string, string> = {
  scandinavian: "scandinavian",
  minimalist: "minimalist",
  cozy_warm: "farmhouse",
  budget_friendly: "modern",
  japandi: "japandi",
  soft_modern: "contemporary",
  industrial: "industrial",
  mid_century_modern: "midcenturymodern",
  modern: "modern",
  boho: "boho",
  traditional: "traditional",
  coastal: "coastal",
  farmhouse: "farmhouse",
  contemporary: "contemporary",
};

// 房间映射
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
  livingroom: "livingroom",
  kitchen: "kitchen",
  bedroom: "bedroom",
  bathroom: "bathroom",
};

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

    if (!DECOR8_API_KEY) {
      console.error("[route.ts] ❌ DECOR8_API_KEY 未配置!");
      return NextResponse.json({
        rendered_image_url: "",
        _error: "DECOR8_API_KEY 未设置",
      });
    }

    // ============================================================
    // 步骤1：上传图片到 Vercel Blob 获取公开 https URL
    // 这是关键步骤！Decor8 API 要求 input_image_url 是公开可访问的URL
    // 不接受 base64 data URL 或直接上传文件
    // ============================================================
    console.log("[route.ts] 步骤1: 上传图片到 Vercel Blob...");
    let publicImageUrl: string;

    try {
      const filename = `room_${Date.now()}_${image.name || "photo.jpg"}`;
      const blob = await put(filename, image, {
        access: "public",
        addRandomSuffix: true,
      });
      publicImageUrl = blob.url;
      console.log("[route.ts] ✅ Blob上传成功:", publicImageUrl);
    } catch (blobErr) {
      console.error("[route.ts] ❌ Blob上传失败:", blobErr);
      console.error("[route.ts] → 请确认已在 Vercel Dashboard → Storage 创建了 Blob Store");
      console.error("[route.ts] → 创建后会自动添加 BLOB_READ_WRITE_TOKEN 环境变量");
      return NextResponse.json({
        rendered_image_url: "",
        _error: "图片上传失败。请在Vercel Dashboard → Storage中创建Blob Store",
        _detail: String(blobErr),
      });
    }

    // ============================================================
    // 步骤2：调用 Decor8 AI API
    // ============================================================
    console.log("[route.ts] 步骤2: 调用 Decor8 API...");

    const decor8RoomType = ROOM_MAP[roomType] || "livingroom";
    const decor8Style = STYLE_MAP[style] || "modern";

    const requestBody = {
      input_image_url: publicImageUrl,
      room_type: decor8RoomType,
      design_style: decor8Style,
      num_images: 1,
    };

    console.log("[route.ts] Decor8请求:", JSON.stringify({
      ...requestBody,
      input_image_url: publicImageUrl.substring(0, 80) + "...",
    }));

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
        console.log("[route.ts] Decor8返回keys:", Object.keys(data));

        // Decor8 返回格式: { info: { images: [{ url: "..." }] } }
        const renderedUrl =
          data?.info?.images?.[0]?.url ||
          data?.info?.url ||
          data?.images?.[0]?.url ||
          data?.url ||
          data?.image_url ||
          "";

        const elapsed = Date.now() - startTime;

        if (renderedUrl) {
          console.log(`[route.ts] ✅ 渲染成功! URL: ${renderedUrl.substring(0, 80)}... (${elapsed}ms)`);
          return NextResponse.json({
            rendered_image_url: renderedUrl,
            design_description: `${roomType} - ${decor8Style}风格AI渲染完成`,
            recommended_materials: [],
          });
        } else {
          console.warn("[route.ts] ⚠️ 200但无图片URL, 完整返回:", JSON.stringify(data).substring(0, 500));
          return NextResponse.json({
            rendered_image_url: "",
            _error: "API返回成功但未包含图片URL",
            _raw: JSON.stringify(data).substring(0, 300),
          });
        }
      } else {
        const errorText = await response.text().catch(() => "无法读取");
        console.error(`[route.ts] ❌ Decor8错误 ${response.status}:`, errorText.substring(0, 500));

        const tips: Record<number, string> = {
          401: "API Key无效 → prod-app.decor8.ai 重新生成",
          403: "账户无权限或被停用",
          422: "参数错误（room_type或design_style值可能不在Decor8支持列表中）",
          429: "频率限制，稍后重试",
          500: "Decor8服务端错误，稍后重试",
        };

        return NextResponse.json({
          rendered_image_url: "",
          _error: tips[response.status] || `Decor8返回 ${response.status}`,
          _detail: errorText.substring(0, 200),
        });
      }
    } catch (fetchErr) {
      console.error("[route.ts] Decor8网络异常:", fetchErr);
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
