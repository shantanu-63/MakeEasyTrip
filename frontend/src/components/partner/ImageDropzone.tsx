"use client";

import React, { useState } from "react";

interface UploadedImage {
  id: string;
  url: string;
  name: string;
  isCover: boolean;
}

interface ImageDropzoneProps {
  initialImages?: UploadedImage[];
  onChange?: (images: UploadedImage[]) => void;
}

export default function ImageDropzone({
  initialImages = [],
  onChange,
}: ImageDropzoneProps) {
  const [images, setImages] = useState<UploadedImage[]>(initialImages);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFiles = (files: FileList) => {
    const validExtensions = ["image/jpeg", "image/png", "image/webp"];
    const newImages: UploadedImage[] = [...images];

    Array.from(files).forEach((file) => {
      if (!validExtensions.includes(file.type)) {
        alert("Only JPG, PNG, and WEBP image formats are allowed.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          const imgObj: UploadedImage = {
            id: "img-" + Math.random().toString(36).substring(2, 9),
            url: e.target.result as string,
            name: file.name,
            isCover: newImages.length === 0,
          };
          newImages.push(imgObj);
          setImages([...newImages]);
          if (onChange) onChange([...newImages]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (id: string) => {
    const wasCover = images.find((img) => img.id === id)?.isCover;
    let updated = images.filter((img) => img.id !== id);
    if (wasCover && updated.length > 0) {
      updated[0].isCover = true;
    }
    setImages(updated);
    if (onChange) onChange(updated);
  };

  const setAsCover = (id: string) => {
    const updated = images.map((img) => ({
      ...img,
      isCover: img.id === id,
    }));
    setImages(updated);
    if (onChange) onChange(updated);
  };

  return (
    <div>
      <div
        className={`image-upload-dropzone ${isDragOver ? "dragover" : ""}`}
        id="dropzone"
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
        onClick={() => document.getElementById("image-upload-input")?.click()}
        style={{ cursor: "pointer" }}
      >
        <input
          type="file"
          id="image-upload-input"
          multiple
          accept="image/jpeg, image/png, image/webp"
          style={{ display: "none" }}
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
          }}
        />
        <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: "32px", color: "var(--color-text-muted)" }}></i>
        <p style={{ marginTop: "12px", fontSize: "13px", color: "var(--color-text-muted)" }}>
          Drag &amp; drop photos here or click to browse local files
        </p>
        <span style={{ fontSize: "10px", color: "var(--color-text-muted)", display: "block", marginTop: "4px" }}>
          JPG, PNG, or WEBP formats up to 5 MB per file
        </span>
      </div>

      <div className="preview-grid" id="preview-grid" style={{ marginTop: "20px" }}>
        {images.map((img) => (
          <div key={img.id} className="preview-item">
            <img src={img.url} alt={img.name} />
            <span className="preview-remove" onClick={() => removeImage(img.id)}>
              &times;
            </span>
            {img.isCover ? (
              <span className="preview-badge">Cover</span>
            ) : (
              <span
                className="preview-badge"
                style={{ backgroundColor: "var(--color-text-muted)", cursor: "pointer" }}
                onClick={() => setAsCover(img.id)}
              >
                Make Cover
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
