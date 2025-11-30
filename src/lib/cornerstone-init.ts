import dicomParser from 'dicom-parser';

export async function initCornerstone() {
  if (typeof window === 'undefined') return null;

  try {
    // Dynamic imports to prevent Server-Side Rendering (SSR) crashes
    const cornerstone = (await import('cornerstone-core')).default;
    const cornerstoneTools = (await import('cornerstone-tools')).default;
    const cornerstoneWADOImageLoader = (await import('cornerstone-wado-image-loader')).default;
    await import('hammerjs'); // Required for touch interactions

    // 1. Configure the Image Loader
    cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
    cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
    
    // Configure the web worker (optional but recommended for speed, skipped here for simplicity)
    // For this mobile-first build, we run on the main thread to avoid complex worker file setup

    // 2. Configure Tools
    cornerstoneTools.external.cornerstone = cornerstone;
    cornerstoneTools.external.Hammer = window.Hammer;
    cornerstoneTools.init();

    // 3. Register standard tools
    const { 
      WwwcTool,      // Window/Level (Brightness/Contrast)
      PanTool, 
      ZoomTool, 
      LengthTool,    // Ruler
    } = cornerstoneTools;

    cornerstoneTools.addTool(WwwcTool);
    cornerstoneTools.addTool(PanTool);
    cornerstoneTools.addTool(ZoomTool);
    cornerstoneTools.addTool(LengthTool);

    // Set initial tool state
    cornerstoneTools.setToolActive('Wwwc', { mouseButtonMask: 1 }); // Left Click
    cornerstoneTools.setToolActive('Pan', { mouseButtonMask: 2 });  // Right Click (or two fingers)
    cornerstoneTools.setToolActive('Zoom', { mouseButtonMask: 4 }); // Middle Click

    return { cornerstone, cornerstoneTools };
  } catch (error) {
    console.error("Cornerstone init failed:", error);
    return null;
  }
}
