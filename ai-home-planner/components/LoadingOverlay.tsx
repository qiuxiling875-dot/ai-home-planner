"use client";

// ============================================================
// 加载遮罩层
// - 全屏半透明遮罩
// - 旋转动画 + 房屋图标
// - 实时进度条 + 当前处理房间名称
// - 风格一致性提示
// ============================================================

interface LoadingOverlayProps {
  progress: number;       // 0-100
  currentRoom: string;    // 当前正在处理的房间名
}

/** 根据进度显示不同的提示文案 */
function getTip(progress: number): string {
  if (progress < 15) return "正在分析整套房子的空间结构和光照条件...";
  if (progress < 40) return "AI正在确定统一的色调方向和材质体系...";
  if (progress < 70) return "逐个房间生成渲染图，使用相同的风格种子...";
  if (progress < 90) return "校验全屋色系、材质、家具语言的一致性...";
  return "最后润色中，确保每个房间的光影风格统一...";
}

export default function LoadingOverlay({
  progress,
  currentRoom,
}: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl animate-slide-up">
        {/* === 旋转加载动画 === */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          {/* 外圈（静止） */}
          <div className="absolute inset-0 rounded-full border-4 border-stone-100" />
          {/* 旋转圈 */}
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-amber-500 border-r-amber-200 animate-spin" />
          {/* 内圈脉动 */}
          <div className="absolute inset-3 rounded-full border-2 border-amber-100 animate-pulse-ring" />
          {/* 中心图标 */}
          <div className="absolute inset-0 flex items-center justify-center text-3xl">
            🏠
          </div>
        </div>

        {/* === 标题 === */}
        <h3 className="text-stone-800 font-bold text-lg mb-2 font-serif">
          AI正在规划你的家
        </h3>

        {/* === 当前处理房间 === */}
        <p className="text-stone-500 text-sm mb-5">
          正在处理：
          <span className="text-amber-600 font-semibold">{currentRoom}</span>
        </p>

        {/* === 进度条 === */}
        <div className="relative h-2.5 bg-stone-100 rounded-full overflow-hidden mb-2">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${progress}%`,
              background:
                "linear-gradient(90deg, #D4860B 0%, #F59E0B 50%, #D4860B 100%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 2s linear infinite",
            }}
          />
        </div>
        <p className="text-xs text-stone-400 mb-6">
          {progress}% · 全屋风格一致性同步中
        </p>

        {/* === 动态提示 === */}
        <div className="p-3.5 bg-amber-50/80 rounded-xl border border-amber-100">
          <p className="text-xs text-amber-700 leading-relaxed">
            💡 {getTip(progress)}
          </p>
        </div>

        {/* === 底部说明 === */}
        <p className="text-[10px] text-stone-300 mt-4">
          AI会确保所有房间的色系、材质、家具语言和光影风格保持高度一致
        </p>
      </div>
    </div>
  );
}
