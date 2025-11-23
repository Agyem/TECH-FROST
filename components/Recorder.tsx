import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2, X, Pause } from 'lucide-react';
import { Button } from './Button';

interface RecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  isProcessing: boolean;
  onCancel?: () => void;
}

export const Recorder: React.FC<RecorderProps> = ({ onRecordingComplete, isProcessing, onCancel }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        onRecordingComplete(blob);
        stopVisualization();
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      startTimer();
      startVisualization(stream);

    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      stopTimer();
    }
  };

  const startTimer = () => {
    setRecordingTime(0);
    timerRef.current = window.setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Audio Visualization Logic
  const startVisualization = (stream: MediaStream) => {
    if (!canvasRef.current || !containerRef.current) return;
    
    // Set canvas size to match container for responsiveness
    canvasRef.current.width = containerRef.current.offsetWidth;
    canvasRef.current.height = containerRef.current.offsetHeight;

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
        audioContextRef.current = new AudioContextClass();
        analyserRef.current = audioContextRef.current.createAnalyser();
        sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
        sourceRef.current.connect(analyserRef.current);
        analyserRef.current.fftSize = 64; // Lower FFT size for chunkier bars
        
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        const canvas = canvasRef.current;
        const canvasCtx = canvas.getContext('2d');
        
        if (!canvasCtx) return;

        const draw = () => {
            if (!analyserRef.current) return;
            animationFrameRef.current = requestAnimationFrame(draw);
            analyserRef.current.getByteFrequencyData(dataArray);

            // Clear
            canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

            const barWidth = (canvas.width / bufferLength) * 2; 
            let x = 0;

            const centerY = canvas.height / 2;

            for(let i = 0; i < bufferLength; i++) {
                const value = dataArray[i];
                const barHeight = (value / 255) * canvas.height * 0.7; // Scale height

                // Gradient or solid fill
                const gradient = canvasCtx.createLinearGradient(0, centerY - barHeight/2, 0, centerY + barHeight/2);
                gradient.addColorStop(0, '#f43f5e'); // Rose 500
                gradient.addColorStop(1, '#8b5cf6'); // Violet 500
                
                canvasCtx.fillStyle = gradient;
                
                // Draw mirrored bars from center
                if (barHeight > 4) {
                    canvasCtx.beginPath();
                    canvasCtx.roundRect(x, centerY - barHeight / 2, barWidth - 4, barHeight, 10);
                    canvasCtx.fill();
                } else {
                     // Minimal dot when silent
                    canvasCtx.fillStyle = '#e4e4e7'; // Zinc 200
                    canvasCtx.beginPath();
                    canvasCtx.roundRect(x, centerY - 2, barWidth - 4, 4, 2);
                    canvasCtx.fill();
                }

                x += barWidth;
            }
        };
        draw();
    }
  };

  const stopVisualization = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  };

  useEffect(() => {
    const handleResize = () => {
        if(canvasRef.current && containerRef.current) {
             canvasRef.current.width = containerRef.current.offsetWidth;
             canvasRef.current.height = containerRef.current.offsetHeight;
        }
    }
    window.addEventListener('resize', handleResize);
    return () => {
      stopTimer();
      stopVisualization();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative flex flex-col items-center justify-center p-6 sm:p-12 bg-white rounded-[2rem] shadow-xl shadow-zinc-200/50 border border-white">
      
      {onCancel && !isRecording && !isProcessing && (
        <button 
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-600 rounded-full hover:bg-zinc-50 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      )}

      {/* Visualization / Status Area */}
      <div 
        ref={containerRef}
        className="w-full h-32 sm:h-40 mb-8 flex items-center justify-center relative rounded-2xl overflow-hidden bg-zinc-50/50"
      >
         {!isRecording && !isProcessing && (
           <div className="text-center z-10">
             <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-3 text-violet-500">
                <Mic className="w-8 h-8" />
             </div>
             <p className="text-zinc-400 text-sm font-medium">Tap button to start</p>
           </div>
         )}
         
         {isRecording && (
             <>
                <canvas 
                    ref={canvasRef} 
                    className="w-full h-full absolute inset-0 z-10"
                />
                <div className="absolute top-4 bg-rose-50/90 backdrop-blur text-rose-500 px-4 py-1.5 rounded-full text-sm font-mono font-bold tracking-widest z-20 shadow-sm border border-rose-100">
                    {formatTime(recordingTime)}
                </div>
             </>
         )}

         {isProcessing && (
             <div className="flex flex-col items-center animate-pulse z-10">
                 <Loader2 className="w-10 h-10 text-violet-500 animate-spin mb-3" />
                 <p className="text-violet-600 font-semibold text-sm tracking-wide">Translating...</p>
             </div>
         )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center w-full">
        {!isRecording ? (
          <button 
            onClick={startRecording} 
            disabled={isProcessing}
            className="group relative flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-rose-500 text-white shadow-2xl shadow-rose-200 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:shadow-none"
          >
             <div className="absolute inset-0 rounded-full border-4 border-rose-100 group-hover:border-rose-200 transition-colors"></div>
             <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full"></div>
          </button>
        ) : (
          <button 
            onClick={stopRecording} 
            className="group relative flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-zinc-100 bg-white transition-all hover:scale-105 active:scale-95 shadow-lg shadow-zinc-100"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-rose-500 rounded-xl shadow-sm"></div>
          </button>
        )}
      </div>
      
      {!isRecording && !isProcessing && (
        <p className="mt-8 text-xs text-zinc-400 text-center max-w-xs mx-auto leading-relaxed font-medium">
            Record crystal clear Catalan speech for the best results.
        </p>
      )}
    </div>
  );
};