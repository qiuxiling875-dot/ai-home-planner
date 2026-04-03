import { NextRequest, NextResponse } from "next/server";

const DECOR8_API_KEY = process.env.DECOR8_API_KEY || "";

export async function POST(request: NextRequest) {
  console.log("=== API 被调用 ===");
  console.log("DECOR8_API_KEY 是否存在？", DECOR8_API_KEY ? "是" : "否");

  try {
    const formData = await request.formData();
    const image = formData.get("image") as File;
    const style = (formData.get("style") as string) || "scandinavian";
    const styleSeed = (formData.get("style_seed") as string) || "";

    console.log("收到图片，大小:", image?.size);
    console.log("风格:", style);

    if (!DECOR8_API_KEY) {
      console.error("没有 DECOR8_API_KEY");
      return NextResponse.json({ error: "没有配置 API Key" }, { status: 500 });
    }

    const apiFormData = new FormData();
    apiFormData.append("image", image);
    apiFormData.append("style", style);
    if (styleSeed) apiFormData.append("style_seed", styleSeed);

    const response = await fetch("https://api.decor8.ai/v1/render", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${DECOR8_API_KEY}`,
      },
      body: apiFormData,
    });

    console.log("Decor8 返回状态码:", response.status);

    if (response.ok) {
      const data = await response.json();
      console.log("Decor8 返回成功");
      return NextResponse.json({
        rendered_image_url: data.image_url || data.rendered_url || "",
        design_description: data.description || "AI 自动生成的风格统一设计",
        recommended_materials: data.materials || ["大理石", "不锈钢", "超白玻璃"],
      });
    } else {
      console.error("Decor8 调用失败", await response.text());
    }
  } catch (error) {
    console.error("API 异常:", error);
  }

  // 最终 fallback（仅供调试）
  return NextResponse.json({
    rendered_image_url: "",
    design_description: "API 调用失败，请检查 Key 和网络",
    recommended_materials: ["请确认 Key 已保存并 Redeploy"],
  });
}
