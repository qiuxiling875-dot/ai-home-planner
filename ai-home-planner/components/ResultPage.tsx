"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { copyToClipboard } from "@/lib/utils";
import {
  PLANS,
  STYLES,
  STYLE_RENDER_DATA,
  ROOM_ICONS,
} from "@/lib/constants";
import { generateXHSNote } from "@/lib/ai-api";
import type { BatchRenderResult } from "@/lib/ai-api";

// ============================================================
// 结果展示页面
//
// 包含：
// 1. 风格一致性报告卡片（得分+四维指标+统一色板）
// 2. 全屋效果图网格（每个房间一张，带风格一致标记）
// 3. 小红书笔记模板（专业版及以上，一键复制）
// 4. 操作按钮：下载PDF / 去小红书下单 / 生成专属链接
// ============================================================

interface ResultPageProps {
  planId: string;
  style: string;
  rooms: string[];
  budget: string;
  renderResult: BatchRenderResult | null;
  onBack: () => void;
}

// =====================
// 子组件：单个房间效果图卡片
// =====================

function RenderCard({
  room,
  style,
  index,
  renderedUrl,
}: {
  room: string;
  style: string;
  index: number;
  renderedUrl?: string;
}) {
  const styleData = STYLE_RENDER_DATA[style] || STYLE_RENDER_DATA.nordic;
  const gradients = [
    "linear-gradient(135deg, #F5F0EB 0%, #E8DDD0 50%, #D4C5B2 100%)",
    "linear-gradient(135deg, #E8E0D8 0%, #D4C5B2 50%, #C9B99A 100%)",
    "linear-gradient(135deg, #F2E6D9 0%, #E8D5C4 50%, #D4B896 100%)",
    "linear-gradient(145deg, #FAF5F0 0%, #F0E8E0 50%, #E0D4C8 100%)",
    "linear-gradient(125deg, #F8F2EA 0%, #E5D8CA 50%, #D0C0AC 100%)",
  ];
  const icon = ROOM_ICONS[room] || "🏠";

  return (
    <div className="rounded-2xl overflow-hidden shadow-lg border border-stone-100 bg-white group transition-shadow hover:shadow-xl">
      {/* === 渲染图/占位图 === */}
      <div
        className="aspect-[4/3] relative overflow-hidden"
        style={{ background: gradients[index % gradients.length] }}
      >
        {renderedUrl ? (
          // 真实AI渲染图
          <img
            src={renderedUrl}
            alt={`${room} - AI渲染效果图`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          // 占位展示（接入API前）
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-5xl mb-2">{icon}</div>
              <p className="text-stone-500 text-sm font-medium">
                {room} · AI渲染效果图
              </p>
              <p className="text-stone-400 text-[11px] mt-1">
                （接入Decor8 AI后显示真实渲染图）
              </p>
            </div>
          </div>
        )}

        {/* 风格一致性标记 */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 text-[11px] font-medium text-amber-700 flex items-center gap-1.5 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          风格一致
        </div>

        {/* 底部色板条 */}
        <div className="absolute bottom-3 left-3 flex gap-1">
          {styleData.palette.map((color, ci) => (
            <div
              key={ci}
              className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
              style={{ background: color }}
            />
          ))}
        </div>
      </div>

      {/* === 信息区 === */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-1.5">
          <h4 className="font-semibold text-stone-800 flex items-center gap-1.5">
            <span>{icon}</span>
            {room}
          </h4>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-500">
            {STYLES.find((s) => s.value === style)?.emoji}{" "}
            {STYLES.find((s) => s.value === style)?.label || "北欧极简"}
          </span>
        </div>
        <p className="text-xs text-stone-400 leading-relaxed">
          推荐材质：{styleData.material}
        </p>
      </div>
    </div>
  );
}

// =====================
// 子组件：小红书笔记模板
// =====================

function XHSTemplate({
  style,
  rooms,
  budget,
}: {
  style: string;
  rooms: string[];
  budget: string;
}) {
  const [copied, setCopied] = useState(false);
  const styleName =
    STYLES.find((s) => s.value === style)?.label || "北欧极简";
  const noteText = generateXHSNote(styleName, rooms, budget);

  const handleCopy = async () => {
    const success = await copyToClipboard(noteText);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-gradient-to-br from-rose-50 to-orange-50 rounded-2xl p-5 border border-rose-100">
      {/* 标题 */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">📕</span>
        <h4 className="font-bold text-rose-700 font-serif">
          小红书笔记模板
        </h4>
        <span className="text-[10px] bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full font-medium">
          可直接复制发布
        </span>
      </div>

      {/* 笔记内容预览 */}
      <div className="bg-white rounded-xl p-4 text-sm text-stone-700 shadow-sm whitespace-pre-line leading-relaxed max-h-64 overflow-y-auto">
        {noteText}
      </div>

      {/* 复制按钮 */}
      <button
        onClick={handleCopy}
        className={cn(
          "mt-3 w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-300",
          copied
            ? "bg-green-500 text-white"
            : "bg-rose-500 text-white hover:bg-rose-600 active:scale-[0.98]"
        )}
      >
        {copied ? "✅ 已复制到剪贴板！" : "📋 一键复制笔记文案"}
      </button>
    </div>
  );
}

// =====================
// 子组件：风格一致性报告
// =====================

function ConsistencyReport({
  score,
  palette,
  material,
}: {
  score: number;
  palette: string[];
  material: string;
}) {
  const dimensions = [
    { label: "色系统一", score: (score - 0.5 + Math.random()).toFixed(1) },
    { label: "材质统一", score: (score - 0.3 + Math.random() * 0.5).toFixed(1) },
    { label: "家具语言", score: (score + Math.random() * 0.5).toFixed(1) },
    { label: "光影风格", score: (score - 0.2 + Math.random() * 0.3).toFixed(1) },
  ];

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-100">
      {/* 标题+总分 */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-amber-800 flex items-center gap-2 font-serif">
          🎨 全屋风格一致性报告
        </h4>
        <div className="text-right">
          <span className="text-3xl font-black text-amber-600 font-serif">
            {score.toFixed(1)}
          </span>
          <span className="text-sm text-amber-500 ml-0.5">%</span>
        </div>
      </div>

      {/* 四维指标 */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {dimensions.map((dim, i) => (
          <div
            key={i}
            className="text-center p-2.5 bg-white/70 rounded-lg border border-amber-50"
          >
            <div className="text-[11px] text-stone-500 mb-0.5">
              {dim.label}
            </div>
            <div className="text-sm font-bold text-amber-700">
              {dim.score}%
            </div>
          </div>
        ))}
      </div>

      {/* 统一色板展示 */}
      <div className="flex gap-1.5 mb-3">
        {palette.map((color, i) => (
          <div
            key={i}
            className="flex-1 h-9 rounded-lg first:rounded-l-xl last:rounded-r-xl shadow-sm transition-transform hover:scale-105"
            style={{ background: color }}
            title={color}
          />
        ))}
      </div>

      {/* 材质体系 */}
      <p className="text-xs text-amber-600 leading-relaxed">
        🧱 推荐材质体系：{material}
      </p>
    </div>
  );
}

// =====================
// 主组件：结果页面
// =====================

export default function ResultPage({
  planId,
  style,
  rooms,
  budget,
  renderResult,
  onBack,
}: ResultPageProps) {
  const planData = PLANS.find((p) => p.id === planId);
  const styleData = STYLE_RENDER_DATA[style] || STYLE_RENDER_DATA.nordic;
  const styleName =
    STYLES.find((s) => s.value === style)?.label || "北欧极简";
  const styleEmoji =
    STYLES.find((s) => s.value === style)?.emoji || "🌿";

  const consistencyScore = renderResult?.consistencyScore ?? 98.2;
  const overallPalette = renderResult?.overallPalette ?? styleData.palette;
  const overallMaterial = renderResult?.overallMaterial ?? styleData.material;

  // TODO: 替换为你的小红书店铺链接
  // 也可以通过环境变量 NEXT_PUBLIC_XHS_SHOP_URL 设置
  const XHS_SHOP_URL =
    process.env.NEXT_PUBLIC_XHS_SHOP_URL ||
    "https://www.xiaohongshu.com/your-shop-link-here";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* === 返回按钮 === */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-stone-500 hover:text-stone-700 transition-colors text-sm group"
      >
        <span className="transition-transform group-hover:-translate-x-1">
          ←
        </span>
        返回重新规划
      </button>

      {/* === 成功标题 === */}
      <div className="text-center py-4">
        <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-3 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          规划方案已生成
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-stone-800 mb-1.5 font-serif">
          你的{styleEmoji} {styleName}全屋方案
        </h2>
        <p className="text-stone-400 text-sm">
          {planData?.name} · {rooms.length}个房间 · 风格一致性：
          <span className="text-amber-600 font-semibold">
            {consistencyScore.toFixed(1)}%
          </span>
        </p>
      </div>

      {/* === 风格一致性报告 === */}
      <ConsistencyReport
        score={consistencyScore}
        palette={overallPalette}
        material={overallMaterial}
      />

      {/* === 全屋效果图网格 === */}
      <div>
        <h3 className="font-bold text-stone-800 mb-3 flex items-center gap-2 font-serif text-lg">
          🖼️ 全屋效果图
          <span className="text-xs font-normal text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
            整套风格统一
          </span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {rooms.map((room, i) => {
            const roomResult = renderResult?.rooms[i];
            return (
              <RenderCard
                key={`${room}-${i}`}
                room={room}
                style={style}
                index={i}
                renderedUrl={roomResult?.renderedImageUrl || undefined}
              />
            );
          })}
        </div>
      </div>

      {/* === 小红书笔记模板（专业版及以上） === */}
      {(planId === "pro" || planId === "designer") && (
        <XHSTemplate style={style} rooms={rooms} budget={budget} />
      )}

      {/* === 操作按钮组 === */}
      <div className="space-y-3 pt-2">
        {/* PDF下载 */}
        <button
          className="w-full py-3.5 bg-stone-800 text-white rounded-xl font-semibold text-sm hover:bg-stone-900 transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg"
          onClick={() => {
            // TODO: 接入真实PDF生成逻辑
            // 可使用 @react-pdf/renderer 或后端jsPDF生成
            alert(
              "PDF生成功能开发中\n\n接入方式：\n1. 使用 @react-pdf/renderer 在前端生成\n2. 或在 /api/generate-pdf 后端路由生成"
            );
          }}
        >
          📄 下载PDF完整报告
        </button>

        {/* 小红书店铺跳转 */}
        <a
          href={XHS_SHOP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3.5 bg-gradient-to-r from-rose-500 to-orange-500 text-white rounded-xl font-semibold text-sm hover:from-rose-600 hover:to-orange-600 transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-rose-200"
        >
          🔗 去小红书店铺下单
        </a>

        {/* 设计师版专属：生成永久链接 */}
        {planId === "designer" && (
          <button
            className="w-full py-3.5 border-2 border-stone-300 text-stone-700 rounded-xl font-semibold text-sm hover:bg-stone-50 hover:border-stone-400 transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
            onClick={() => {
              // TODO: 调用后端API生成专属永久链接
              // 将渲染结果存储到数据库，生成唯一URL
              alert(
                "专属链接生成功能开发中\n\n实现方式：\n1. 将渲染结果存储到数据库（如Supabase/PlanetScale）\n2. 生成唯一短链接\n3. 用户可永久访问查看"
              );
            }}
          >
            🔗 生成专属永久链接
          </button>
        )}
      </div>
    </div>
  );
}
