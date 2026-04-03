import { NextRequest, NextResponse } from "next/server";

const DECOR8_API_KEY = process.env.DECOR8_API_KEY || "";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get("image") as File;
    const style = (formData.get("style") as string) || "scandinavian";
    const styleSeed = (formData.get("style_seed") as string) || "";
    const roomType = (formData.get("room_type") as string) || "living_room";
    const planId = (formData.get("plan_id") as string) || "pro";

    console.log("收到渲染请求:", { roomType, style, styleSeed: styleSeed ? "有" : "无" });

    if (!image) {
      return NextResponse.json({ error: "没有图片" }, { status: 400 });
    }

    // === 真实调用 Decor8 AI ===
    if (DECOR8_API_KEY) {
      console.log("正在调用 Decor8 AI...");
      const apiFormData = new FormData();
      apiFormData.append("image", image);
      apiFormData.append("style", style);
      if (styleSeed) apiFormData.append("style_seed", styleSeed);
      apiFormData.append("room_type", roomType);
      apiFormData.append("quality", planId === "designer" ? "photorealistic" : "high");

      const response = await fetch("https://api.decor8.ai/v1/render", {
        method: "POST",
        headers: { Authorization: `Bearer ${DECOR8_API_KEY}` },
        body: apiFormData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Decor8 返回成功");
        return NextResponse.json({
          rendered_image_url: data.image_url || data.rendered_url || "",
          design_description: data.description || "AI 自动生成的风格统一设计",
          recommended_materials: data.materials || ["大理石", "不锈钢", "超白玻璃"],
        });
      } else {
        console.error("Decor8 返回错误:", response.status);
      }
    }

    // 如果 Decor8 失败，返回清晰提示
    return NextResponse.json({
      rendered_image_url: "",
      design_description: "API 调用失败，请检查 DECOR8_API_KEY 是否正确",
      recommended_materials: ["请确认 Key 已保存并 Redeploy"],
    });

  } catch (error) {
    console.error("后端渲染错误:", error);
    return NextResponse.json({ error: "渲染服务异常" }, { status: 500 });
  }
}
