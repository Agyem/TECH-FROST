import React, { useRef, useState } from 'react';
import { Upload, FileAudio, X, Mic, ArrowRight } from 'lucide-react';
import { Button } from './Button';
import { Recorder } from './Recorder';

interface FileUploaderProps {
  onFileSelect: (file: File | Blob) => void;
  isProcessing: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect, isProcessing }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showRecorder, setShowRecorder] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (file.type.startsWith('audio/') || file.type.startsWith('video/')) {
        setSelectedFile(file);
    } else {
        alert("Please upload an audio file.");
    }
  };

  const triggerSelect = () => {
    inputRef.current?.click();
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleTranslateClick = () => {
    if (selectedFile) {
        onFileSelect(selectedFile);
    }
  };

  if (showRecorder) {
    return (
      <div className="w-full max-w-2xl mx-auto animate-fade-in">
        <Recorder 
             onRecordingComplete={(blob) => onFileSelect(blob)} 
             isProcessing={isProcessing}
             onCancel={() => setShowRecorder(false)}
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {!selectedFile ? (
        <div 
          className={`relative group flex flex-col items-center justify-center w-full min-h-[300px] sm:min-h-[360px] rounded-[2rem] transition-all duration-300 border-2 border-dashed ${dragActive ? 'border-violet-500 bg-violet-50/50 scale-[1.01]' : 'border-zinc-200 bg-white hover:border-violet-300 hover:bg-zinc-50/50'}`}
          onDragEnter={handleDrag} 
          onDragLeave={handleDrag} 
          onDragOver={handleDrag} 
          onDrop={handleDrop}
        >
          <input 
            ref={inputRef}
            type="file" 
            className="hidden" 
            accept="audio/*,video/*"
            onChange={handleChange}
          />
          
          <div className="flex flex-col items-center text-center p-6 sm:p-8 space-y-6">
            <div className={`p-5 sm:p-6 rounded-full transition-transform duration-300 ${dragActive ? 'bg-violet-100 scale-110' : 'bg-zinc-50 group-hover:scale-105'}`}>
              <Upload className={`w-8 h-8 sm:w-10 sm:h-10 ${dragActive ? 'text-violet-600' : 'text-zinc-400'}`} />
            </div>
            
            <div className="space-y-1.5">
              <p className="text-lg sm:text-xl font-bold text-zinc-800">
                Upload Audio File
              </p>
              <p className="text-sm text-zinc-500">
                Drag & drop or tap to browse
              </p>
            </div>

            <div className="flex flex-col w-full gap-3 pt-2 items-center">
                <Button onClick={triggerSelect} className="w-full sm:w-auto min-w-[200px]">
                    Choose File
                </Button>
                <button 
                  onClick={() => setShowRecorder(true)}
                  className="text-sm font-semibold text-zinc-500 hover:text-violet-600 transition-colors py-2"
                >
                    Or use <span className="underline decoration-zinc-300 hover:decoration-violet-300 underline-offset-2">Microphone</span>
                </button>
            </div>
            
            <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold pt-2">
              MP3 • WAV • M4A • AAC
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] shadow-xl shadow-zinc-200/50 border border-zinc-100 overflow-hidden animate-fade-in-up">
            <div className="p-6 sm:p-10">
                <div className="flex items-start justify-between mb-8">
                     <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 bg-violet-50 rounded-2xl flex items-center justify-center text-violet-600 shadow-sm">
                            <FileAudio className="w-7 h-7" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-zinc-900 truncate max-w-[150px] sm:max-w-[250px] text-lg">{selectedFile.name}</p>
                            <p className="text-sm text-zinc-500 font-medium">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                        </div>
                    </div>
                    <button onClick={clearFile} className="p-2.5 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <Button 
                    onClick={handleTranslateClick} 
                    isLoading={isProcessing}
                    className="w-full py-4 text-lg shadow-violet-200/50"
                    icon={!isProcessing && <ArrowRight className="w-5 h-5" />}
                >
                    {isProcessing ? 'Translating File...' : 'Translate Now'}
                </Button>
            </div>
        </div>
      )}
    </div>
  );
};