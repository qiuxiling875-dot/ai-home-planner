"use client";

// ============================================================
// 页脚免责声明 - 每页底部永久显示
// 【重要】请勿删除此组件，免责声明是产品合规必要内容
// ============================================================

export default function Footer() {
  return (
    <footer className="text-center py-6 border-t border-stone-200 mt-10">
      {/* 免责声明 */}
      <div className="max-w-lg mx-auto mb-3 p-3 bg-stone-50/80 rounded-xl">
        <p className="text-xs text-stone-400 leading-relaxed">
          ⚠️{" "}
          <strong className="text-stone-500">免责声明</strong>
          ：本工具生成的所有效果图和规划方案
          <strong className="text-stone-500">
            仅供灵感参考和效果预览，非专业施工图，AI辅助生成
          </strong>
          。实际装修请咨询专业设计师和施工团队。生成内容可能与实际效果存在差异。
        </p>
      </div>

      {/* 版权信息 */}
      <p className="text-[10px] text-stone-300">
        毛胚房AI规划神器 © {new Date().getFullYear()} · Powered by AI ·{" "}
        <a href="#" className="hover:text-stone-400 transition-colors">
          服务条款
        </a>{" "}
        ·{" "}
        <a href="#" className="hover:text-stone-400 transition-colors">
          隐私政策
        </a>
      </p>
    </footer>
  );
}
