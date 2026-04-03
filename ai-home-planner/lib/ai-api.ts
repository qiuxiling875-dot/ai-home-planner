import { NextRequest, NextResponse } from "next/server";

const DECOR8_API_KEY = process.env.DECOR8_API_KEY || "";

export async function POST(request: NextRequest) {
  console.log("=== Decor8 API 被调用 ===");
  console.log("DECOR8_API_KEY 是否存在？", DECOR8_API_KEY ? "是" : "否");

  try {
    const formData = await request.formData();
    const image = formData.get("image") as File;
    const style = (formData.get("style") as string) || "scandinavian";
    const styleSeed = (formData.get("style_seed") as string) || "";

    if (!image) {
      return NextResponse.json({ error: "没有收到图片" }, { status: 400 });
    }

    if (!DECOR8_API_KEY) {
      console.error("缺少 DECOR8_API_KEY");
      return NextResponse.json({ error: "API Key 未配置" }, { status: 500 });
    }

    console.log("准备调用 Decor8，图片大小:", image.size, "风格:", style);

    const apiFormData = new FormData();
    apiFormData.append("image", image);
    apiFormData.append("style", style);
    if (styleSeed) {
      apiFormData.append("style_seed", styleSeed);
    }

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
      console.log("Decor8 调用成功，返回数据:", JSON.stringify(data));

      return NextResponse.json({
        rendered_image_url: data.image_url || data.rendered_url || data.url || "",
        design_description: data.description || "AI 自动生成的风格统一设计",
        recommended_materials: data.materials || ["大理石", "不锈钢", "超白玻璃"],
      });
    } else {
      const errorText = await response.text().catch(() => "无法读取错误信息");
      console.error("Decor8 调用失败:", response.status, errorText);
      return NextResponse.json({
        rendered_image_url: "",
        design_description: `Decor8 API 错误 (${response.status})`,
        recommended_materials: ["请检查 API Key 是否正确"],
      });
    }
  } catch (error) {
    console.error("API 异常:", error);
    return NextResponse.json({
      rendered_image_url: "",
      design_description: "渲染服务异常，请检查控制台日志",
      recommended_materials: ["请确认 Key 和网络"],
    });
  }
}
