import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

const ImageViewer = ({ isOpen, onClose, images, currentIndex, onImageChange }) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  if (!isOpen) return null;

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleRotate = () => {
    setRotation(prev => prev + 90);
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
  };

  const handlePrevImage = () => {
    if (onImageChange) {
      onImageChange((currentIndex - 1 + images.length) % images.length);
    }
  };

  const handleNextImage = () => {
    if (onImageChange) {
      onImageChange((currentIndex + 1) % images.length);
    }
  };

  const currentImage = images[currentIndex];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
      {/* Header Controls */}
      <div className="absolute top-0 left-0 right-0 bg-black bg-opacity-50 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-white text-sm">
            {currentIndex + 1} / {images.length}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            className="p-2 bg-white bg-opacity-20 rounded-full text-white hover:bg-opacity-30 transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          
          <button
            onClick={handleZoomIn}
            className="p-2 bg-white bg-opacity-20 rounded-full text-white hover:bg-opacity-30 transition"
            title="Zoom In"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          
          <button
            onClick={handleRotate}
            className="p-2 bg-white bg-opacity-20 rounded-full text-white hover:bg-opacity-30 transition"
            title="Rotate"
          >
            <RotateCw className="w-5 h-5" />
          </button>
          
          <button
            onClick={handleReset}
            className="p-2 bg-white bg-opacity-20 rounded-full text-white hover:bg-opacity-30 transition text-sm"
            title="Reset"
          >
            Reset
          </button>
        </div>
        
        <button
          onClick={onClose}
          className="p-2 bg-white bg-opacity-20 rounded-full text-white hover:bg-opacity-30 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Image Container */}
      <div className="flex items-center justify-center w-full h-full p-20">
        <div className="relative max-w-full max-h-full overflow-hidden">
          <img
            src={currentImage}
            alt={`Property image ${currentIndex + 1}`}
            className="max-w-full max-h-full object-contain transition-transform duration-300"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              cursor: zoom > 1 ? 'move' : 'default'
            }}
            draggable={false}
          />
        </div>
      </div>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={handlePrevImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white bg-opacity-20 rounded-full text-white hover:bg-opacity-30 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={handleNextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white bg-opacity-20 rounded-full text-white hover:bg-opacity-30 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black bg-opacity-50 p-2 rounded-lg">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => onImageChange && onImageChange(idx)}
              className={`w-12 h-12 rounded overflow-hidden border-2 transition ${
                idx === currentIndex 
                  ? 'border-white' 
                  : 'border-transparent hover:border-gray-400'
              }`}
            >
              <img 
                src={img} 
                alt={`Thumbnail ${idx + 1}`} 
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Click outside to close */}
      <div 
        className="absolute inset-0" 
        onClick={onClose}
      />
    </div>
  );
};

export default ImageViewer;
