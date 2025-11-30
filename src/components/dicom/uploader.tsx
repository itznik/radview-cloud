'use client';

import React, { useState } from 'react';
import { Upload, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface UploaderProps {
  onUploadComplete: () => void; // Callback to refresh the list
}

export function Uploader({ onUploadComplete }: UploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<string>('');
  const supabase = createClient();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setStatus('Uploading to Cloud...');

    try {
      // 1. Upload to Supabase Storage
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('dicom-files')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('dicom-files')
        .getPublicUrl(fileName);

      setStatus('Parsing Headers...');

      // 3. Call our API to parse metadata (Lazy Load)
      const parseRes = await fetch('/api/parse-dicom', {
        method: 'POST',
        body: JSON.stringify({ url: publicUrl }),
      });
      
      const parseData = await parseRes.json();
      if (!parseData.success) throw new Error(parseData.error);

      setStatus('Saving to Database...');

      // 4. Save to Database
      const { error: dbError } = await supabase
        .from('studies')
        .insert({
          file_url: publicUrl,
          file_name: file.name,
          patient_name: parseData.metadata.patientName,
          modality: parseData.metadata.modality,
          study_date: parseData.metadata.studyDate,
        });

      if (dbError) throw dbError;

      setStatus('Done!');
      onUploadComplete(); // Tell parent to refresh list
      
    } catch (error: any) {
      console.error(error);
      setStatus(`Error: ${error.message}`);
    } finally {
      setIsUploading(false);
      // Clear status after 3 seconds
      setTimeout(() => setStatus(''), 3000);
    }
  };

  return (
    <div className="p-4 border-b border-zinc-800">
      <div className="relative">
        <input
          type="file"
          accept=".dcm"
          onChange={handleFileChange}
          disabled={isUploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div className={cn(
          "border-2 border-dashed border-zinc-700 rounded-lg p-6 flex flex-col items-center justify-center transition-colors hover:border-blue-500 hover:bg-zinc-800/50",
          isUploading && "opacity-50 pointer-events-none"
        )}>
          {isUploading ? (
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
          ) : (
            <Upload className="w-8 h-8 text-zinc-400 mb-2" />
          )}
          <p className="text-sm font-medium text-zinc-300">
            {isUploading ? 'Processing...' : 'Upload DICOM'}
          </p>
          <p className="text-xs text-zinc-500 mt-1">Drag or Click</p>
        </div>
      </div>
      
      {status && (
        <div className="mt-2 text-xs text-center flex items-center justify-center gap-2 text-zinc-400">
          {status.includes('Error') ? <XCircle className="w-3 h-3 text-red-500"/> : <CheckCircle className="w-3 h-3 text-green-500"/>}
          {status}
        </div>
      )}
    </div>
  );
}
