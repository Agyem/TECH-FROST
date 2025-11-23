import React from 'react';
import { jsPDF } from 'jspdf';
import { Download, Copy, Check, Share2, Sparkles } from 'lucide-react';
import { TranslationResult } from '../types';

interface TranslationResultCardProps {
  result: TranslationResult;
}

export const TranslationResultCard: React.FC<TranslationResultCardProps> = ({ result }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(result.englishTranslation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFillColor(124, 58, 237); // Violet 600
    doc.rect(0, 0, 210, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text("CataLive Translation", 10, 13);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Date: ${new Date().toLocaleString()}`, 10, 30);
    doc.text(`Detected Language: ${result.detectedLanguage}`, 10, 35);
    doc.setFontSize(14);
    doc.setTextColor(124, 58, 237);
    doc.text(`Original (${result.detectedLanguage})`, 10, 50);
    doc.setFontSize(12);
    doc.setTextColor(39, 39, 42); // Zinc 800
    const splitOriginal = doc.splitTextToSize(result.originalTranscription, 180);
    doc.text(splitOriginal, 10, 60);
    const nextY = 60 + (splitOriginal.length * 7) + 10;
    doc.setFontSize(14);
    doc.setTextColor(124, 58, 237);
    doc.text("Translation (English)", 10, nextY);
    doc.setFontSize(12);
    doc.setTextColor(39, 39, 42);
    const splitEnglish = doc.splitTextToSize(result.englishTranslation, 180);
    doc.text(splitEnglish, 10, nextY + 10);
    doc.save("translation.pdf");
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-2xl shadow-zinc-200/50 border border-zinc-100 overflow-hidden animate-fade-in-up">
      {/* Header Actions */}
      <div className="px-6 py-5 sm:px-8 sm:py-6 flex items-center justify-between border-b border-zinc-50">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-violet-50 text-violet-700 border border-violet-100 shadow-sm">
               <Sparkles className="w-3 h-3 mr-1.5" />
               {result.detectedLanguage}
            </span>
            <span className="text-zinc-300 text-xs hidden sm:inline">•</span>
            <span className="text-xs font-medium text-zinc-400 hidden sm:inline">Just now</span>
          </div>
          
          <div className="flex gap-2">
             <button 
                onClick={handleCopy}
                className="p-2 text-zinc-400 hover:text-violet-600 hover:bg-violet-50 rounded-full transition-colors"
                title="Copy Translation"
             >
                {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
             </button>
             <button 
                onClick={handleDownloadPDF}
                className="p-2 text-zinc-400 hover:text-violet-600 hover:bg-violet-50 rounded-full transition-colors"
                title="Download PDF"
             >
                <Download className="w-5 h-5" />
             </button>
          </div>
      </div>

      <div className="grid lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-zinc-100">
        {/* Source Text */}
        <div className="p-6 sm:p-10">
          <p className="text-zinc-400 text-xs font-bold mb-4 tracking-widest uppercase">Original</p>
          <p className="text-zinc-700 leading-relaxed text-lg sm:text-xl font-medium">
            {result.originalTranscription}
          </p>
        </div>
        
        {/* Translated Text */}
        <div className="p-6 sm:p-10 bg-violet-50/30">
          <p className="text-violet-600 text-xs font-bold mb-4 tracking-widest uppercase">English Translation</p>
          <p className="text-zinc-900 leading-relaxed text-lg sm:text-xl font-semibold">
            {result.englishTranslation}
          </p>
        </div>
      </div>
    </div>
  );
};