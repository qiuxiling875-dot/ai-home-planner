import { NextRequest, NextResponse } from "next/server";

// ============================================================
// AI渲染后端API路由
//
// 【调试指南】
// 部署后在 Vercel Dashboard → Deployments → 最新部署 → Function Logs
// 可以看到下面所有 console.log 的输出
//
// 【常见问题】
// Q: 返回 rendered_image_url 为空
// A: 检查以下几点：
//    1. DECOR8_API_KEY 是否在Vercel环境变量中正确设置
//    2. 设置后是否 Redeploy 了（点 Redeploy 按钮）
//    3. Decor8 API的真实endpoint是否正确（去官网确认）
//    4. API Key是否有效（未过期、未超额度）
//    5. 图片格式是否被API支持
// ============================================================

const DECOR8_API_KEY = process.env.DECOR8_API_KEY || "";
const REIMAGINE_API_KEY = process.env.REIMAGINE_API_KEY || "";

// 风格映射
const STYLE_MAP: Record<string, string> = {
  nordic: "scandinavian",
  minimal: "minimalist",
  warm: "cozy_warm",
  lowcost: "budget_friendly",
  japanese: "japandi",
  cream: "soft_modern",
  industrial: "industrial",
  retro: "mid_century_modern",
  // 直接传来的API风格名也兼容
  scandinavian: "scandinavian",
  minimalist: "minimalist",
};

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log("========================================");
  console.log("[route.ts] API被调用, 时间:", new Date().toISOString());
  console.log("[route.ts] DECOR8_API_KEY 存在:", !!DECOR8_API_KEY, "长度:", DECOR8_API_KEY.length);
  console.log("[route.ts] REIMAGINE_API_KEY 存在:", !!REIMAGINE_API_KEY);

  try {
    const contentType = request.headers.get("content-type") || "";
    console.log("[route.ts] Content-Type:", contentType);

    // ============================================================
    // JSON请求：生成风格种子
    // ============================================================
    if (contentType.includes("application/json")) {
      const body = await request.json();
      console.log("[route.ts] JSON请求, action:", body.action);

      if (body.action === "generate_style_seed") {
        // 如果API支持种子生成，在这里调用
        // 大部分AI渲染API不需要单独的种子步骤
        // 风格一致性主要靠传入相同的 style 参数实现
        const seed = `seed_${body.style || "scandinavian"}_${Date.now()}`;
        console.log("[route.ts] 生成风格种子:", seed);
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
    const styleSeed = (formData.get("style_seed") as string) || "";
    const roomType = (formData.get("room_type") as string) || "客厅";
    const planId = (formData.get("plan_id") as string) || "pro";

    console.log("[route.ts] 渲染请求参数:", {
      hasImage: !!image,
      imageSize: image?.size,
      imageType: image?.type,
      style,
      roomType,
      planId,
    });

    if (!image) {
      console.error("[route.ts] 错误: 没有收到图片文件");
      return NextResponse.json({ error: "请上传图片" }, { status: 400 });
    }

    // 验证文件
    if (!image.type.startsWith("image/")) {
      console.error("[route.ts] 错误: 文件不是图片, type:", image.type);
      return NextResponse.json({ error: "请上传图片文件" }, { status: 400 });
    }

    const apiStyle = STYLE_MAP[style] || style;

    // ============================================================
    // 尝试调用 Decor8 AI
    // ============================================================
    if (DECOR8_API_KEY) {
      console.log("[route.ts] 开始调用 Decor8 AI...");

      try {
        const apiFormData = new FormData();
        apiFormData.append("image", image);
        apiFormData.append("style", apiStyle);
        if (styleSeed) apiFormData.append("style_seed", styleSeed);

        // ⚠️ 重要：下面的URL可能需要根据Decor8实际文档修改
        // 去 https://www.decor8.ai 查看最新API文档确认endpoint
        const apiUrl = "https://api.decor8.ai/v1/render";
        console.log("[route.ts] 请求URL:", apiUrl);

        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${DECOR8_API_KEY}`,
          },
          body: apiFormData,
        });

        console.log("[route.ts] Decor8响应状态:", response.status);
        console.log("[route.ts] Decor8响应headers:", Object.fromEntries(response.headers.entries()));

        if (response.ok) {
          const data = await response.json();
          console.log("[route.ts] Decor8返回数据的key:", Object.keys(data));
          console.log("[route.ts] Decor8完整返回:", JSON.stringify(data).substring(0, 500));

          // ⚠️ 不同API返回图片URL的字段名不同
          // Decor8可能用: image_url, rendered_url, output_url, url, result_url 等
          // 打印所有key帮助你找到正确的字段名
          const imageUrl =
            data.image_url ||
            data.rendered_url ||
            data.output_url ||
            data.url ||
            data.result_url ||
            data.generated_image ||
            data.result?.url ||
            data.result?.image_url ||
            data.data?.url ||
            data.data?.image_url ||
            "";

          console.log("[route.ts] 提取到的图片URL:", imageUrl ? imageUrl.substring(0, 100) : "（空）");

          if (imageUrl) {
            const elapsed = Date.now() - startTime;
            console.log(`[route.ts] ✅ 渲染成功! 耗时: ${elapsed}ms`);

            return NextResponse.json({
              rendered_image_url: imageUrl,
              design_description:
                data.description || `${roomType}${apiStyle}风格AI渲染完成`,
              recommended_materials: data.materials || [],
            });
          } else {
            console.warn("[route.ts] ⚠️ Decor8返回200但没找到图片URL!");
            console.warn("[route.ts] 完整数据:", JSON.stringify(data));
          }
        } else {
          // API返回了错误
          const errorText = await response.text().catch(() => "无法读取");
          console.error(`[route.ts] ❌ Decor8返回错误 ${response.status}:`, errorText.substring(0, 500));

          // 常见错误码解释
          if (response.status === 401) {
            console.error("[route.ts] → 401 = API Key无效或已过期");
          } else if (response.status === 403) {
            console.error("[route.ts] → 403 = API Key无权限或账户被禁用");
          } else if (response.status === 429) {
            console.error("[route.ts] → 429 = 调用频率超限，请稍后重试");
          } else if (response.status === 404) {
            console.error("[route.ts] → 404 = API endpoint不存在，请检查URL是否正确");
          } else if (response.status >= 500) {
            console.error("[route.ts] → 5xx = Decor8服务端错误");
          }
        }
      } catch (fetchError) {
        console.error("[route.ts] Decor8请求异常:", fetchError);
        // 可能的原因：DNS解析失败、网络超时、URL格式错误
      }
    } else {
      console.warn("[route.ts] ⚠️ DECOR8_API_KEY 未配置，跳过Decor8调用");
    }

    // ============================================================
    // Fallback：尝试 ReimagineHome AI
    // ============================================================
    if (REIMAGINE_API_KEY) {
      console.log("[route.ts] 尝试 ReimagineHome fallback...");

      try {
        const apiFormData = new FormData();
        apiFormData.append("image", image);
        apiFormData.append("style", apiStyle);
        apiFormData.append("room_type", roomType);

        const response = await fetch("https://api.reimaginehome.ai/v1/redesign", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${REIMAGINE_API_KEY}`,
          },
          body: apiFormData,
        });

        console.log("[route.ts] ReimagineHome响应:", response.status);

        if (response.ok) {
          const data = await response.json();
          const imageUrl =
            data.image_url || data.output_url || data.url || data.result_url || "";

          if (imageUrl) {
            console.log("[route.ts] ✅ ReimagineHome成功!");
            return NextResponse.json({
              rendered_image_url: imageUrl,
              design_description: data.description || "",
              recommended_materials: data.materials || [],
            });
          }
        }
      } catch (err) {
        console.error("[route.ts] ReimagineHome异常:", err);
      }
    }

    // ============================================================
    // 两者都失败或都未配置
    // ============================================================
    const elapsed = Date.now() - startTime;
    console.warn(`[route.ts] ⚠️ 所有AI API都未返回有效结果 (${elapsed}ms)`);
    console.warn("[route.ts] → DECOR8_API_KEY配置:", !!DECOR8_API_KEY);
    console.warn("[route.ts] → REIMAGINE_API_KEY配置:", !!REIMAGINE_API_KEY);

    return NextResponse.json({
      rendered_image_url: "",
      design_description: "AI渲染暂时不可用",
      recommended_materials: [],
      _debug: {
        hasDecor8Key: !!DECOR8_API_KEY,
        hasReimagineKey: !!REIMAGINE_API_KEY,
        elapsed_ms: elapsed,
        message: !DECOR8_API_KEY && !REIMAGINE_API_KEY
          ? "请在Vercel环境变量中配置 DECOR8_API_KEY，然后Redeploy"
          : "API Key已配置但调用失败，请查看Vercel Logs排查",
      },
    });
  } catch (error) {
    console.error("[route.ts] 未捕获异常:", error);
    return NextResponse.json(
      { error: "服务异常", details: String(error) },
      { status: 500 }
    );
  }
}
