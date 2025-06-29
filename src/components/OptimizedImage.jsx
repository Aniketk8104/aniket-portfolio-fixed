import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  loading = "lazy",
  className = "",
  priority = false,
}) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Generate responsive image sources
    const generateSrcSet = () => {
      const widths = [320, 640, 768, 1024, 1280, 1920];
      return widths
        .map((w) => `${src.replace(/\.\w+$/, "")}-${w}w.webp ${w}w`)
        .join(", ");
    };

    // Preload priority images
    if (priority) {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = src;
      link.setAttribute("fetchpriority", "high");
      document.head.appendChild(link);
    }

    // Load image
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setImageSrc(src);
      setImageLoaded(true);
    };
    img.onerror = () => setError(true);

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, priority]);

  if (error) {
    return (
      <div className={`image-error ${className}`}>
        <span>Failed to load image</span>
      </div>
    );
  }

  return (
    <motion.div
      className={`image-container ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: imageLoaded ? 1 : 0 }}
      transition={{ duration: 0.3 }}
    >
      {!imageLoaded && (
        <div
          className="image-skeleton"
          style={{ aspectRatio: `${width}/${height}` }}
        />
      )}
      {imageSrc && (
        <picture>
          <source
            type="image/webp"
            srcSet={`${src.replace(/\.\w+$/, ".webp")}`}
          />
          <source type="image/jpeg" srcSet={src} />
          <img
            src={imageSrc}
            alt={alt}
            width={width}
            height={height}
            loading={loading}
            decoding="async"
            style={{
              display: imageLoaded ? "block" : "none",
              width: "100%",
              height: "auto",
            }}
          />
        </picture>
      )}
    </motion.div>
  );
};

export default OptimizedImage;
