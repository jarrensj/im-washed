'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { Copy, Download, Check, X, Upload } from 'lucide-react';

export default function ImageUploader() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copying' | 'success' | 'failed'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Check if we're on desktop
  useEffect(() => {
    const checkDevice = () => {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      setIsDesktop(!isMobile);
    };
    checkDevice();
  }, []);

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

  const downloadImage = async () => {
    if (!processedImage) return;
    
    try {
      // On mobile, try to share first
      if (typeof navigator !== 'undefined' && navigator.share && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
        try {
          const response = await fetch(processedImage);
          const blob = await response.blob();
          const file = new File([blob], 'im-washed-meme.png', { type: 'image/png' });
          await navigator.share({
            title: "I'm Washed Meme",
            text: "Check out this I'm washed meme!",
            files: [file]
          });
          return;
        } catch (shareError) {
          console.log('Share failed, falling back to download');
        }
      }
      
      // Desktop download - direct download without trying share first
      const link = document.createElement('a');
      link.download = 'im-washed.png';
      link.href = processedImage;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Download failed:', error);
      // Final fallback - just open the image in a new tab
      window.open(processedImage, '_blank');
    }
  };

  const copyImage = async () => {
    if (!processedImage) return;
    
    setCopyStatus('copying');
    
    try {
      // Check if clipboard API is supported
      if (!navigator.clipboard || !navigator.clipboard.write) {
        console.log('Clipboard API not supported');
        setCopyStatus('failed');
        setTimeout(() => setCopyStatus('idle'), 2000);
        return;
      }

      // Create a new image element to load the processed image
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = async () => {
        try {
          // Create a canvas to convert the image to blob
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            setCopyStatus('failed');
            setTimeout(() => setCopyStatus('idle'), 2000);
            return;
          }

          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          // Convert canvas to blob
          canvas.toBlob(async (blob) => {
            if (!blob) {
              setCopyStatus('failed');
              setTimeout(() => setCopyStatus('idle'), 2000);
              return;
            }
            
            try {
              await navigator.clipboard.write([
                new ClipboardItem({
                  'image/png': blob
                })
              ]);
              console.log('Image copied to clipboard successfully');
              setCopyStatus('success');
              setTimeout(() => setCopyStatus('idle'), 2000);
            } catch (clipError) {
              console.error('Clipboard write failed:', clipError);
              setCopyStatus('failed');
              setTimeout(() => setCopyStatus('idle'), 2000);
            }
          }, 'image/png');
        } catch (error) {
          console.error('Image processing for copy failed:', error);
          setCopyStatus('failed');
          setTimeout(() => setCopyStatus('idle'), 2000);
        }
      };

      img.onerror = () => {
        console.error('Failed to load image for copying');
        setCopyStatus('failed');
        setTimeout(() => setCopyStatus('idle'), 2000);
      };

      img.src = processedImage;
      
    } catch (error) {
      console.error('Copy failed:', error);
      setCopyStatus('failed');
      setTimeout(() => setCopyStatus('idle'), 2000);
    }
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
              <Upload className="w-8 h-8 text-gray-400" />
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
              <>
                {isDesktop && (
                  <button
                    onClick={copyImage}
                    disabled={copyStatus === 'copying'}
                    className={`px-6 py-3 rounded-lg transition-colors font-medium flex items-center gap-2 ${
                      copyStatus === 'copying' 
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : copyStatus === 'success'
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : copyStatus === 'failed'
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-purple-500 text-white hover:bg-purple-600'
                    }`}
                  >
                    {copyStatus === 'copying' 
                      ? <Copy className="w-4 h-4 animate-pulse" />
                      : copyStatus === 'success'
                      ? <Check className="w-4 h-4" />
                      : copyStatus === 'failed'
                      ? <X className="w-4 h-4" />
                      : <Copy className="w-4 h-4" />
                    }
                    {copyStatus === 'copying' 
                      ? 'Copying...' 
                      : copyStatus === 'success'
                      ? 'Copied!'
                      : copyStatus === 'failed'
                      ? 'Copy Failed'
                      : 'Copy Image'
                    }
                  </button>
                )}
                <button
                  onClick={downloadImage}
                  className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download Image
                </button>
              </>
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