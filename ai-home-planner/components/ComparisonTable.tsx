"use client";

import { cn } from "@/lib/utils";
import { COMPARISON_ROWS } from "@/lib/constants";

// ============================================================
// 版本详细对比表格
// 清晰展示基础版/专业版/设计师版的功能差异
// 响应式：手机端可横向滚动
// ============================================================

export default function ComparisonTable() {
  return (
    <div className="overflow-x-auto -mx-2 px-2">
      <table
        className="w-full text-sm border-collapse"
        style={{ minWidth: 560 }}
      >
        {/* === 表头 === */}
        <thead>
          <tr className="border-b-2 border-stone-200">
            <th className="text-left py-3 px-3 text-stone-500 font-medium w-[30%]">
              功能对比
            </th>
            <th className="text-center py-3 px-3 text-stone-600 font-semibold w-[23%]">
              <div>基础版</div>
              <div className="text-stone-400 text-xs font-normal mt-0.5">
                ¥39
              </div>
            </th>
            <th
              className="text-center py-3 px-3 font-bold w-[23%]"
              style={{ color: "#D4860B" }}
            >
              <div className="flex items-center justify-center gap-1">
                专业版
                <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-semibold">
                  荐
                </span>
              </div>
              <div className="text-amber-600/70 text-xs font-normal mt-0.5">
                ¥79
              </div>
            </th>
            <th className="text-center py-3 px-3 text-stone-800 font-semibold w-[23%]">
              <div>设计师版</div>
              <div className="text-stone-400 text-xs font-normal mt-0.5">
                ¥199
              </div>
            </th>
          </tr>
        </thead>

        {/* === 表体 === */}
        <tbody>
          {COMPARISON_ROWS.map((row, i) => (
            <tr
              key={i}
              className={cn(
                "border-b border-stone-100 transition-colors hover:bg-stone-50/80",
                i % 2 === 0 ? "bg-stone-50/40" : "bg-transparent"
              )}
            >
              <td className="py-3 px-3 text-stone-600 font-medium">
                {row.feature}
              </td>
              <td className="py-3 px-3 text-center text-stone-400">
                <CellValue value={row.basic} />
              </td>
              <td
                className="py-3 px-3 text-center font-medium"
                style={{ color: "#D4860B" }}
              >
                <CellValue value={row.pro} highlight />
              </td>
              <td className="py-3 px-3 text-center text-stone-700 font-medium">
                <CellValue value={row.designer} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** 单元格值渲染：对勾高亮、横杠灰色 */
function CellValue({
  value,
  highlight = false,
}: {
  value: string;
  highlight?: boolean;
}) {
  if (value === "—") {
    return <span className="text-stone-300">—</span>;
  }
  if (value.startsWith("✓")) {
    return (
      <span className={cn(highlight ? "text-amber-600" : "text-green-600")}>
        {value}
      </span>
    );
  }
  return <span>{value}</span>;
}
