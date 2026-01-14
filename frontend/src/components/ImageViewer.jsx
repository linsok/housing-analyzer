import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  X, ZoomIn, ZoomOut, RotateCw, Maximize2, Minimize2, 
  ChevronLeft, ChevronRight, Download, Share2 
} from 'lucide-react';

const ImageViewer = ({ isOpen, onClose, images, currentIndex, onImageChange }) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  if (!isOpen) return null;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          handlePrevImage();
          break;
        case 'ArrowRight':
          handleNextImage();
          break;
        case '+':
        case '=':
          handleZoomIn();
          break;
        case '-':
        case '_':
          handleZoomOut();
          break;
        case '0':
          handleReset();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, images.length]);

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  }, []);

  const handleRotate = useCallback(() => {
    setRotation(prev => prev + 90);
  }, []);

  const handleReset = useCallback(() => {
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  }, []);

  // Navigation
  const handlePrevImage = useCallback(() => {
    if (onImageChange) {
      onImageChange((currentIndex - 1 + images.length) % images.length);
      handleReset(); // Reset zoom/rotation when changing images
    }
  }, [currentIndex, images.length, onImageChange, handleReset]);

  const handleNextImage = useCallback(() => {
    if (onImageChange) {
      onImageChange((currentIndex + 1) % images.length);
      handleReset(); // Reset zoom/rotation when changing images
    }
  }, [currentIndex, images.length, onImageChange, handleReset]);

  // Drag functionality
  const handleMouseDown = useCallback((e) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  }, [zoom, position]);

  const handleMouseMove = useCallback((e) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  }, [isDragging, dragStart, zoom]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch support for mobile
  const handleTouchStart = useCallback((e) => {
    if (zoom > 1 && e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({
        x: touch.clientX - position.x,
        y: touch.clientY - position.y
      });
    }
  }, [zoom, position]);

  const handleTouchMove = useCallback((e) => {
    if (isDragging && zoom > 1 && e.touches.length === 1) {
      const touch = e.touches[0];
      setPosition({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y
      });
    }
  }, [isDragging, dragStart, zoom]);

  // Utility functions
  const handleDownload = useCallback(() => {
    const link = document.createElement('a');
    link.href = images[currentIndex];
    link.download = `property-image-${currentIndex + 1}.jpg`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [images, currentIndex]);

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Property Image ${currentIndex + 1}`,
          url: images[currentIndex]
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(images[currentIndex]);
    }
  }, [images, currentIndex]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  const currentImage = images[currentIndex];

  return (
    <div 
      className={`fixed inset-0 bg-black z-50 flex items-center justify-center ${isFullscreen ? 'bg-opacity-100' : 'bg-opacity-95'}`}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseUp}
      ref={containerRef}
    >
      {/* Header Controls */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-4 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Image Counter */}
            <div className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
              {currentIndex + 1} / {images.length}
            </div>
            
            {/* Zoom Level Indicator */}
            {zoom !== 1 && (
              <div className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                {Math.round(zoom * 100)}%
              </div>
            )}
          </div>
          
          {/* Control Buttons */}
          <div className="flex items-center gap-2">
            {/* Download Button */}
            <button
              onClick={handleDownload}
              className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-all duration-200 group"
              title="Download Image"
            >
              <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </button>
            
            {/* Share Button */}
            <button
              onClick={handleShare}
              className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-all duration-200 group"
              title="Share Image"
            >
              <Share2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </button>
            
            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-all duration-200 group"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
              ) : (
                <Maximize2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
              )}
            </button>
            
            {/* Zoom Controls */}
            <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full p-1 gap-1">
              <button
                onClick={handleZoomOut}
                className="p-1.5 rounded-full text-white hover:bg-white/30 transition-all duration-200"
                title="Zoom Out"
                disabled={zoom <= 0.5}
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              
              <button
                onClick={handleZoomIn}
                className="p-1.5 rounded-full text-white hover:bg-white/30 transition-all duration-200"
                title="Zoom In"
                disabled={zoom >= 3}
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              
              <button
                onClick={handleRotate}
                className="p-1.5 rounded-full text-white hover:bg-white/30 transition-all duration-200"
                title="Rotate"
              >
                <RotateCw className="w-4 h-4" />
              </button>
              
              <button
                onClick={handleReset}
                className="p-1.5 rounded-full text-white hover:bg-white/30 transition-all duration-200 text-xs font-medium"
                title="Reset"
              >
                Reset
              </button>
            </div>
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-all duration-200 group"
              title="Close (Esc)"
            >
              <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Image Container */}
      <div className="flex items-center justify-center w-full h-full p-4 lg:p-8">
        <div className="relative max-w-full max-h-full overflow-hidden">
          <img
            ref={imageRef}
            src={currentImage}
            alt={`Property image ${currentIndex + 1}`}
            className="max-w-full max-h-full object-contain transition-all duration-300 select-none"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg) translate(${position.x}px, ${position.y}px)`,
              cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
            }}
            draggable={false}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          />
        </div>
      </div>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={handlePrevImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={currentIndex === 0}
            title="Previous Image (←)"
          >
            <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          
          <button
            onClick={handleNextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={currentIndex === images.length - 1}
            title="Next Image (→)"
          >
            <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </>
      )}

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm p-3 rounded-2xl">
          <div className="flex gap-2 max-w-[90vw] overflow-x-auto">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onImageChange && onImageChange(idx);
                  handleReset();
                }}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                  idx === currentIndex 
                    ? 'border-white shadow-lg scale-110' 
                    : 'border-transparent hover:border-gray-400 hover:scale-105'
                }`}
                title={`Go to image ${idx + 1}`}
              >
                <img 
                  src={img} 
                  alt={`Thumbnail ${idx + 1}`} 
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 text-white/60 text-xs hidden lg:block">
        Use arrow keys to navigate • +/- to zoom • Esc to close
      </div>
    </div>
  );
};

export default ImageViewer;
