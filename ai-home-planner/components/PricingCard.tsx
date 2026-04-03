"use client";

import { cn } from "@/lib/utils";
import type { Plan } from "@/lib/constants";

// ============================================================
// 定价卡片组件
// - 基础版：浅色石灰背景，无徽章
// - 专业版：暖黄背景，"最受欢迎"黄色徽章，默认选中
// - 设计师版：深色背景，"旗舰体验"徽章
// ============================================================

interface PricingCardProps {
  plan: Plan;
  selected: boolean;
  onSelect: (planId: string) => void;
}

export default function PricingCard({
  plan,
  selected,
  onSelect,
}: PricingCardProps) {
  const isPopular = plan.badge === "最受欢迎";
  const isDark = !!plan.dark;

  return (
    <div
      onClick={() => onSelect(plan.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onSelect(plan.id)}
      aria-label={`选择${plan.name} ¥${plan.price}`}
      className={cn(
        "relative rounded-2xl p-6 cursor-pointer transition-all duration-500",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        selected
          ? "scale-[1.03] shadow-2xl"
          : "shadow-lg hover:shadow-xl hover:scale-[1.01]",
        isDark ? "text-white" : "text-stone-800"
      )}
      style={{
        background: isDark
          ? "linear-gradient(145deg, #292524, #1c1917)"
          : plan.id === "pro"
          ? "linear-gradient(145deg, #FFFBF0, #FFF3D6)"
          : "linear-gradient(145deg, #FAFAF8, #F5F0EB)",
        border: selected
          ? `2px solid ${plan.accent}`
          : "2px solid transparent",
      }}
    >
      {/* === 徽章 === */}
      {plan.badge && (
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wider whitespace-nowrap z-10"
          style={{
            background: isPopular
              ? "linear-gradient(135deg, #F59E0B, #D97706)"
              : "linear-gradient(135deg, #C9A96E, #8B7355)",
            color: "#FFF",
            boxShadow: isPopular
              ? "0 4px 16px rgba(245, 158, 11, 0.45)"
              : "0 4px 16px rgba(139, 115, 85, 0.4)",
          }}
        >
          {plan.badge}
        </div>
      )}

      {/* === 方案名+价格 === */}
      <div className="text-center mt-3 mb-5">
        <h3
          className={cn(
            "text-lg font-semibold mb-2",
            isDark ? "text-stone-200" : "text-stone-600"
          )}
        >
          {plan.name}
        </h3>
        <div className="flex items-baseline justify-center gap-1">
          <span
            className={cn(
              "text-base",
              isDark ? "text-stone-400" : "text-stone-500"
            )}
          >
            ¥
          </span>
          <span
            className="text-[52px] leading-none font-black tracking-tight font-serif"
            style={{ color: plan.accent }}
          >
            {plan.price}
          </span>
        </div>
        <p
          className={cn(
            "text-xs mt-2.5",
            isDark ? "text-stone-400" : "text-stone-500"
          )}
        >
          {plan.description}
        </p>
      </div>

      {/* === 分割线 === */}
      <div
        className={cn(
          "h-px mb-4",
          isDark ? "bg-stone-700" : "bg-stone-200"
        )}
      />

      {/* === 包含的功能 === */}
      <div className="space-y-2.5 mb-6">
        {plan.features.map((feature, i) => (
          <div key={i} className="flex items-start gap-2.5 text-sm">
            <span
              className="mt-0.5 flex-shrink-0 text-xs"
              style={{ color: plan.accent }}
            >
              ✓
            </span>
            <span
              className={cn(
                "leading-relaxed",
                isDark ? "text-stone-300" : "text-stone-700"
              )}
            >
              {feature}
            </span>
          </div>
        ))}

        {/* === 不包含的功能 === */}
        {plan.notIncluded.map((feature, i) => (
          <div
            key={`no-${i}`}
            className="flex items-start gap-2.5 text-sm opacity-35"
          >
            <span className="mt-0.5 flex-shrink-0 text-xs">✗</span>
            <span className="line-through leading-relaxed">{feature}</span>
          </div>
        ))}
      </div>

      {/* === CTA按钮 === */}
      <button
        className={cn(
          "w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-300",
          selected
            ? "text-white shadow-lg"
            : isDark
            ? "bg-stone-700 text-stone-300 hover:bg-stone-600"
            : "bg-stone-200/80 text-stone-600 hover:bg-stone-300/80"
        )}
        style={
          selected
            ? {
                background: `linear-gradient(135deg, ${plan.accent}, ${plan.accent}CC)`,
                boxShadow: `0 8px 24px ${plan.accent}44`,
              }
            : undefined
        }
      >
        {selected ? `✓ 已选择 ${plan.name}` : plan.cta}
      </button>
    </div>
  );
}
