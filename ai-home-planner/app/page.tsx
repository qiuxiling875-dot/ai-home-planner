"use client";

import { useState, useRef, useCallback } from "react";
import { PLANS, STYLES, BUDGET_OPTIONS } from "@/lib/constants";
import { batchRenderRooms } from "@/lib/ai-api";
import type { BatchRenderResult } from "@/lib/ai-api";

import FloatingParticles from "@/components/FloatingParticles";
import HeroSection from "@/components/HeroSection";
import PricingCard from "@/components/PricingCard";
import ComparisonTable from "@/components/ComparisonTable";
import UploadArea from "@/components/UploadArea";
import StyleSelector from "@/components/StyleSelector";
import LoadingOverlay from "@/components/LoadingOverlay";
import ResultPage from "@/components/ResultPage";
import ReviewSection from "@/components/ReviewSection";
import Footer from "@/components/Footer";

// ============================================================
// 毛胚房AI规划神器 - 主页面
//
// 用户流程：
// 1. 查看Hero标题 → 2. 选择定价方案 → 3. 查看对比表格
// 4. 上传照片+设置参数 → 5. 点击生成 → 6. 查看结果页面
// ============================================================

export default function HomePage() {
  // =====================
  // 状态管理
  // =====================
  const [selectedPlan, setSelectedPlan] = useState<string>("pro"); // 默认选中专业版
  const [files, setFiles] = useState<File[]>([]);
  const [roomLabels, setRoomLabels] = useState<Record<number, string>>({});
  const [area, setArea] = useState<string>("");
  const [budget, setBudget] = useState<string>("3-5万");
  const [style, setStyle] = useState<string>("nordic");

  // 加载状态
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentRoom, setCurrentRoom] = useState("");

  // 结果状态
  const [showResult, setShowResult] = useState(false);
  const [renderResult, setRenderResult] = useState<BatchRenderResult | null>(
    null
  );

  // 错误状态
  const [error, setError] = useState<string | null>(null);

  const uploadSectionRef = useRef<HTMLDivElement>(null);

  // 获取当前活跃的房间列表
  const activeRooms =
    Object.values(roomLabels).length > 0
      ? Object.values(roomLabels)
      : ["客厅", "厨房", "主卧", "卫生间"];

  // =====================
  // 滚动到上传区域
  // =====================
  const scrollToUpload = useCallback(() => {
    uploadSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  // =====================
  // 选择方案并滚动到上传区
  // =====================
  const handleSelectPlan = useCallback(
    (planId: string) => {
      setSelectedPlan(planId);
      // 如果已有照片，不滚动；否则引导用户上传
      if (files.length === 0) {
        setTimeout(scrollToUpload, 300);
      }
    },
    [files.length, scrollToUpload]
  );

  // =====================
  // 核心：触发AI生成
  // =====================
  const handleGenerate = useCallback(async () => {
    // 验证
    if (files.length < 1) {
      setError("请至少上传1张毛胚房照片（建议5-8张覆盖整套房子所有房间）");
      return;
    }
    setError(null);
    setLoading(true);
    setProgress(0);
    setCurrentRoom("准备中...");

    try {
      const result = await batchRenderRooms(
        {
          images: files,
          roomLabels,
          style,
          area,
          budget,
          planId: selectedPlan,
        },
        (prog, room) => {
          setProgress(prog);
          setCurrentRoom(room);
        }
      );

      setRenderResult(result);
      setShowResult(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Generation failed:", err);
      setError(
        "生成失败，请稍后重试。如果问题持续，请检查网络连接或联系客服。"
      );
    } finally {
      setLoading(false);
    }
  }, [files, roomLabels, style, area, budget, selectedPlan]);

  // =====================
  // 返回主页（从结果页）
  // =====================
  const handleBack = useCallback(() => {
    setShowResult(false);
    setRenderResult(null);
  }, []);

  // ============================================================
  // 结果页面渲染
  // ============================================================
  if (showResult) {
    return (
      <div className="min-h-screen">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <ResultPage
            planId={selectedPlan}
            style={style}
            rooms={activeRooms}
            budget={budget}
            renderResult={renderResult}
            onBack={handleBack}
          />
          <Footer />
        </div>
      </div>
    );
  }

  // ============================================================
  // 主页面渲染
  // ============================================================
  return (
    <div className="min-h-screen relative">
      {/* 背景装饰粒子 */}
      <FloatingParticles />

      {/* 加载遮罩 */}
      {loading && (
        <LoadingOverlay progress={progress} currentRoom={currentRoom} />
      )}

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-6 sm:py-8">
        {/* ====== 1. Hero首屏 ====== */}
        <HeroSection />

        {/* ====== 2. 三层定价卡片 ====== */}
        <section className="mb-10">
          <div className="text-center mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-stone-800 font-serif">
              选择你的规划方案
            </h2>
            <p className="text-sm text-stone-400 mt-1.5">
              一次付费，整套房子全搞定
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            {PLANS.map((plan) => (
              <PricingCard
                key={plan.id}
                plan={plan}
                selected={selectedPlan === plan.id}
                onSelect={handleSelectPlan}
              />
            ))}
          </div>
        </section>

        {/* ====== 3. 版本详细对比表格 ====== */}
        <section className="mb-10 glass-card rounded-2xl p-5 sm:p-6 shadow-sm border border-stone-100">
          <h3 className="text-lg font-bold text-stone-800 mb-4 text-center font-serif">
            📋 版本详细对比
          </h3>
          <ComparisonTable />
        </section>

        {/* ====== 4. 上传区域 + 参数设置 ====== */}
        <section
          ref={uploadSectionRef}
          className="mb-8 glass-card rounded-2xl p-5 sm:p-6 shadow-sm border border-stone-100"
          id="upload-section"
        >
          <h3 className="text-lg font-bold text-stone-800 mb-1 font-serif">
            📸 上传你的毛胚房照片
          </h3>
          <p className="text-sm text-stone-400 mb-5 leading-relaxed">
            整套房子5-8张照片（客厅·厨房·主卧·次卧·卫生间），AI会确保所有房间风格统一
          </p>

          {/* 上传区域 */}
          <UploadArea
            files={files}
            setFiles={setFiles}
            roomLabels={roomLabels}
            setRoomLabels={setRoomLabels}
          />

          {/* 参数配置 */}
          <div className="mt-6 space-y-5">
            {/* 风格选择器（可视化网格） */}
            <StyleSelector value={style} onChange={setStyle} />

            {/* 面积+预算 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 面积输入 */}
              <div>
                <label className="text-xs text-stone-500 mb-1.5 block">
                  房间总面积（㎡）
                </label>
                <input
                  type="number"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="如：85"
                  min={10}
                  max={500}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-sm text-stone-700 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300 transition-all"
                />
              </div>
              {/* 预算选择 */}
              <div>
                <label className="text-xs text-stone-500 mb-1.5 block">
                  装修预算范围
                </label>
                <select
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300 transition-all"
                >
                  {BUDGET_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 flex items-start gap-2">
              <span className="flex-shrink-0">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* ====== 5. 生成按钮 ====== */}
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full mt-6 py-4 rounded-2xl font-bold text-base text-white transition-all duration-300 hover:scale-[1.01] hover:shadow-xl active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            style={{
              background: "linear-gradient(135deg, #D4860B, #B8720A)",
              boxShadow: "0 8px 32px rgba(212, 134, 11, 0.3)",
            }}
          >
            {loading ? (
              <>
                <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                AI规划生成中...
              </>
            ) : (
              <>
                ✨ 生成整套房子AI规划方案 ·{" "}
                {PLANS.find((p) => p.id === selectedPlan)?.name} ¥
                {PLANS.find((p) => p.id === selectedPlan)?.price}
              </>
            )}
          </button>

          {/* 底部提示 */}
          <p className="text-center text-xs text-stone-400 mt-3">
            点击即同意
            <a href="#" className="underline hover:text-stone-500">
              服务条款
            </a>
            · 支付后AI立即开始处理
          </p>
        </section>

        {/* ====== 用户评价 ====== */}
        <ReviewSection />

        {/* ====== 页脚免责声明 ====== */}
        <Footer />
      </div>
    </div>
  );
}
