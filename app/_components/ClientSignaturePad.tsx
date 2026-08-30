"use client";

import { useEffect, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof SignatureCanvas> & {
  onReady?: (instance: SignatureCanvas | null) => void;
};

export default function ClientSignaturePad({
  onReady,
  canvasProps,
  ...rest
}: Props) {
  const padRef = useRef<SignatureCanvas | null>(null);

  useEffect(() => {
    const pad = padRef.current;
    if (!pad) return;
    const canvas = pad.getCanvas();

    // Sync the canvas's internal pixel buffer with its CSS-rendered size and
    // the device pixel ratio. Without this, Safari (and other browsers) keep
    // the canvas's default 300×150 backing store, so signatures captured on
    // wide / Retina displays come out misaligned and pixelated in the PDF.
    const resize = () => {
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const data = pad.toData();
      canvas.width = rect.width * ratio;
      canvas.height = rect.height * ratio;
      canvas.getContext("2d")?.scale(ratio, ratio);
      pad.clear();
      if (data.length) pad.fromData(data);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("orientationchange", resize);
    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("orientationchange", resize);
    };
  }, []);

  const setRef = (r: SignatureCanvas | null) => {
    padRef.current = r;
    onReady?.(r);
  };

  return (
    <SignatureCanvas
      ref={setRef}
      {...rest}
      canvasProps={{
        ...canvasProps,
        // touchAction: "none" stops iOS Safari from scrolling/zooming the
        // page when the user drags a finger across the signature canvas.
        style: { touchAction: "none", ...canvasProps?.style },
      }}
    />
  );
}
