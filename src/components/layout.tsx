'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { Uploader } from '@/components/dicom/uploader';
import { Activity, Calendar, User, FileDigit, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Study } from '@/types'; // From Phase 1

interface SidebarProps {
  currentStudyId: string | null;
  onSelectStudy: (study: Study) => void;
}

export function Sidebar({ currentStudyId, onSelectStudy }: SidebarProps) {
  const [studies, setStudies] = useState<Study[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchStudies = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('studies')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setStudies(data as unknown as Study[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStudies();
  }, []);

  return (
    <aside className="w-80 flex flex-col h-full bg-zinc-950 border-r border-zinc-800">
      {/* Header */}
      <div className="h-14 flex items-center px-4 border-b border-zinc-800 gap-2">
        <Activity className="w-5 h-5 text-blue-500" />
        <span className="font-bold text-zinc-100 tracking-wide">RadView<span className="text-blue-500">Cloud</span></span>
      </div>

      {/* Uploader Section */}
      <Uploader onUploadComplete={fetchStudies} />

      {/* List Header */}
      <div className="px-4 py-2 bg-zinc-900/50 flex justify-between items-center">
        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Recent Studies</span>
        <button onClick={fetchStudies} className="p-1 hover:bg-zinc-800 rounded">
            <RefreshCw className={cn("w-3 h-3 text-zinc-500", loading && "animate-spin")} />
        </button>
      </div>

      {/* Studies List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {loading && studies.length === 0 && (
           <div className="p-4 text-center text-xs text-zinc-600">Loading studies...</div>
        )}

        {!loading && studies.length === 0 && (
           <div className="p-8 text-center flex flex-col items-center text-zinc-600">
              <FileDigit className="w-10 h-10 mb-2 opacity-20" />
              <span className="text-xs">No studies found.</span>
           </div>
        )}

        {studies.map((study) => (
          <div
            key={study.id}
            onClick={() => onSelectStudy(study)}
            className={cn(
              "p-3 rounded-lg cursor-pointer transition-all border border-transparent group",
              currentStudyId === study.id
                ? "bg-blue-950/30 border-blue-500/30"
                : "hover:bg-zinc-900 border-zinc-900 hover:border-zinc-800"
            )}
          >
            <div className="flex justify-between items-start mb-1">
              <span className={cn(
                "font-medium text-sm truncate max-w-[160px]",
                currentStudyId === study.id ? "text-blue-100" : "text-zinc-300 group-hover:text-white"
              )}>
                {study.patient_name || 'Anonymous'}
              </span>
              <span className="text-[10px] font-mono bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400">
                {study.modality || '??'}
              </span>
            </div>
            
            <div className="flex flex-col gap-0.5">
               <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                  <User className="w-3 h-3" />
                  <span className="truncate max-w-[180px]">{study.file_name}</span>
               </div>
               <div className="flex items-center gap-1.5 text-xs text-zinc-600">
                  <Calendar className="w-3 h-3" />
                  <span>{study.study_date || 'No Date'}</span>
               </div>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
