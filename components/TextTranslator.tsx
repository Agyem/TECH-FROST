import React, { useState } from 'react';
import { Type, Send, X, ArrowRight } from 'lucide-react';
import { Button } from './Button';

interface TextTranslatorProps {
  onTranslate: (text: string) => void;
  isProcessing: boolean;
}

export const TextTranslator: React.FC<TextTranslatorProps> = ({ onTranslate, isProcessing }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onTranslate(text);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        if (text.trim()) {
            onTranslate(text);
        }
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-[2rem] shadow-xl shadow-zinc-200/50 border border-white overflow-hidden p-1.5 focus-within:ring-2 focus-within:ring-violet-500/20 transition-all">
        
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type Catalan text here..."
              className="w-full min-h-[200px] p-6 text-lg sm:text-xl text-zinc-800 bg-transparent border-none focus:ring-0 resize-none placeholder:text-zinc-300 leading-relaxed"
              disabled={isProcessing}
            />
            
            {text && (
                <button 
                    type="button"
                    onClick={() => setText('')}
                    className="absolute top-4 right-4 p-2 bg-zinc-100 text-zinc-400 hover:text-zinc-600 rounded-full transition-colors hover:bg-zinc-200"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
          </div>

          <div className="px-4 pb-4">
             <div className="flex items-center justify-between bg-zinc-50/80 rounded-2xl p-2 pl-5">
                 <p className="text-xs font-semibold text-zinc-400 hidden sm:block">
                    <span className="bg-white px-2 py-1 rounded-md border border-zinc-200 text-[10px] mr-2 shadow-sm">⌘</span> 
                    + Enter
                 </p>
                 <span className={`text-xs font-semibold transition-colors ${text.length > 0 ? 'text-violet-500' : 'text-zinc-300'} sm:hidden`}>
                    {text.length} chars
                 </span>
                 <Button
                    type="submit"
                    disabled={!text.trim() || isProcessing}
                    isLoading={isProcessing}
                    className="w-auto ml-auto px-6 py-2.5 text-sm"
                    icon={!isProcessing && <ArrowRight className="w-4 h-4" />}
                 >
                    Translate
                 </Button>
             </div>
          </div>
        </form>
      </div>
    </div>
  );
};