"use client";

import { REVIEWS } from "@/lib/constants";

// ============================================================
// 用户评价区域
// 展示三位用户对不同版本的真实反馈
// ============================================================

export default function ReviewSection() {
  return (
    <section className="mb-8">
      <h3 className="text-lg font-bold text-stone-800 mb-4 text-center font-serif">
        💬 用户真实反馈
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {REVIEWS.map((review, i) => (
          <div
            key={i}
            className="bg-white/80 rounded-2xl p-4 border border-stone-100 shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            {/* 头像+名字+方案 */}
            <div className="flex items-center gap-2.5 mb-2.5">
              <span className="text-2xl">{review.avatar}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-stone-700">
                  {review.name}
                </p>
                <p className="text-[10px] text-amber-600 font-medium">
                  {review.plan}用户
                </p>
              </div>
              {/* 星级 */}
              <div className="text-amber-400 text-xs tracking-wider">
                {"★".repeat(review.rating)}
              </div>
            </div>
            {/* 评价内容 */}
            <p className="text-sm text-stone-600 leading-relaxed">
              &ldquo;{review.text}&rdquo;
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
