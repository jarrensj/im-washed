'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';

export default function ImageUploader() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateWashedImage = useCallback((imageUrl: string) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas dimensions to match image
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw the original image
      ctx.drawImage(img, 0, 0);

      // Add dark overlay for better text visibility
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Configure text style
      const fontSize = Math.max(canvas.width / 15, 24);
      ctx.font = `bold ${fontSize}px Arial, sans-serif`;
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = fontSize / 12;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Add "I'M WASHED" text in the center
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // Add stroke (outline) first
      ctx.strokeText("I'M WASHED", centerX, centerY);
      // Then add fill text
      ctx.fillText("I'M WASHED", centerX, centerY);

      // Convert canvas to blob and create URL
      canvas.toBlob((blob) => {
        if (blob) {
          const processedUrl = URL.createObjectURL(blob);
          setProcessedImage(processedUrl);
          setIsProcessing(false);
        }
      }, 'image/png');
    };

    img.src = imageUrl;
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setIsProcessing(true);
    setProcessedImage(null);

    // Create a URL for the uploaded image
    const imageUrl = URL.createObjectURL(file);
    setUploadedImage(imageUrl);
    
    // Generate the "I'm washed" version
    generateWashedImage(imageUrl);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setIsProcessing(true);
    setProcessedImage(null);

    const imageUrl = URL.createObjectURL(file);
    setUploadedImage(imageUrl);
    generateWashedImage(imageUrl);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const clearImages = () => {
    if (uploadedImage) {
      URL.revokeObjectURL(uploadedImage);
      setUploadedImage(null);
    }
    if (processedImage) {
      URL.revokeObjectURL(processedImage);
      setProcessedImage(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadImage = () => {
    if (!processedImage) return;
    
    const link = document.createElement('a');
    link.download = 'im-washed-meme.png';
    link.href = processedImage;
    link.click();
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <canvas ref={canvasRef} className="hidden" />
      
      {!uploadedImage ? (
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-gray-400 transition-colors cursor-pointer"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="space-y-6">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Upload Image to Generate "I'm Washed" Meme
              </h2>
              <p className="text-lg text-gray-600 mb-4">
                Click to select or drag and drop an image
              </p>
              <p className="text-sm text-gray-500">
                Supports JPG, PNG, GIF and other image formats
              </p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Original Image */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900">Original Image</h3>
              <div className="relative">
                <Image
                  src={uploadedImage}
                  alt="Original uploaded image"
                  width={400}
                  height={300}
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              </div>
            </div>

            {/* Processed Image */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900">I'm Washed Version</h3>
              <div className="relative">
                {isProcessing ? (
                  <div className="w-full h-64 bg-gray-100 rounded-lg shadow-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                      <p className="text-gray-600">Generating meme...</p>
                    </div>
                  </div>
                ) : processedImage ? (
                  <Image
                    src={processedImage}
                    alt="I'm washed meme"
                    width={400}
                    height={300}
                    className="w-full h-auto rounded-lg shadow-lg"
                  />
                ) : null}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              Upload New Image
            </button>
            {processedImage && (
              <button
                onClick={downloadImage}
                className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors font-medium"
              >
                Download Meme
              </button>
            )}
            <button
              onClick={clearImages}
              className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors font-medium"
            >
              Clear All
            </button>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
} 