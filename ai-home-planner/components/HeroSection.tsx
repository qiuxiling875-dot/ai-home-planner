"use client";

// ============================================================
// Hero首屏区域
// 大标题 + 副标题 + 统计数据
// ============================================================

export default function HeroSection() {
  return (
    <header className="text-center mb-10 pt-4 animate-fade-in">
      {/* 顶部标签 */}
      <div className="inline-block mb-4">
        <span className="text-[10px] tracking-[0.25em] text-stone-400 uppercase font-medium bg-white/60 px-3 py-1 rounded-full">
          AI-Powered Home Design
        </span>
      </div>

      {/* 主标题 */}
      <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-black text-stone-800 mb-3 leading-tight font-serif">
        毛胚房
        <span className="text-gradient-gold">AI规划</span>
        神器
      </h1>

      {/* 副标题 */}
      <p className="text-stone-500 text-base sm:text-lg max-w-lg mx-auto leading-relaxed">
        上传整套毛胚房照片，AI帮你生成
        <strong className="text-stone-700">风格统一</strong>
        的全屋规划方案
      </p>
      <p className="text-stone-400 text-sm mt-1">
        从客厅到卫生间，一套搞定，拒绝东拼西凑
      </p>

      {/* 统计数据 */}
      <div className="flex items-center justify-center gap-4 sm:gap-6 mt-5 text-xs text-stone-400">
        <span className="flex items-center gap-1">
          <span className="text-sm">🏠</span> 已服务 12,847 套房
        </span>
        <span className="w-1 h-1 rounded-full bg-stone-300" />
        <span className="flex items-center gap-1">
          <span className="text-sm">⭐</span> 4.9 好评率
        </span>
        <span className="w-1 h-1 rounded-full bg-stone-300" />
        <span className="flex items-center gap-1">
          <span className="text-sm">⚡</span> 3分钟出图
        </span>
      </div>
    </header>
  );
}
