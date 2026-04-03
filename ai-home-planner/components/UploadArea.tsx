"use client";

import { useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { ROOMS } from "@/lib/constants";

// ============================================================
// 上传区域组件
// - 支持拖拽多选上传5-8张毛胚房照片
// - 自动分配房间标签（客厅/厨房/主卧等）
// - 可手动修改每张照片对应的房间
// - 上传进度可视化（8个圆点指示器）
// ============================================================

interface UploadAreaProps {
  files: File[];
  setFiles: (files: File[]) => void;
  roomLabels: Record<number, string>;
  setRoomLabels: (labels: Record<number, string>) => void;
}

export default function UploadArea({
  files,
  setFiles,
  roomLabels,
  setRoomLabels,
}: UploadAreaProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  /** 处理新选择/拖入的文件 */
  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return;

      // 只接受图片文件
      const imageFiles = Array.from(fileList).filter((f) =>
        f.type.startsWith("image/")
      );
      if (imageFiles.length === 0) return;

      // 合并已有文件，最多8张
      const combined = [...files, ...imageFiles].slice(0, 8);
      setFiles(combined);

      // 自动分配房间标签
      const newLabels = { ...roomLabels };
      combined.forEach((_, i) => {
        if (!newLabels[i]) {
          newLabels[i] = ROOMS[i] || `房间${i + 1}`;
        }
      });
      setRoomLabels(newLabels);
    },
    [files, roomLabels, setFiles, setRoomLabels]
  );

  /** 删除指定图片 */
  const removeFile = useCallback(
    (indexToRemove: number) => {
      const newFiles = files.filter((_, i) => i !== indexToRemove);
      setFiles(newFiles);

      // 重新分配标签索引
      const oldLabelsArray = Object.values(roomLabels);
      const newLabels: Record<number, string> = {};
      newFiles.forEach((_, i) => {
        // 跳过被删除的索引
        const sourceIndex = i >= indexToRemove ? i + 1 : i;
        newLabels[i] =
          oldLabelsArray[sourceIndex] || ROOMS[i] || `房间${i + 1}`;
      });
      setRoomLabels(newLabels);
    },
    [files, roomLabels, setFiles, setRoomLabels]
  );

  /** 更新某张照片的房间标签 */
  const updateRoomLabel = useCallback(
    (index: number, label: string) => {
      setRoomLabels({ ...roomLabels, [index]: label });
    },
    [roomLabels, setRoomLabels]
  );

  return (
    <div className="space-y-4">
      {/* ====== 拖拽上传区域 ====== */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragActive(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragActive(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragActive(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center",
          "cursor-pointer transition-all duration-300",
          dragActive
            ? "border-amber-400 bg-amber-50/60 scale-[1.01] shadow-lg"
            : "border-stone-300 hover:border-amber-300 hover:bg-white/60 bg-white/40"
        )}
      >
        {/* 隐藏的文件输入 */}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic"
          multiple
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            // 重置input以允许重复选择同一文件
            e.target.value = "";
          }}
        />

        {/* 上传图标 */}
        <div
          className={cn(
            "text-5xl mb-3 transition-transform duration-300",
            dragActive ? "scale-110" : ""
          )}
        >
          📸
        </div>

        {/* 标题文案 */}
        <p className="text-stone-700 font-semibold text-base mb-1">
          {dragActive ? "松开鼠标，上传照片" : "拖拽或点击上传毛胚房照片"}
        </p>
        <p className="text-stone-400 text-sm leading-relaxed">
          支持 JPG / PNG / WebP / HEIC
          <br />
          整套房子 5-8 张（客厅 · 厨房 · 卧室 · 卫生间等）
        </p>

        {/* 8个圆点进度指示器 */}
        <div className="mt-4 flex justify-center gap-1.5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-2.5 h-2.5 rounded-full transition-all duration-300",
                i < files.length
                  ? "bg-amber-400 scale-110 shadow-sm shadow-amber-200"
                  : "bg-stone-200"
              )}
            />
          ))}
        </div>
        <p className="text-xs text-stone-400 mt-2">
          已上传{" "}
          <span
            className={cn(
              "font-semibold",
              files.length >= 5 ? "text-green-600" : "text-amber-600"
            )}
          >
            {files.length}
          </span>
          /8 张
          {files.length > 0 && files.length < 5 && (
            <span className="text-amber-500 ml-1">（建议至少上传5张）</span>
          )}
          {files.length >= 5 && (
            <span className="text-green-600 ml-1">✓ 数量充足</span>
          )}
        </p>
      </div>

      {/* ====== 已上传图片预览网格 ====== */}
      {files.length > 0 && (
        <div className="grid grid-cols-4 sm:grid-cols-4 gap-3">
          {files.map((file, i) => (
            <div key={`${file.name}-${file.size}-${i}`} className="relative group">
              {/* 图片预览 */}
              <div className="aspect-square rounded-xl overflow-hidden bg-stone-100 border border-stone-200 shadow-sm">
                <img
                  src={URL.createObjectURL(file)}
                  alt={roomLabels[i] || `房间${i + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              {/* 序号标记 */}
              <div className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-black/50 text-white text-[10px] font-bold flex items-center justify-center backdrop-blur-sm">
                {i + 1}
              </div>

              {/* 房间标签下拉选择 */}
              <select
                value={roomLabels[i] || ROOMS[i]}
                onChange={(e) => updateRoomLabel(i, e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="absolute bottom-1.5 left-1.5 right-7 text-[10px] bg-white/90 backdrop-blur-sm rounded-md px-1.5 py-1 border border-stone-200 text-stone-600 focus:outline-none focus:ring-1 focus:ring-amber-300"
              >
                {ROOMS.map((room) => (
                  <option key={room} value={room}>
                    {room}
                  </option>
                ))}
                <option value="其他">其他</option>
              </select>

              {/* 删除按钮 */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(i);
                }}
                className={cn(
                  "absolute top-1.5 right-1.5 w-5 h-5",
                  "bg-red-500/80 hover:bg-red-600 text-white",
                  "rounded-full text-[10px] font-bold",
                  "opacity-0 group-hover:opacity-100",
                  "transition-all duration-200",
                  "flex items-center justify-center",
                  "backdrop-blur-sm shadow-sm"
                )}
                aria-label={`删除第${i + 1}张照片`}
              >
                ✕
              </button>
            </div>
          ))}

          {/* 添加更多照片的占位块（未满8张时显示） */}
          {files.length < 8 && (
            <div
              onClick={() => inputRef.current?.click()}
              className="aspect-square rounded-xl border-2 border-dashed border-stone-200 hover:border-amber-300 bg-white/40 hover:bg-amber-50/30 cursor-pointer flex flex-col items-center justify-center transition-all duration-200"
            >
              <span className="text-xl text-stone-300">+</span>
              <span className="text-[10px] text-stone-400 mt-0.5">添加</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
