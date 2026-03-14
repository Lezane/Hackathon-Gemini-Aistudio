import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, FileText, ArrowRight, FlaskConical, Loader2, CheckCircle2, XCircle, AlertCircle, Download, GitMerge, Layout, ShieldCheck } from 'lucide-react';
import { MarkdownRenderer } from './components/MarkdownRenderer';
import { Mermaid } from './components/Mermaid';
import { 
  generateSynthesisMap, 
  generateExperimentFactory, 
  generatePaperDiagram,
  generateMergedSynthesis,
  generateFormalProof,
  PdfDocument 
} from './services/geminiService';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

type Phase = 0 | 1 | 2 | 3 | 4;

export default function App() {
  const [phase, setPhase] = useState<Phase>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Phase 0 Data
  const [goal, setGoal] = useState('');
  const [pdfs, setPdfs] = useState<PdfDocument[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Phase 1 Data
  const [synthesisMap, setSynthesisMap] = useState('');
  const [diagrams, setDiagrams] = useState<Record<string, string>>({});
  const [generatingDiagrams, setGeneratingDiagrams] = useState(false);

  // Phase 2 Data (Fusion)
  const [mergedSynthesis, setMergedSynthesis] = useState('');
  const mergedPaperRef = useRef<HTMLDivElement>(null);

  // Phase 3 Data (Proof)
  const [formalProof, setFormalProof] = useState('');

  // Phase 4 Data (Experiment)
  const [experimentFactory, setExperimentFactory] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (pdfs.length + files.length > 3) {
      setError("Please upload a maximum of 3 PDFs total.");
      return;
    }
    
    const newPdfs: PdfDocument[] = [...pdfs];
    for (const file of files) {
      if (file.type !== 'application/pdf') {
        setError("Only PDF files are allowed.");
        return;
      }
      const reader = new FileReader();
      const promise = new Promise<void>((resolve, reject) => {
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          newPdfs.push({
            name: file.name,
            mimeType: file.type,
            data: base64
          });
          resolve();
        };
        reader.onerror = reject;
      });
      reader.readAsDataURL(file);
      await promise;
    }
    setPdfs(newPdfs);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePhase1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim() || pdfs.length === 0) {
      setError("Please provide a research goal and upload at least 1 PDF.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await generateSynthesisMap(goal, pdfs);
      setSynthesisMap(result);
      setPhase(1);
    } catch (err: any) {
      setError(err.message || "Failed to generate Synthesis Map.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateDiagrams = async () => {
    setGeneratingDiagrams(true);
    setError(null);
    try {
      const newDiagrams: Record<string, string> = {};
      for (const pdf of pdfs) {
        const diagram = await generatePaperDiagram(pdf);
        newDiagrams[pdf.name] = diagram;
      }
      setDiagrams(newDiagrams);
    } catch (err: any) {
      setError("Failed to generate some diagrams.");
    } finally {
      setGeneratingDiagrams(false);
    }
  };

  const handleMergePapers = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await generateMergedSynthesis(goal, pdfs, synthesisMap);
      setMergedSynthesis(result);
      setPhase(2);
    } catch (err: any) {
      console.error(err);
      setError("Failed to fuse papers. Ensure you have a stable connection and valid PDFs.");
    } finally {
      setLoading(false);
    }
  };

  const handleProofSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await generateFormalProof(goal, pdfs, mergedSynthesis);
      setFormalProof(result);
      setPhase(3);
    } catch (err: any) {
      setError(err.message || "Failed to generate Formal Proof.");
    } finally {
      setLoading(false);
    }
  };

  const exportToPdf = async () => {
    if (!mergedPaperRef.current) return;
    setLoading(true);
    try {
      const canvas = await html2canvas(mergedPaperRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0a0a0a'
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('merged-research-synthesis.pdf');
    } catch (err) {
      setError("Failed to export PDF.");
    } finally {
      setLoading(false);
    }
  };

  const handlePhase4Submit = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await generateExperimentFactory(goal, pdfs, synthesisMap, mergedSynthesis);
      setExperimentFactory(result);
      setPhase(4);
    } catch (err: any) {
      setError(err.message || "Failed to generate Experiment Factory.");
    } finally {
      setLoading(false);
    }
  };

  const resetApp = () => {
    setPhase(0);
    setGoal('');
    setPdfs([]);
    setSynthesisMap('');
    setDiagrams({});
    setExperimentFactory('');
    setMergedSynthesis('');
    setFormalProof('');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200 font-sans selection:bg-emerald-500/30">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
              <FlaskConical className="w-4 h-4 text-emerald-400" />
            </div>
            <h1 className="font-mono text-sm font-semibold tracking-widest text-emerald-400 uppercase">
              The Vibe-Research Engine
            </h1>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
            <span className={phase >= 1 ? "text-emerald-400" : ""}>01. SYNTHESIS</span>
            <span className="opacity-50">/</span>
            <span className={phase >= 2 ? "text-emerald-400" : ""}>02. FUSION</span>
            <span className="opacity-50">/</span>
            <span className={phase >= 3 ? "text-emerald-400" : ""}>03. PROOF</span>
            <span className="opacity-50">/</span>
            <span className={phase >= 4 ? "text-emerald-400" : ""}>04. EXPERIMENT</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400"
            >
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </motion.div>
          )}

          {phase === 0 && (
            <motion.div
              key="phase0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="space-y-2">
                <h2 className="text-3xl font-semibold tracking-tight text-white">Initialize Research Protocol</h2>
                <p className="text-slate-400">Upload 2-3 foundational papers and define your core objective.</p>
              </div>

              <form onSubmit={handlePhase1Submit} className="space-y-8">
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-slate-300">
                    Research Goal
                  </label>
                  <textarea
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder="e.g., I want to find a way to optimize attention mechanisms in transformers for long-context windows without quadratic scaling..."
                    className="w-full h-32 bg-slate-900/50 border border-white/10 rounded-xl p-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
                  />
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-medium text-slate-300">
                    Foundational Literature (PDFs)
                  </label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-colors"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept=".pdf"
                      multiple
                      className="hidden"
                    />
                    <Upload className="w-8 h-8 text-slate-500 mx-auto mb-4" />
                    <p className="text-slate-400">Click to upload PDFs (Max 3)</p>
                    <p className="text-xs text-slate-600 mt-2">PDF files are processed locally then sent to Gemini</p>
                  </div>

                  {pdfs.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {pdfs.map((pdf, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg">
                          <FileText className="w-4 h-4 text-emerald-400" />
                          <span className="text-xs text-slate-300 truncate">{pdf.name}</span>
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPdfs(pdfs.filter((_, i) => i !== idx));
                            }}
                            className="ml-auto text-slate-500 hover:text-red-400"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !goal.trim() || pdfs.length === 0}
                  className="w-full py-4 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                  START SYNTHESIS
                </button>
              </form>
            </motion.div>
          )}

          {phase === 1 && (
            <motion.div
              key="phase1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="text-2xl font-semibold text-white">Synthesis Map</h2>
                  <p className="text-sm text-slate-400 font-mono">PHASE 01: EXTRACTION</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={handleGenerateDiagrams}
                    disabled={generatingDiagrams}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-mono hover:bg-white/10 transition-colors flex items-center gap-2"
                  >
                    {generatingDiagrams ? <Loader2 className="w-3 h-3 animate-spin" /> : <Layout className="w-3 h-3" />}
                    GENERATE DIAGRAMS
                  </button>
                  <button 
                    onClick={handleMergePapers}
                    disabled={loading}
                    className="px-4 py-2 bg-emerald-500 text-black rounded-lg text-xs font-bold hover:bg-emerald-400 transition-colors flex items-center gap-2"
                  >
                    {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <GitMerge className="w-3 h-3" />}
                    FUSE RESEARCH
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-8">
                <div className="space-y-8">
                  <div className="prose prose-invert max-w-none bg-white/5 p-8 rounded-3xl border border-white/10">
                    <MarkdownRenderer content={synthesisMap} />
                  </div>

                  {Object.keys(diagrams).length > 0 && (
                    <div className="space-y-6 pt-8 border-t border-white/10">
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Layout className="w-5 h-5 text-emerald-400" />
                        Paper Architectures
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {Object.entries(diagrams).map(([name, chart]) => (
                          <div key={name} className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
                            <h4 className="text-sm font-mono text-emerald-400 flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              {name}
                            </h4>
                            <Mermaid chart={chart} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {phase === 2 && (
            <motion.div
              key="phase2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="text-2xl font-semibold text-white">Fusion: Merged Research Synthesis</h2>
                  <p className="text-sm text-slate-400 font-mono">PHASE 02: UNIFICATION</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={exportToPdf}
                    disabled={loading}
                    className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-xs font-mono hover:bg-white/20 transition-colors flex items-center gap-2"
                  >
                    <Download className="w-3 h-3" />
                    EXPORT PDF
                  </button>
                  <button 
                    onClick={handleProofSubmit}
                    disabled={loading}
                    className="px-4 py-2 bg-emerald-500 text-black rounded-lg text-xs font-bold hover:bg-emerald-400 transition-colors flex items-center gap-2"
                  >
                    {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <ShieldCheck className="w-3 h-3" />}
                    FORMAL PROOF
                  </button>
                </div>
              </div>

              <div ref={mergedPaperRef} className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 lg:p-12 shadow-2xl">
                <div className="prose prose-invert max-w-none">
                  <MarkdownRenderer content={mergedSynthesis} />
                </div>
                {Object.keys(diagrams).length > 0 && (
                  <div className="mt-12 pt-12 border-t border-white/10 space-y-8">
                    <h3 className="text-xl font-semibold text-white">Appendix: Source Architectures</h3>
                    <div className="grid grid-cols-1 gap-8">
                      {Object.entries(diagrams).map(([name, chart]) => (
                        <div key={name} className="space-y-4">
                          <h4 className="text-sm font-mono text-emerald-400">{name}</h4>
                          <Mermaid chart={chart} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {phase === 3 && (
            <motion.div
              key="phase3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="text-2xl font-semibold text-white">Formal Proof & Verification</h2>
                  <p className="text-sm text-slate-400 font-mono">PHASE 03: RIGOR</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={handlePhase4Submit}
                    disabled={loading}
                    className="px-4 py-2 bg-emerald-500 text-black rounded-lg text-xs font-bold hover:bg-emerald-400 transition-colors flex items-center gap-2"
                  >
                    {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <ArrowRight className="w-3 h-3" />}
                    GENERATE EXPERIMENT
                  </button>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 lg:p-12">
                <div className="prose prose-invert max-w-none">
                  <MarkdownRenderer content={formalProof} />
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setPhase(2)}
                  className="px-8 py-4 border border-white/10 rounded-xl hover:bg-white/5 transition-colors text-slate-400 font-mono text-sm"
                >
                  BACK TO FUSION
                </button>
              </div>
            </motion.div>
          )}

          {phase === 4 && (
            <motion.div
              key="phase4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-12"
            >
              <div className="space-y-1">
                <h2 className="text-2xl font-semibold text-white">Experiment Factory</h2>
                <p className="text-sm text-slate-400 font-mono">PHASE 04: VALIDATION</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 lg:p-12">
                <div className="prose prose-invert max-w-none">
                  <MarkdownRenderer content={experimentFactory} />
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setPhase(3)}
                  className="px-8 py-4 border border-white/10 rounded-xl hover:bg-white/5 transition-colors text-slate-400 font-mono text-sm"
                >
                  BACK TO PROOF
                </button>
                <button
                  onClick={resetApp}
                  className="px-8 py-4 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-all text-sm"
                >
                  NEW RESEARCH PROTOCOL
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
