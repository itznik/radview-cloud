'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Viewer } from '@/components/dicom/viewer';
import { Study } from '@/types';

export default function Home() {
  const [selectedStudy, setSelectedStudy] = useState<Study | null>(null);

  return (
    <main className="flex h-screen w-full bg-black overflow-hidden">
      {/* Left Panel */}
      <Sidebar 
        currentStudyId={selectedStudy?.id || null} 
        onSelectStudy={setSelectedStudy} 
      />

      {/* Right Panel (Main) */}
      <Viewer study={selectedStudy} />
    </main>
  );
}
