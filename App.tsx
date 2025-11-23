import React, { useState } from 'react';
import { Header } from './components/Header';
import { Recorder } from './components/Recorder';
import { FileUploader } from './components/FileUploader';
import { TextTranslator } from './components/TextTranslator';
import { TranslationResultCard } from './components/TranslationResultCard';
import { translateAudio, translateText } from './services/gemini';
import { AppMode, TranslationResult } from './types';
import { Mic, UploadCloud, AlertCircle, AlertTriangle, Type } from 'lucide-react';
import { Button } from './components/Button';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.LIVE);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [pendingResult, setPendingResult] = useState<TranslationResult | null>(null);
  const [showLanguageWarning, setShowLanguageWarning] = useState(false);
  
  const [currentInput, setCurrentInput] = useState<{type: 'audio', data: Blob} | {type: 'text', data: string} | null>(null);

  const resetState = () => {
    setResult(null);
    setError(null);
    setPendingResult(null);
    setShowLanguageWarning(false);
    setCurrentInput(null);
  };

  const processResult = (data: TranslationResult, forceLanguage?: string) => {
    if (forceLanguage) {
      setResult(data);
      setShowLanguageWarning(false);
      setPendingResult(null);
    } else {
      const detected = data.detectedLanguage.toLowerCase();
      const isCatalan = detected.includes('catalan') || detected.includes('català') || detected.includes('valencian');
      
      if (isCatalan || detected === 'unknown' || data.originalTranscription === 'Audio unintelligible') {
          setResult(data);
      } else {
          setPendingResult(data);
          setShowLanguageWarning(true);
      }
    }
  };

  const handleAudioSubmit = async (audioBlob: Blob, forceLanguage?: string) => {
    setIsProcessing(true);
    setError(null);
    if (!forceLanguage) {
        setResult(null);
        setPendingResult(null);
        setShowLanguageWarning(false);
    }
    setCurrentInput({ type: 'audio', data: audioBlob });

    try {
      const data = await translateAudio(audioBlob, forceLanguage);
      processResult(data, forceLanguage);
    } catch (err) {
      console.error(err);
      setError("Failed to translate audio. Please try again later or check your connection.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTextSubmit = async (text: string, forceLanguage?: string) => {
    setIsProcessing(true);
    setError(null);
    if (!forceLanguage) {
        setResult(null);
        setPendingResult(null);
        setShowLanguageWarning(false);
    }
    setCurrentInput({ type: 'text', data: text });

    try {
      const data = await translateText(text, forceLanguage);
      processResult(data, forceLanguage);
    } catch (err) {
      console.error(err);
      setError("Failed to translate text. Please try again later.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileSubmit = async (file: File | Blob) => {
    await handleAudioSubmit(file);
  };

  const confirmPendingResult = () => {
    setResult(pendingResult);
    setPendingResult(null);
    setShowLanguageWarning(false);
  };

  const retryAsCatalan = () => {
    if (!currentInput) return;
    
    if (currentInput.type === 'audio') {
        handleAudioSubmit(currentInput.data, 'Catalan');
    } else {
        handleTextSubmit(currentInput.data, 'Catalan');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 relative">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-24">
        <div className="max-w-3xl mx-auto space-y-8 sm:space-y-10">
          
          {/* Hero Section */}
          <div className="text-center space-y-4 mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-zinc-900 tracking-tight leading-tight">
              Translate <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600">Catalan</span>
            </h2>
            <p className="text-zinc-500 max-w-lg mx-auto leading-relaxed text-sm sm:text-base font-medium">
              Seamlessly translate audio, files, and text into English with advanced AI.
            </p>
          </div>

          {/* iOS Segmented Control */}
          <div className="bg-zinc-200/50 p-1.5 rounded-2xl flex relative backdrop-blur-sm max-w-md mx-auto w-full">
            {[
              { id: AppMode.LIVE, label: 'Voice', icon: Mic },
              { id: AppMode.UPLOAD, label: 'Upload', icon: UploadCloud },
              { id: AppMode.TEXT, label: 'Text', icon: Type },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => { setMode(item.id); resetState(); }}
                className={`flex-1 flex items-center justify-center py-2.5 sm:py-3 rounded-xl text-sm font-semibold transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${
                  mode === item.id
                    ? 'bg-white text-violet-700 shadow-md scale-[1.02] ring-1 ring-black/5'
                    : 'text-zinc-500 hover:text-zinc-700 hover:bg-white/50'
                }`}
              >
                <item.icon className={`w-4 h-4 mr-2 ${mode === item.id ? 'text-violet-600' : 'opacity-50'}`} />
                {item.label}
              </button>
            ))}
          </div>

          {/* Input Section */}
          <div className="transition-all duration-500 ease-out">
            {mode === AppMode.LIVE && (
              <div className="animate-fade-in-up">
                  <Recorder onRecordingComplete={(blob) => handleAudioSubmit(blob)} isProcessing={isProcessing} />
              </div>
            )}
            {mode === AppMode.UPLOAD && (
              <div className="animate-fade-in-up">
                  <FileUploader onFileSelect={handleFileSubmit} isProcessing={isProcessing} />
              </div>
            )}
            {mode === AppMode.TEXT && (
              <div className="animate-fade-in-up">
                  <TextTranslator onTranslate={handleTextSubmit} isProcessing={isProcessing} />
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl animate-fade-in flex items-start">
                <AlertCircle className="h-5 w-5 text-rose-500 mt-0.5 flex-shrink-0" />
                <p className="ml-3 text-sm text-rose-600 font-medium">{error}</p>
            </div>
          )}

          {/* Results Section */}
          {result && !showLanguageWarning && (
            <div className="mt-8">
              <TranslationResultCard result={result} />
            </div>
          )}

        </div>
      </main>

      {/* Language Warning Modal */}
      {showLanguageWarning && pendingResult && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-2xl max-w-sm w-full overflow-hidden transform transition-all scale-100 border border-white/50">
                <div className="p-6 sm:p-8 text-center">
                    <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-5 text-amber-500 shadow-sm">
                        <AlertTriangle className="w-7 h-7" />
                    </div>
                    
                    <h3 className="text-xl font-bold text-zinc-900 mb-2">Language Detected</h3>
                    
                    <p className="text-zinc-500 text-sm mb-6 leading-relaxed font-medium">
                        It looks like the audio is in <span className="font-bold text-zinc-900">{pendingResult.detectedLanguage}</span>. 
                        Do you want to proceed?
                    </p>

                    <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100 mb-6 text-left shadow-inner">
                         <p className="text-[10px] text-zinc-400 uppercase font-bold mb-2 tracking-wider">Preview</p>
                         <p className="text-zinc-700 italic line-clamp-2 text-sm">"{pendingResult.originalTranscription}"</p>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Button onClick={confirmPendingResult} className="w-full justify-center bg-violet-600 hover:bg-violet-700 shadow-violet-200">
                            Translate from {pendingResult.detectedLanguage}
                        </Button>
                        <button 
                            onClick={retryAsCatalan} 
                            className="w-full py-3.5 text-sm font-bold text-zinc-400 hover:text-zinc-800 transition-colors"
                        >
                            Retry as Catalan
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      <footer className="bg-white border-t border-zinc-100 py-8 sm:py-10">
        <div className="container mx-auto px-4 text-center text-zinc-400 text-xs sm:text-sm font-medium">
          <p>© {new Date().getFullYear()} CataLive. Crafted by <span className="text-zinc-600 font-bold">NANAAGYEMAN</span>.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;