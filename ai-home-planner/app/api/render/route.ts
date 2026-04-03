import { NextRequest, NextResponse } from "next/server";

// ============================================================
// AI渲染后端API路由
//
// 【作用】
// 前端 → 此API Route → Decor8 AI / ReimagineHome API → 返回渲染图
// API Key只在服务端，不暴露给前端浏览器
//
// 【配置步骤】
// 1. 本地：在 .env.local 中设置 DECOR8_API_KEY 和/或 REIMAGINE_API_KEY
// 2. Vercel：Dashboard → Settings → Environment Variables 添加
//
// 【API调用逻辑】
// - 支持两个动作：generate_style_seed（生成风格种子）和 render（渲染单个房间）
// - 优先使用Decor8 AI，失败时自动切换到ReimagineHome
// - 两者都未配置时返回模拟数据（演示模式）
// ============================================================

// 从环境变量安全读取API Key
const DECOR8_API_KEY = process.env.DECOR8_API_KEY || "";
const REIMAGINE_API_KEY = process.env.REIMAGINE_API_KEY || "";

// 用户风格 → API风格参数映射
const STYLE_MAP: Record<string, string> = {
  nordic: "scandinavian",
  minimal: "minimalist",
  warm: "cozy_warm",
  lowcost: "budget_friendly",
  japanese: "japandi",
  cream: "soft_modern",
  industrial: "industrial",
  retro: "mid_century_modern",
};

// 方案 → 渲染质量映射
const QUALITY_MAP: Record<string, string> = {
  basic: "standard",
  pro: "high",
  designer: "photorealistic",
};

// 房间名 → API房间类型映射
const ROOM_TYPE_MAP: Record<string, string> = {
  客厅: "living_room",
  厨房: "kitchen",
  主卧: "bedroom",
  次卧: "bedroom",
  卫生间: "bathroom",
  阳台: "balcony",
  玄关: "entryway",
  书房: "study",
};

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";

    // ============================================================
    // 分支1：JSON请求 → 生成风格种子（style_seed）
    // 风格种子是保证全屋风格一致性的核心机制
    // ============================================================
    if (contentType.includes("application/json")) {
      const body = await request.json();

      if (body.action === "generate_style_seed") {
        const apiStyle = STYLE_MAP[body.style] || "scandinavian";

        // === 尝试Decor8 AI ===
        if (DECOR8_API_KEY) {
          try {
            const response = await fetch(
              "https://api.decor8.ai/v1/style-seed",
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${DECOR8_API_KEY}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  style: apiStyle,
                  budget_range: body.budget || "moderate",
                  area_sqm: body.area || "80",
                }),
              }
            );
            if (response.ok) {
              const data = await response.json();
              return NextResponse.json({
                styleSeed: data.seed || data.style_seed,
                provider: "decor8",
              });
            }
          } catch (err) {
            console.warn("Decor8 style seed generation failed:", err);
          }
        }

        // === 尝试ReimagineHome ===
        if (REIMAGINE_API_KEY) {
          try {
            const response = await fetch(
              "https://api.reimaginehome.ai/v1/style-seed",
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${REIMAGINE_API_KEY}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ style: apiStyle }),
              }
            );
            if (response.ok) {
              const data = await response.json();
              return NextResponse.json({
                styleSeed: data.seed || data.style_seed,
                provider: "reimagine",
              });
            }
          } catch (err) {
            console.warn("ReimagineHome style seed generation failed:", err);
          }
        }

        // === 均未配置：返回模拟风格种子 ===
        return NextResponse.json({
          styleSeed: `mock_seed_${apiStyle}_${Date.now()}`,
          provider: "mock",
          _message:
            "演示模式：请配置 DECOR8_API_KEY 或 REIMAGINE_API_KEY 环境变量以启用真实AI渲染",
        });
      }

      return NextResponse.json(
        { error: "未知的JSON请求动作" },
        { status: 400 }
      );
    }

    // ============================================================
    // 分支2：FormData请求 → 渲染单个房间
    // ============================================================
    const formData = await request.formData();
    const image = formData.get("image") as File | null;
    const style = (formData.get("style") as string) || "nordic";
    const styleSeed = (formData.get("style_seed") as string) || "";
    const roomType = (formData.get("room_type") as string) || "客厅";
    const planId = (formData.get("plan_id") as string) || "pro";
    const quality = QUALITY_MAP[planId] || "high";
    const apiStyle = STYLE_MAP[style] || "scandinavian";
    const apiRoomType = ROOM_TYPE_MAP[roomType] || "living_room";

    if (!image) {
      return NextResponse.json(
        { error: "请上传图片文件" },
        { status: 400 }
      );
    }

    // 验证文件类型
    if (!image.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "文件格式不支持，请上传JPG/PNG/WebP图片" },
        { status: 400 }
      );
    }

    // 验证文件大小（最大10MB）
    if (image.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "图片大小不能超过10MB" },
        { status: 400 }
      );
    }

    // === 方案一：调用Decor8 AI ===
    if (DECOR8_API_KEY) {
      try {
        const apiFormData = new FormData();
        apiFormData.append("image", image);
        apiFormData.append("style", apiStyle);
        apiFormData.append("room_type", apiRoomType);
        apiFormData.append("quality", quality);
        if (styleSeed) {
          // 关键参数！确保全屋风格一致
          apiFormData.append("style_seed", styleSeed);
        }

        const response = await fetch("https://api.decor8.ai/v1/render", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${DECOR8_API_KEY}`,
          },
          body: apiFormData,
        });

        if (response.ok) {
          const data = await response.json();
          return NextResponse.json({
            rendered_image_url: data.image_url || data.rendered_url || "",
            design_description: data.description || `${roomType}${apiStyle}风格渲染完成`,
            recommended_materials: data.materials || [],
            provider: "decor8",
          });
        }
        console.warn(
          "Decor8 render failed, status:",
          response.status,
          "trying fallback..."
        );
      } catch (err) {
        console.error("Decor8 render error:", err);
      }
    }

    // === 方案二：Fallback到ReimagineHome ===
    if (REIMAGINE_API_KEY) {
      try {
        const apiFormData = new FormData();
        apiFormData.append("image", image);
        apiFormData.append("style", apiStyle);
        apiFormData.append("room_type", apiRoomType);
        apiFormData.append("consistency_mode", "true"); // ReimagineHome一致性模式

        const response = await fetch(
          "https://api.reimaginehome.ai/v1/redesign",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${REIMAGINE_API_KEY}`,
            },
            body: apiFormData,
          }
        );

        if (response.ok) {
          const data = await response.json();
          return NextResponse.json({
            rendered_image_url: data.image_url || data.output_url || "",
            design_description: data.description || "",
            recommended_materials: data.materials || [],
            provider: "reimagine",
          });
        }
      } catch (err) {
        console.error("ReimagineHome render error:", err);
      }
    }

    // === 均未配置或均失败：返回模拟数据 ===
    return NextResponse.json({
      rendered_image_url: "",
      design_description: `${roomType}采用${apiStyle}风格渲染完成（演示模式）`,
      recommended_materials: ["请配置AI API Key查看真实材质推荐"],
      provider: "mock",
      _mock: true,
      _message:
        "当前为演示模式。请在 .env.local 中配置 DECOR8_API_KEY 或 REIMAGINE_API_KEY",
    });
  } catch (error) {
    console.error("Render API unexpected error:", error);
    return NextResponse.json(
      {
        error: "渲染服务暂时不可用，请稍后重试",
        details:
          process.env.NODE_ENV === "development"
            ? String(error)
            : undefined,
      },
      { status: 500 }
    );
  }
}
