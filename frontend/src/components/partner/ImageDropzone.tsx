"use client";

import React, { useState } from "react";

interface UploadedImage {
  id: string;
  url: string;
  name: string;
  isCover: boolean;
  size: number;
}

interface ImageDropzoneProps {
  initialImages?: UploadedImage[];
  onChange?: (images: UploadedImage[]) => void;
  onError?: (error: string) => void;
}

export default function ImageDropzone({
  initialImages = [],
  onChange,
  onError,
}: ImageDropzoneProps) {
  const [images, setImages] = useState<UploadedImage[]>(initialImages);
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const triggerError = (msg: string) => {
    setErrorMsg(msg);
    if (onError) onError(msg);
  };

  const clearError = () => {
    setErrorMsg("");
    if (onError) onError("");
  };

  // Compress image helper using HTML5 Canvas
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(event.target?.result as string);
            return;
          }

          // Limit max dimensions to 1200px for efficient storage and fast load
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          // Compress to JPEG with 0.8 quality
          const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
          resolve(dataUrl);
        };
        img.onerror = () => {
          reject(new Error("Failed to load image for compression"));
        };
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
    });
  };

  const handleFiles = async (files: FileList) => {
    clearError();
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    const fileList = Array.from(files);

    // Limit checks: total after adding these files
    if (images.length + fileList.length > 8) {
      triggerError("You can upload a maximum of 8 images.");
      return;
    }

    const processedImages: UploadedImage[] = [...images];

    for (const file of fileList) {
      // 1. Format check
      if (!validTypes.includes(file.type)) {
        triggerError("Invalid file type. Only JPG, JPEG, PNG, and WEBP formats are allowed.");
        continue;
      }

      // 2. File size check (5 MB)
      if (file.size > 5 * 1024 * 1024) {
        triggerError(`File '${file.name}' exceeds the 5 MB limit.`);
        continue;
      }

      // 3. Duplicate check based on filename and size
      const isDuplicate = processedImages.some(
        (img) => img.name === file.name && img.size === file.size
      );
      if (isDuplicate) {
        triggerError(`Image '${file.name}' is already uploaded.`);
        continue;
      }

      try {
        const compressedUrl = await compressImage(file);
        const newImg: UploadedImage = {
          id: "img-" + Math.random().toString(36).substring(2, 9),
          url: compressedUrl,
          name: file.name,
          size: file.size,
          isCover: processedImages.length === 0, // First becomes Cover
        };
        processedImages.push(newImg);
      } catch (err) {
        triggerError("Failed to process and compress image.");
      }
    }

    // Auto-update first image as cover if needed
    if (processedImages.length > 0) {
      const hasCover = processedImages.some((img) => img.isCover);
      if (!hasCover) {
        processedImages[0].isCover = true;
      }
    }

    setImages(processedImages);
    if (onChange) onChange(processedImages);
  };

  const removeImage = (id: string) => {
    clearError();
    const wasCover = images.find((img) => img.id === id)?.isCover;
    let updated = images.filter((img) => img.id !== id);
    
    // Auto-promote first image to cover if the old cover was deleted
    if (wasCover && updated.length > 0) {
      updated[0].isCover = true;
    }
    
    setImages(updated);
    if (onChange) onChange(updated);
  };

  const makeCover = (id: string) => {
    const updated = images.map((img) => ({
      ...img,
      isCover: img.id === id,
    }));
    setImages(updated);
    if (onChange) onChange(updated);
  };

  // Reordering helpers (Shift Left / Right)
  const moveImage = (index: number, direction: "left" | "right") => {
    clearError();
    const targetIndex = direction === "left" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const updated = [...images];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    // First image in reordered array becomes Cover automatically
    const remapped = updated.map((img, idx) => ({
      ...img,
      isCover: idx === 0,
    }));

    setImages(remapped);
    if (onChange) onChange(remapped);
  };

  return (
    <div className="w-full">
      {/* Dropzone Container */}
      <div
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[140px] ${
          isDragOver
            ? "border-orange-500 bg-orange-50"
            : "border-slate-200 hover:border-slate-350 bg-slate-50"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
        }}
        onClick={() => document.getElementById("property-image-input")?.click()}
      >
        <input
          type="file"
          id="property-image-input"
          multiple
          accept="image/jpeg, image/png, image/webp"
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
          }}
        />
        <i className="fa-solid fa-cloud-arrow-up text-slate-400 text-3xl mb-2"></i>
        <p className="text-xs font-semibold text-text-main">
          Drag &amp; drop your images here, or click to upload
        </p>
        <span className="text-[10px] text-text-muted mt-1">
          Supports JPG, JPEG, PNG, WEBP (Max 5 MB each)
        </span>
      </div>

      {/* Dynamic Count Tracker & Validation Banner */}
      <div className="flex justify-between items-center mt-3 px-1 text-xs">
        <span className="font-semibold text-text-main">
          Images: {images.length} / 8
        </span>
        {images.length < 3 ? (
          <span className="text-red-500 font-bold">
            Minimum 3 images required to submit
          </span>
        ) : (
          <span className="text-emerald-600 font-bold flex items-center gap-1">
            <i className="fa-solid fa-circle-check"></i> Meets requirements
          </span>
        )}
      </div>

      {/* Dynamic Local Notification Banner */}
      {errorMsg && (
        <div className="bg-red-50 text-red-600 border border-red-200 rounded-lg p-2.5 mt-3 text-[11px] font-semibold flex items-center gap-2">
          <i className="fa-solid fa-triangle-exclamation"></i>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Upload Previews Grid with Reordering / Delete controls */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
          {images.map((img, idx) => (
            <div
              key={img.id}
              className={`relative rounded-xl overflow-hidden aspect-video border group flex flex-col justify-end bg-slate-100 ${
                img.isCover ? "border-orange-500 ring-2 ring-orange-500/20" : "border-slate-200"
              }`}
            >
              <img
                src={img.url}
                alt={img.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
              
              {/* Cover Badge Overlay */}
              {img.isCover && (
                <div className="absolute top-2 left-2 bg-orange-500 text-white text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded shadow">
                  Cover
                </div>
              )}

              {/* Action Toolbar on Hover / Mobile persistent overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(img.id);
                    }}
                    className="w-6 h-6 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center text-xs shadow-md cursor-pointer"
                    title="Delete Image"
                  >
                    &times;
                  </button>
                </div>

                <div className="flex justify-between items-center gap-1">
                  {/* Reordering Controls */}
                  <div className="flex gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        moveImage(idx, "left");
                      }}
                      className="w-6 h-6 rounded bg-white hover:bg-slate-100 text-primary disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center shadow"
                      title="Move Left"
                    >
                      <i className="fa-solid fa-chevron-left text-[10px]"></i>
                    </button>
                    <button
                      type="button"
                      disabled={idx === images.length - 1}
                      onClick={(e) => {
                        e.stopPropagation();
                        moveImage(idx, "right");
                      }}
                      className="w-6 h-6 rounded bg-white hover:bg-slate-100 text-primary disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center shadow"
                      title="Move Right"
                    >
                      <i className="fa-solid fa-chevron-right text-[10px]"></i>
                    </button>
                  </div>

                  {!img.isCover && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        makeCover(img.id);
                      }}
                      className="bg-orange-500 hover:bg-orange-600 text-white text-[9px] font-bold px-2 py-1 rounded shadow cursor-pointer"
                    >
                      Set Cover
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
