"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { UploadCloud, X, FileText, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface DropZoneProps {
  files: File[];
  onChange: (files: File[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const ACCEPTED_LABEL = "JPG, PNG, WEBP, PDF";

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DropZone({
  files,
  onChange,
  maxFiles = 5,
  maxSizeMB = 10,
}: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrls, setPreviewUrls] = useState<(string | null)[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Manage object URLs — create on files change, revoke on cleanup
  useEffect(() => {
    const urls = files.map((f) =>
      f.type.startsWith("image/") ? URL.createObjectURL(f) : null
    );
    setPreviewUrls(urls);
    return () => {
      urls.forEach((url) => url && URL.revokeObjectURL(url));
    };
  }, [files]);

  function addFiles(incoming: File[]) {
    setError(null);
    const maxBytes = maxSizeMB * 1024 * 1024;
    const toAdd: File[] = [];
    let errorMsg: string | null = null;

    for (const f of incoming) {
      if (!ACCEPTED_TYPES.includes(f.type)) {
        errorMsg = `"${f.name}" is not supported. Use ${ACCEPTED_LABEL}.`;
        continue;
      }
      if (f.size > maxBytes) {
        errorMsg = `"${f.name}" exceeds the ${maxSizeMB} MB size limit.`;
        continue;
      }
      if (files.length + toAdd.length >= maxFiles) {
        errorMsg = `Maximum ${maxFiles} files allowed.`;
        break;
      }
      // Skip duplicates by name + size
      const isDuplicate = files.some(
        (existing) => existing.name === f.name && existing.size === f.size
      );
      if (!isDuplicate) toAdd.push(f);
    }

    if (errorMsg) setError(errorMsg);
    if (toAdd.length > 0) onChange([...files, ...toAdd]);
  }

  function removeFile(index: number) {
    onChange(files.filter((_, i) => i !== index));
    setError(null);
  }

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      addFiles(Array.from(e.dataTransfer.files));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [files]
  );

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onDrop={onDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false);
        }}
        onClick={() => files.length < maxFiles && inputRef.current?.click()}
        className={cn(
          "relative border-2 border-dashed p-10 flex flex-col items-center gap-3 transition-colors",
          files.length < maxFiles ? "cursor-pointer" : "cursor-not-allowed opacity-60",
          isDragging
            ? "border-stone-900 bg-stone-50"
            : "border-stone-300 hover:border-stone-400 hover:bg-stone-50/60"
        )}
      >
        <UploadCloud
          size={38}
          strokeWidth={1.25}
          className={cn("transition-colors", isDragging ? "text-stone-800" : "text-stone-400")}
        />
        <div className="text-center">
          <p className="text-sm font-medium text-stone-700">
            {isDragging ? "Drop to upload" : "Drag & drop your reference images"}
          </p>
          <p className="text-xs text-stone-400 mt-0.5">
            or{" "}
            <span className="text-stone-700 underline underline-offset-2">
              browse files
            </span>
          </p>
        </div>
        <p className="text-[11px] text-stone-400">
          {ACCEPTED_LABEL} · Max {maxSizeMB} MB each · Up to {maxFiles} files
        </p>

        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED_TYPES.join(",")}
          className="hidden"
          onChange={(e) => {
            if (e.target.files) addFiles(Array.from(e.target.files));
            e.target.value = "";
          }}
        />
      </div>

      {/* Validation error */}
      {error && (
        <div className="flex items-start gap-2 px-3 py-2.5 bg-red-50 border border-red-200 text-xs text-red-700">
          <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* File preview grid */}
      {files.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {files.map((file, idx) => {
            const previewUrl = previewUrls[idx];
            const isPdf = file.type === "application/pdf";

            return (
              <div
                key={`${file.name}-${idx}`}
                className="relative border border-stone-200 bg-white overflow-hidden group"
              >
                {previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewUrl}
                    alt={file.name}
                    className="w-full h-24 object-cover"
                  />
                ) : (
                  <div className="h-24 flex flex-col items-center justify-center gap-1.5 bg-stone-50">
                    <FileText size={22} className="text-stone-400" />
                    {isPdf && (
                      <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
                        PDF
                      </span>
                    )}
                  </div>
                )}

                <div className="px-2 py-1.5 border-t border-stone-100">
                  <p className="text-[11px] text-stone-700 font-medium truncate">{file.name}</p>
                  <p className="text-[10px] text-stone-400">{formatBytes(file.size)}</p>
                </div>

                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                  aria-label={`Remove ${file.name}`}
                  className="absolute top-1.5 right-1.5 w-5 h-5 bg-stone-900/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-stone-900"
                >
                  <X size={10} strokeWidth={3} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
