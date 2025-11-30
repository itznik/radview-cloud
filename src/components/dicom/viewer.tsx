'use client';

import React, { useEffect, useRef, useState } from 'react';
import { initCornerstone } from '@/lib/cornerstone-init';
import { Study } from '@/types';
import { 
  ZoomIn, 
  Move, 
  Contrast, 
  Ruler, 
  RotateCcw,
  FlipHorizontal,
  Sun
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ViewerProps {
  study: Study | null;
}

export function Viewer({ study }: ViewerProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [engine, setEngine] = useState<any>(null);
  const [activeTool, setActiveTool] = useState('Wwwc');
  const [isInverted, setIsInverted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Initialize Engine on Mount
  useEffect(() => {
    initCornerstone().then((core) => {
      if (core) setEngine(core);
    });
  }, []);

  // 2. Load Image when Study Changes
  useEffect(() => {
    const loadStudy = async () => {
      if (!engine || !study || !elementRef.current) return;

      try {
        const element = elementRef.current;
        engine.cornerstone.enable(element);

        // Prefix 'wadouri:' tells Cornerstone to use HTTP fetch
        const imageId = `wadouri:${study.file_url}`;
        
        // Load and Display
        const image = await engine.cornerstone.loadAndCacheImage(imageId);
        engine.cornerstone.displayImage(element, image);
        
        // Reset View
        engine.cornerstone.reset(element);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Could not load DICOM image. Check console.");
      }
    };

    loadStudy();

    // Cleanup to prevent memory leaks
    return () => {
      if (engine && elementRef.current) {
        engine.cornerstone.disable(elementRef.current);
      }
    };
  }, [study, engine]);

  // 3. Tool Switching Logic
  const activateTool = (toolName: string) => {
    if (!engine) return;
    
    // Deactivate current tool
    engine.cornerstoneTools.setToolPassive(activeTool);
    
    // Activate new tool
    setActiveTool(toolName);
    engine.cornerstoneTools.setToolActive(toolName, { mouseButtonMask: 1 });
  };

  // 4. Special Actions (Invert, Reset)
  const toggleInvert = () => {
    if (!engine || !elementRef.current) return;
    const viewport = engine.cornerstone.getViewport(elementRef.current);
    viewport.invert = !viewport.invert;
    engine.cornerstone.setViewport(elementRef.current, viewport);
    setIsInverted(!isInverted);
  };

  const resetViewport = () => {
    if (!engine || !elementRef.current) return;
    engine.cornerstone.reset(elementRef.current);
  };

  // --- Render ---
  
  if (!study) {
    return (
      <div className="flex-1 bg-black flex items-center justify-center text-zinc-700">
        <div className="text-center">
          <Contrast className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p>Select a study to view</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-black relative h-screen">
      
      {/* Toolbar */}
      <div className="h-14 bg-zinc-900 border-b border-zinc-800 flex items-center justify-center gap-2 px-4 z-10">
        <ToolBtn 
          icon={<Contrast className="w-4 h-4" />} 
          active={activeTool === 'Wwwc'} 
          onClick={() => activateTool('Wwwc')} 
          label="Levels"
        />
        <ToolBtn 
          icon={<Move className="w-4 h-4" />} 
          active={activeTool === 'Pan'} 
          onClick={() => activateTool('Pan')} 
          label="Pan"
        />
        <ToolBtn 
          icon={<ZoomIn className="w-4 h-4" />} 
          active={activeTool === 'Zoom'} 
          onClick={() => activateTool('Zoom')} 
          label="Zoom"
        />
        <div className="w-px h-6 bg-zinc-800 mx-2" />
        <ToolBtn 
          icon={<Sun className="w-4 h-4" />} 
          active={isInverted} 
          onClick={toggleInvert} 
          label="Invert"
        />
        <ToolBtn 
          icon={<RotateCcw className="w-4 h-4" />} 
          active={false} 
          onClick={resetViewport} 
          label="Reset"
        />
      </div>

      {/* Viewport (The Canvas) */}
      <div className="flex-1 relative overflow-hidden bg-black">
        <div 
          ref={elementRef}
          className="w-full h-full cursor-crosshair outline-none"
          onContextMenu={(e) => e.preventDefault()}
        />
        
        {/* Error Overlay */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50">
            <div className="text-red-500 border border-red-900 bg-red-950/50 px-4 py-2 rounded">
              {error}
            </div>
          </div>
        )}

        {/* Info Overlay (HUD) */}
        <div className="absolute top-4 left-4 text-blue-400 font-mono text-xs pointer-events-none">
           <div className="text-white font-bold">{study.metadata.patientName}</div>
           <div>{study.metadata.patientId}</div>
           <div className="text-zinc-500 mt-1">{study.metadata.institution}</div>
        </div>
      </div>
    </div>
  );
}

function ToolBtn({ icon, active, onClick, label }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center w-14 h-10 rounded hover:bg-zinc-800 transition-colors gap-0.5",
        active ? "text-blue-500 bg-blue-950/30" : "text-zinc-400"
      )}
    >
      {icon}
      <span className="text-[9px] font-medium">{label}</span>
    </button>
  );
}
