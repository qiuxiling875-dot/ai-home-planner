"use client";

import { cn } from "@/lib/utils";
import { STYLES, STYLE_RENDER_DATA } from "@/lib/constants";

// ============================================================
// 风格选择器 - 可视化风格网格卡片
// 每种风格展示：emoji图标 + 名称 + 描述 + 色板预览
// ============================================================

interface StyleSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function StyleSelector({ value, onChange }: StyleSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs text-stone-500 block">整体风格偏好</label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {STYLES.map((style) => {
          const isSelected = value === style.value;
          const renderData = STYLE_RENDER_DATA[style.value];

          return (
            <button
              key={style.value}
              type="button"
              onClick={() => onChange(style.value)}
              className={cn(
                "relative p-3 rounded-xl border-2 text-left transition-all duration-200",
                "hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300",
                isSelected
                  ? "border-amber-400 bg-amber-50/80 shadow-sm"
                  : "border-stone-200 bg-white/60 hover:border-stone-300"
              )}
            >
              {/* 选中标记 */}
              {isSelected && (
                <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center">
                  <span className="text-white text-[8px] font-bold">✓</span>
                </div>
              )}

              {/* 风格emoji和名称 */}
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-base">{style.emoji}</span>
                <span
                  className={cn(
                    "text-xs font-semibold",
                    isSelected ? "text-amber-800" : "text-stone-700"
                  )}
                >
                  {style.label}
                </span>
              </div>

              {/* 风格描述 */}
              <p className="text-[10px] text-stone-400 mb-2 leading-relaxed">
                {style.desc}
              </p>

              {/* 色板预览 */}
              {renderData && (
                <div className="flex gap-0.5">
                  {renderData.palette.slice(0, 5).map((color, ci) => (
                    <div
                      key={ci}
                      className="flex-1 h-3 rounded-sm first:rounded-l last:rounded-r"
                      style={{ background: color }}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
