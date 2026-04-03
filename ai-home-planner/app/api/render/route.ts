import { NextRequest, NextResponse } from "next/server";

const DECOR8_API_KEY = process.env.DECOR8_API_KEY || "";
const IMGBB_API_KEY = process.env.IMGBB_API_KEY || "";
const DECOR8_ENDPOINT = "https://api.decor8.ai/generate_designs_for_room";

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

async function uploadToImgbb(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");

  const formData = new URLSearchParams();
  formData.append("key", IMGBB_API_KEY);
  formData.append("image", base64);

  const res = await fetch("https://api.imgbb.com/1/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`imgbb上传失败: ${res.status} ${err}`);
  }

  const data = await res.json();
  return data.data.url;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log("[route.ts] 请求到达:", new Date().toISOString());
  console.log("[route.ts] DECOR8_API_KEY:", DECOR8_API_KEY ? "存在" : "未配置");
  console.log("[route.ts] IMGBB_API_KEY:", IMGBB_API_KEY ? "存在" : "未配置");

  try {
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const body = await request.json();
      if (body.action === "generate_style_seed") {
        return NextResponse.json({ styleSeed: `seed_${body.style}_${Date.now()}` });
      }
      return NextResponse.json({ error: "未知action" }, { status: 400 });
    }

    const formData = await request.formData();
    const image = formData.get("image") as File | null;
    const style = (formData.get("style") as string) || "scandinavian";
    const roomType = (formData.get("room_type") as string) || "客厅";

    if (!image || !image.type.startsWith("image/")) {
      return NextResponse.json({ error: "请上传有效图片" }, { status: 400 });
    }

    console.log("[route.ts] 图片:", image.name, image.size, "bytes");

    if (!DECOR8_API_KEY) {
      return NextResponse.json({ rendered_image_url: "", _error: "DECOR8_API_KEY未设置" });
    }
    if (!IMGBB_API_KEY) {
      return NextResponse.json({ rendered_image_url: "", _error: "IMGBB_API_KEY未设置" });
    }

    // 步骤1：上传图片到 imgbb 获取公开URL
    console.log("[route.ts] 上传图片到imgbb...");
    let publicImageUrl: string;
    try {
      publicImageUrl = await uploadToImgbb(image);
      console.log("[route.ts] imgbb上传成功:", publicImageUrl);
    } catch (err) {
      console.error("[route.ts] imgbb上传失败:", err);
      return NextResponse.json({ rendered_image_url: "", _error: String(err) });
    }

    // 步骤2：调用 Decor8 AI
    console.log("[route.ts] 调用Decor8 API...");
    const requestBody = {
      input_image_url: publicImageUrl,
      room_type: ROOM_MAP[roomType] || "livingroom",
      design_style: STYLE_MAP[style] || "modern",
      num_images: 1,
    };
    console.log("[route.ts] 请求体:", JSON.stringify({ ...requestBody, input_image_url: publicImageUrl.substring(0, 50) + "..." }));

    const response = await fetch(DECOR8_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${DECOR8_API_KEY}` },
      body: JSON.stringify(requestBody),
    });

    console.log("[route.ts] Decor8状态码:", response.status);

    if (response.ok) {
      const data = await response.json();
      console.log("[route.ts] 返回keys:", Object.keys(data));
      const renderedUrl = data?.info?.images?.[0]?.url || data?.info?.url || data?.url || "";
      if (renderedUrl) {
        console.log("[route.ts] 成功! 耗时:", Date.now() - startTime, "ms");
        return NextResponse.json({ rendered_image_url: renderedUrl, design_description: `${roomType}渲染完成` });
      }
      console.warn("[route.ts] 200但无图片:", JSON.stringify(data).substring(0, 500));
      return NextResponse.json({ rendered_image_url: "", _error: "无图片URL", _raw: JSON.stringify(data).substring(0, 300) });
    }

    const errorText = await response.text().catch(() => "");
    console.error("[route.ts] Decor8错误:", response.status, errorText.substring(0, 300));
    return NextResponse.json({ rendered_image_url: "", _error: `Decor8返回${response.status}`, _detail: errorText.substring(0, 200) });
  } catch (error) {
    console.error("[route.ts] 异常:", error);
    return NextResponse.json({ error: "服务异常" }, { status: 500 });
  }
}
