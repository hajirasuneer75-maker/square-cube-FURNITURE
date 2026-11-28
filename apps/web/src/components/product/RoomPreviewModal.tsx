"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Upload, X, FlipHorizontal, Sparkles, RotateCcw, Image as ImageIcon } from "lucide-react";

interface RoomPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  productImage: string;
  selectedWood?: string | null;
  selectedFinish?: string | null;
}

export default function RoomPreviewModal({
  isOpen,
  onClose,
  productName,
  productImage,
  selectedWood,
  selectedFinish,
}: RoomPreviewModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<"camera" | "photo">("camera");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [roomPhoto, setRoomPhoto] = useState<string | null>(null);

  const [pos, setPos] = useState({ x: 50, y: 58 }); // percent
  const [scale, setScale] = useState(55); // percent width
  const [opacity, setOpacity] = useState(95);
  const [blendCutout, setBlendCutout] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!isOpen || mode !== "camera") return;

    let stream: MediaStream | null = null;
    let cancelled = false;

    async function startCam() {
      setCameraError(null);
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError("Camera API unavailable in this browser. Upload a room photo instead.");
        setMode("photo");
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        if (!cancelled && videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch {
        if (!cancelled) {
          setCameraError("Camera permission not granted or no camera detected. Upload a photo of your room below.");
          setMode("photo");
        }
      }
    }

    startCam();

    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [isOpen, mode]);

  if (!isOpen) return null;

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const x = Math.min(92, Math.max(8, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.min(92, Math.max(12, ((e.clientY - rect.top) / rect.height) * 100));
    setPos({ x, y });
  }

  function handleRoomUpload(file: File) {
    const reader = new FileReader();
    reader.onloadend = () => {
      setRoomPhoto(reader.result as string);
      setMode("photo");
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="fixed inset-0 z-50 bg-espresso/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white border border-warm-border w-full max-w-4xl overflow-hidden shadow-luxury-hover flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-warm-border bg-alabaster">
          <div>
            <p className="section-label">View in Your Room · Zero-Cost WebAR</p>
            <h2 className="font-display text-xl font-semibold text-espresso">
              {productName}
              {(selectedWood || selectedFinish) && (
                <span className="font-ui text-xs font-normal text-champagne ml-2">
                  ({[selectedWood, selectedFinish].filter(Boolean).join(" · ")})
                </span>
              )}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-espresso/60 hover:text-espresso transition-colors"
            aria-label="Close room preview"
          >
            <X size={20} />
          </button>
        </div>

        {/* Interactive Stage */}
        <div
          ref={stageRef}
          onPointerMove={handlePointerMove}
          onPointerUp={() => setDragging(false)}
          onPointerLeave={() => setDragging(false)}
          className="relative w-full h-[52vh] sm:h-[58vh] bg-espresso overflow-hidden select-none touch-none"
        >
          {mode === "camera" ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          ) : roomPhoto ? (
            <img src={roomPhoto} alt="Your room backdrop" className="w-full h-full object-cover" />
          ) : (
            <div
              onClick={() => fileRef.current?.click()}
              className="w-full h-full flex flex-col items-center justify-center text-center p-8 cursor-pointer bg-gradient-to-br from-espresso via-[#322B28] to-espresso"
            >
              <ImageIcon size={44} className="text-champagne mb-3" />
              <p className="font-display text-2xl text-white mb-2">Upload a Photo of Your Room</p>
              <p className="font-ui text-xs text-white/60 max-w-md mb-4">
                {cameraError || "Choose a room photo from your device to drag, resize, and preview this furniture piece live in your space."}
              </p>
              <span className="btn-champagne text-xs py-2.5 px-6">
                Choose Room Photo
              </span>
            </div>
          )}

          {/* Draggable Furniture Overlay */}
          <div
            onPointerDown={(e) => {
              e.stopPropagation();
              setDragging(true);
            }}
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              width: `${scale}%`,
              maxWidth: "560px",
              opacity: opacity / 100,
              transform: `translate(-50%, -50%) scaleX(${flipped ? -1 : 1})`,
              mixBlendMode: blendCutout ? "multiply" : "normal",
            }}
            className="absolute cursor-grab active:cursor-grabbing transition-shadow"
          >
            <div className="relative rounded-xl overflow-hidden shadow-2xl border border-champagne/40 bg-white/10">
              <img
                src={productImage}
                alt={productName}
                draggable={false}
                className="w-full h-auto object-contain pointer-events-none"
              />
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-espresso/80 text-white text-[10px] font-ui px-2.5 py-0.5 rounded-full whitespace-nowrap pointer-events-none">
                Drag to position
              </div>
            </div>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleRoomUpload(f);
            }}
          />
        </div>

        {/* Controls Footer */}
        <div className="p-4 sm:p-5 bg-alabaster border-t border-warm-border space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setMode("camera")}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-ui font-medium border ${
                  mode === "camera"
                    ? "bg-espresso text-white border-espresso"
                    : "bg-white text-espresso border-warm-border hover:border-champagne"
                }`}
              >
                <Camera size={14} /> Live Camera
              </button>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-ui font-medium border ${
                  mode === "photo"
                    ? "bg-espresso text-white border-espresso"
                    : "bg-white text-espresso border-warm-border hover:border-champagne"
                }`}
              >
                <Upload size={14} /> Upload Room Photo
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setFlipped((f) => !f)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-ui bg-white border border-warm-border text-espresso hover:border-champagne"
              >
                <FlipHorizontal size={14} /> Flip
              </button>
              <button
                type="button"
                onClick={() => setBlendCutout((b) => !b)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-ui border ${
                  blendCutout
                    ? "bg-champagne text-white border-champagne"
                    : "bg-white text-espresso border-warm-border hover:border-champagne"
                }`}
              >
                <Sparkles size={14} /> Cutout Blend
              </button>
              <button
                type="button"
                onClick={() => {
                  setPos({ x: 50, y: 58 });
                  setScale(55);
                  setOpacity(95);
                  setFlipped(false);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-ui bg-white border border-warm-border text-espresso hover:border-champagne"
              >
                <RotateCcw size={13} /> Reset
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex items-center gap-3 text-xs font-ui text-espresso/75">
              <span className="w-16 font-semibold uppercase tracking-wider text-[10px]">Size</span>
              <input
                type="range"
                min={25}
                max={85}
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
                className="flex-1 accent-champagne"
              />
              <span className="w-10 text-right font-mono">{scale}%</span>
            </label>
            <label className="flex items-center gap-3 text-xs font-ui text-espresso/75">
              <span className="w-16 font-semibold uppercase tracking-wider text-[10px]">Opacity</span>
              <input
                type="range"
                min={40}
                max={100}
                value={opacity}
                onChange={(e) => setOpacity(Number(e.target.value))}
                className="flex-1 accent-champagne"
              />
              <span className="w-10 text-right font-mono">{opacity}%</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
