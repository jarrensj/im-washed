'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { Copy, Download, Check, X, Upload, Sparkles } from 'lucide-react';

export default function ImageUploader() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copying' | 'success' | 'failed'>('idle');
  const [isDragOver, setIsDragOver] = useState(false);
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
    setIsDragOver(false);
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
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
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
    <div className="min-h-screen py-8 px-4">
      <div className="w-full max-w-6xl mx-auto">
        <canvas ref={canvasRef} className="hidden" />
        
        {!uploadedImage ? (
          <div className="max-w-2xl mx-auto">
            <div
              className={`relative border-2 border-dashed rounded-2xl p-16 text-center transition-all duration-300 cursor-pointer group ${
                isDragOver 
                  ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50 scale-[1.02] shadow-xl' 
                  : 'border-gray-300 bg-white/50 hover:border-indigo-400 hover:bg-gradient-to-br hover:from-indigo-50 hover:to-purple-50 hover:scale-[1.01] hover:shadow-lg'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="space-y-8">
                <div className="flex justify-center items-center gap-3 mb-6">
                  <span className="text-4xl">🫧</span>
                  <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    I'm Washed
                  </h1>
                  <span className="text-4xl">🫧</span>
                </div>
                <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isDragOver 
                    ? 'bg-gradient-to-br from-indigo-100 to-purple-100 scale-110' 
                    : 'bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-indigo-100 group-hover:to-purple-100 group-hover:scale-110'
                }`}>
                  <Upload className={`w-10 h-10 transition-colors duration-300 ${
                    isDragOver ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-600'
                  }`} />
                </div>
                <div className="space-y-4">
                  <h2 className="text-3xl font-bold text-gray-900">
                    Upload Your Image
                  </h2>
                  <p className="text-lg text-gray-600">
                    Transform any image into an "I'm Washed" meme in seconds
                  </p>
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium">
                    <Sparkles className="w-4 h-4" />
                    Supports JPG, PNG, GIF and more
                  </div>
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
          </div>
        ) : (
          <div className="space-y-12">
            <div className="max-w-2xl mx-auto">
              <div className="space-y-6">
                <div className="relative group">
                  {isProcessing ? (
                    <div className="bg-white p-4 rounded-2xl shadow-lg">
                      <div className="w-full h-64 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl flex items-center justify-center">
                        <div className="text-center">
                          <div className="relative">
                            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 mx-auto mb-6"></div>
                            <div className="absolute inset-0 animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-indigo-600 mx-auto"></div>
                          </div>
                          <p className="text-lg font-medium bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            Generating your meme...
                          </p>
                          <div className="flex justify-center mt-4">
                            <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : processedImage ? (
                    <>
                      <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                      <div className="relative bg-white p-4 rounded-2xl shadow-xl">
                        <Image
                          src={processedImage}
                          alt="I'm washed meme"
                          width={600}
                          height={400}
                          className="w-full h-auto rounded-xl"
                        />
                        <div className="absolute top-2 right-2">
                          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                            washed fr
                          </div>
                        </div>
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center pt-8">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-8 py-4 rounded-xl hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-3"
              >
                <Upload className="w-5 h-5" />
                Upload New Image
              </button>
              
              {processedImage && (
                <>
                  {isDesktop && (
                    <button
                      onClick={copyImage}
                      disabled={copyStatus === 'copying'}
                      className={`px-8 py-4 rounded-xl transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-3 ${
                        copyStatus === 'copying' 
                          ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white cursor-not-allowed'
                          : copyStatus === 'success'
                          ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
                          : copyStatus === 'failed'
                          ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700'
                          : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700'
                      }`}
                    >
                      {copyStatus === 'copying' 
                        ? <Copy className="w-5 h-5 animate-pulse" />
                        : copyStatus === 'success'
                        ? <Check className="w-5 h-5" />
                        : copyStatus === 'failed'
                        ? <X className="w-5 h-5" />
                        : <Copy className="w-5 h-5" />
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
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-8 py-4 rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-3"
                  >
                    <Download className="w-5 h-5" />
                    Download Image
                  </button>
                </>
              )}
              
              <button
                onClick={clearImages}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-4 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-3"
              >
                <X className="w-5 h-5" />
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
    </div>
  );
} 