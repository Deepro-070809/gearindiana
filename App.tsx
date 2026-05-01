/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Car, 
  Bike, 
  User, 
  Mail, 
  MapPin, 
  ArrowRight, 
  Star, 
  CheckCircle2, 
  XCircle, 
  Info,
  Scale,
  X,
  Loader2,
  ChevronRight,
  TrendingUp,
  Award,
  Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { researchAuto, compareAutos, type AutoSpec } from './lib/gemini';
import ChatBot from './components/ChatBot';

interface UserInfo {
  name: string;
  email: string;
  state: string;
  onboarded: boolean;
}

export default function App() {
  const [userInfo, setUserInfo] = useState<UserInfo>(() => {
    const saved = localStorage.getItem('autovahaan_user');
    return saved ? JSON.parse(saved) : { name: '', email: '', state: '', onboarded: false };
  });

  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<AutoSpec | null>(null);
  const [comparisonList, setComparisonList] = useState<AutoSpec[]>([]);
  const [isComparing, setIsComparing] = useState(false);
  const [comparisonText, setComparisonText] = useState('');
  const [loadingComparison, setLoadingComparison] = useState(false);

  useEffect(() => {
    if (userInfo.onboarded) {
      localStorage.setItem('autovahaan_user', JSON.stringify(userInfo));
    }
  }, [userInfo]);

  const handleOnboard = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInfo.name && userInfo.email && userInfo.state) {
      setUserInfo(prev => ({ ...prev, onboarded: true }));
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    const data = await researchAuto(query);
    setIsSearching(false);
    
    if (data) {
      setResult(data);
      // Scroll to result
      window.scrollTo({ top: 600, behavior: 'smooth' });
    }
  };

  const addToComparison = (vehicle: AutoSpec) => {
    if (comparisonList.find(v => v.name === vehicle.name)) return;
    if (comparisonList.length >= 2) {
      alert("Maximum 2 models for deep comparison tray.");
      return;
    }
    setComparisonList(prev => [...prev, vehicle]);
  };

  const removeFromComparison = (name: string) => {
    setComparisonList(prev => prev.filter(v => v.name !== name));
  };

  const handleCompare = async () => {
    if (comparisonList.length < 2) return;
    setIsComparing(true);
    setLoadingComparison(true);
    const text = await compareAutos(comparisonList.map(v => v.name));
    setComparisonText(text);
    setLoadingComparison(false);
  };

  if (!userInfo.onboarded) {
    return (
      <div id="onboarding" className="min-h-screen bg-bg-dark flex items-center justify-center p-4 font-sans selection:bg-accent selection:text-bg-dark">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-card-bg rounded-lg shadow-2xl p-12 border border-border"
        >
          <div className="mb-12">
            <h1 className="text-3xl font-light tracking-tighter text-text-primary m-0">
              GEAR<span className="text-accent font-bold">INDIANA</span>
            </h1>
            <p className="text-text-secondary mt-2 text-sm">The premium portal for automotive research.</p>
          </div>

          <form onSubmit={handleOnboard} className="space-y-6">
            <div className="input-group">
              <label className="block text-[10px] uppercase tracking-widest text-text-secondary mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary w-4 h-4" />
                <input 
                  required
                  type="text" 
                  placeholder="e.g. Arjun Mehta"
                  className="w-full pl-12 pr-4 py-4 bg-black border border-border rounded text-sm text-text-primary focus:border-accent transition-all outline-none"
                  value={userInfo.name}
                  onChange={e => setUserInfo(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
            </div>

            <div className="input-group">
              <label className="block text-[10px] uppercase tracking-widest text-text-secondary mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary w-4 h-4" />
                <input 
                  required
                  type="email" 
                  placeholder="arjun@example.com"
                  className="w-full pl-12 pr-4 py-4 bg-black border border-border rounded text-sm text-text-primary focus:border-accent transition-all outline-none"
                  value={userInfo.email}
                  onChange={e => setUserInfo(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
            </div>

            <div className="input-group">
              <label className="block text-[10px] uppercase tracking-widest text-text-secondary mb-2">State / Territory</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary w-4 h-4" />
                <select 
                  required
                  className="w-full pl-12 pr-4 py-4 bg-black border border-border rounded text-sm text-text-primary focus:border-accent transition-all outline-none appearance-none"
                  value={userInfo.state}
                  onChange={e => setUserInfo(prev => ({ ...prev, state: e.target.value }))}
                >
                  <option value="">Select your region</option>
                  {[
                    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 
                    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 
                    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 
                    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 
                    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
                    'Delhi', 'Jammu & Kashmir', 'Ladakh'
                  ].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-4 bg-accent hover:opacity-90 text-bg-dark font-bold rounded text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 group"
            >
              Start Deep Research
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-[10px] text-zinc-600 mt-4 text-center">By continuing, you agree to our Terms of Service & Privacy Policy.</p>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-dark text-text-primary font-sans pb-20 selection:bg-accent selection:text-bg-dark">
      {/* Header */}
      <header className="bg-bg-dark border-b border-border sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-light tracking-tighter m-0">
              GEAR<span className="text-accent font-bold">INDIANA</span>
            </h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[9px] font-bold text-text-secondary uppercase tracking-[0.2em]">Regional Node</span>
              <span className="text-xs font-bold text-accent uppercase tracking-wider">{userInfo.state}</span>
            </div>
            <div className="h-10 w-10 rounded bg-white/5 flex items-center justify-center border border-border">
              <User className="w-4 h-4 text-accent" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pt-16">
        {/* Search Section */}
        <section className="mb-20">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-12">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="max-w-2xl"
            >
              <h3 className="text-[11px] text-accent uppercase tracking-[0.3em] font-bold mb-4">Intelligence Portal</h3>
              <h2 className="text-5xl font-light tracking-tighter leading-none">
                Research your next <br/>
                <span className="opacity-40 italic">premium acquisition.</span>
              </h2>
            </motion.div>
            <div className="text-right hidden md:block">
              <div className="text-6xl font-light opacity-5 tracking-tighter">EST. 2024</div>
            </div>
          </div>
          
          <div className="max-w-3xl">
            <form onSubmit={handleSearch} className="relative group">
              <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                {isSearching ? <Loader2 className="w-5 h-5 text-accent animate-spin" /> : <Search className="w-5 h-5 text-text-secondary group-focus-within:text-accent transition-colors" />}
              </div>
              <input 
                type="text" 
                placeholder="Search premium models (e.g. BMW M340i, Thar Roxx)" 
                className="w-full pl-16 pr-44 py-6 bg-card-bg border border-border rounded-lg text-lg focus:border-accent transition-all outline-none shadow-2xl text-text-primary"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
              <button 
                disabled={isSearching}
                className="absolute right-4 top-1/2 -translate-y-1/2 px-8 py-3 bg-accent hover:opacity-90 text-bg-dark font-bold rounded uppercase text-[10px] tracking-widest transition-all disabled:opacity-50"
              >
                Execute
              </button>
            </form>
            <div className="flex flex-wrap gap-3 mt-6">
              <span className="text-[10px] text-zinc-600 uppercase tracking-widest mt-1.5">Trending Analysis:</span>
              {['Thar Roxx', 'Defender 110', 'Scorpio N', 'Safari Dark'].map(tag => (
                <button 
                  key={tag}
                  onClick={() => { setQuery(tag); }}
                  className="px-4 py-2 bg-white/5 border border-border rounded text-[10px] font-bold uppercase tracking-wider text-text-secondary hover:text-accent hover:border-accent transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Results Section */}
        <AnimatePresence mode="wait">
          {result && (
            <motion.div 
              key={result.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="bg-card-bg rounded shadow-2xl overflow-hidden border border-border"
            >
              {/* Visual Showcase */}
              <div className="relative h-[400px] bg-black group">
                <div className="absolute inset-0 bg-gradient-to-t from-bg-dark via-transparent to-transparent z-10" />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {result.category === 'car' ? (
                    <Car className="w-48 h-48 text-white/5 group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <Bike className="w-48 h-48 text-white/5 group-hover:scale-110 transition-transform duration-700" />
                  )}
                </div>
                <div className="absolute bottom-12 left-12 right-12 z-20">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-accent mb-4 block">Visual Profile</span>
                  <p className="text-xl font-light text-text-secondary max-w-2xl leading-relaxed italic">
                    "{result.imagePrompt}"
                  </p>
                </div>
                <div className="absolute top-8 right-8 z-20">
                  <div className="flex items-center gap-2 px-4 py-2 bg-accent text-bg-dark text-[10px] font-black uppercase tracking-widest rounded shadow-xl">
                    <Star className="w-3 h-3 fill-current" />
                    {result.expertRating} / 10 Expert Score
                  </div>
                </div>
              </div>

              {/* Result Header info */}
              <div className="p-12 pb-6 border-t border-border bg-bg-dark/50 flex flex-col md:flex-row justify-between items-start gap-8">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="px-3 py-1 bg-accent/10 border border-accent/20 rounded-full text-[10px] font-black text-accent uppercase tracking-widest">
                      {result.category}
                    </div>
                  </div>
                  <h3 className="text-6xl font-light tracking-tighter mb-2">{result.name}</h3>
                  <p className="text-2xl text-text-secondary font-light">{result.priceRange}</p>
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => addToComparison(result)}
                    className="flex items-center gap-3 px-10 py-5 bg-accent text-bg-dark rounded font-black text-[11px] uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-accent/10"
                  >
                    <Scale className="w-4 h-4" />
                    Add to Comparison Matrix
                  </button>
                </div>
              </div>

              {/* Main Content */}
              <div className="p-8 md:p-12 grid grid-cols-1 md:grid-cols-12 gap-16">
                {/* Specs */}
                <div className="md:col-span-12 lg:col-span-8 space-y-12">
                  <div>
                    <h4 className="text-[11px] font-black text-accent uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                       <div className="w-6 h-[1px] bg-accent" /> Core Specifications
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-y-10 gap-x-8">
                      {[
                        { label: 'Drive Unit', value: result.engine },
                        { label: 'Force Output', value: result.power },
                        { label: 'Energy Source', value: result.fuelType },
                        { label: 'Gearbox', value: result.transmission },
                        { label: 'Efficiency Rating', value: result.mileage },
                        { label: 'Expert Evaluation', value: `${result.expertRating} / 10` },
                      ].map(spec => (
                        <div key={spec.label} className="border-l border-border pl-6 group">
                          <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-2 group-hover:text-accent transition-colors">{spec.label}</p>
                          <p className="text-lg font-light text-text-primary">{spec.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[11px] font-black text-accent uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                      <div className="w-6 h-[1px] bg-accent" /> Premium Features
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      {result.features.map(f => (
                        <span key={f} className="px-5 py-3 bg-white/5 text-text-primary rounded text-[11px] font-bold border border-border flex items-center gap-3 hover:border-accent/50 transition-all">
                          <CheckCircle2 className="w-4 h-4 text-accent" /> {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Pros/Cons & Review */}
                <div className="md:col-span-12 lg:col-span-4 space-y-8">
                  <div className="p-8 bg-black/40 rounded border border-border">
                    <h4 className="text-[11px] font-black text-text-primary uppercase tracking-[0.2em] mb-6 block border-b border-border pb-4">Analysis Matrix</h4>
                    <div className="space-y-6">
                      <div className="space-y-4">
                        {result.pros.slice(0, 3).map(p => (
                          <div key={p} className="flex gap-4 text-text-secondary text-sm leading-tight group">
                            <TrendingUp className="w-4 h-4 shrink-0 text-accent group-hover:scale-110 transition-transform" /> 
                            <span className="group-hover:text-text-primary transition-colors">{p}</span>
                          </div>
                        ))}
                      </div>
                      <div className="h-[1px] bg-border" />
                      <div className="space-y-4">
                        {result.cons.slice(0, 3).map(c => (
                          <div key={c} className="flex gap-4 text-zinc-600 text-sm leading-tight group">
                            <XCircle className="w-4 h-4 shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" /> 
                            <span className="group-hover:text-text-secondary transition-colors">{c}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-8 bg-accent/5 border border-accent/20 rounded relative group overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Award className="w-12 h-12 text-accent" />
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                      <Star className="w-4 h-4 text-accent" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-accent">Synthesis Review</span>
                    </div>
                    <p className="text-sm leading-relaxed text-text-secondary italic">
                      "{result.userReviewSummary}"
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <section className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="p-8 rounded border border-border bg-card-bg border-dashed border-2 flex flex-col justify-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2">Live Registry</span>
              <div className="text-3xl font-light text-accent italic">1,240+ <span className="text-xs text-text-secondary uppercase tracking-widest not-italic">Models</span></div>
           </div>
           <div className="p-8 rounded border border-border bg-card-bg border-dashed border-2 flex flex-col justify-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2">Expert Feedback</span>
              <div className="text-3xl font-light text-accent italic">15.2k <span className="text-xs text-text-secondary uppercase tracking-widest not-italic">Analyses</span></div>
           </div>
           <div className="p-8 rounded border border-border bg-card-bg border-dashed border-2 flex flex-col justify-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2">Regional Coverage</span>
              <div className="text-3xl font-light text-accent italic">28 <span className="text-xs text-text-secondary uppercase tracking-widest not-italic">States</span></div>
           </div>
        </section>
      </main>

      {/* Comparison Drawer */}
      {comparisonList.length > 0 && (
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 p-8 z-40 bg-gradient-to-t from-bg-dark via-bg-dark/95 to-transparent pointer-events-none"
        >
          <div className="max-w-4xl mx-auto bg-card-bg rounded border border-border shadow-2xl p-6 flex items-center justify-between gap-6 pointer-events-auto backdrop-blur-xl">
            <div className="flex gap-6 items-center">
              <span className="text-white text-[10px] font-black uppercase tracking-[0.2em] hidden lg:block">Comparison Matrix</span>
              <div className="flex gap-4">
                {comparisonList.map(v => (
                  <div key={v.name} className="relative group">
                    <div className="px-4 py-3 bg-black border border-border rounded flex items-center gap-3 text-text-primary text-xs font-bold min-w-[140px]">
                      <div className="w-2 h-2 bg-accent rounded-full" />
                      {v.name}
                    </div>
                    <button 
                      onClick={() => removeFromComparison(v.name)}
                      className="absolute -top-2 -right-2 bg-bg-dark border border-border text-text-secondary p-1 rounded-full z-10 hover:text-accent transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {comparisonList.length < 2 && (
                  <div className="px-4 py-3 border border-dashed border-border rounded flex items-center gap-2 text-text-secondary text-xs uppercase tracking-widest min-w-[140px]">
                    <span className="opacity-40 tracking-normal">+ Slot Available</span>
                  </div>
                )}
              </div>
            </div>

            <button 
              disabled={comparisonList.length < 2 || loadingComparison}
              onClick={handleCompare}
              className="flex items-center gap-3 px-10 py-4 bg-accent hover:opacity-90 text-bg-dark font-black rounded uppercase text-[10px] tracking-widest transition-all disabled:opacity-30 disabled:grayscale"
            >
              {loadingComparison ? <Loader2 className="w-4 h-4 animate-spin" /> : <Scale className="w-4 h-4" />}
              Deep Cross-Check
            </button>
          </div>
        </motion.div>
      )}

      {/* Comparison Modal */}
      <AnimatePresence>
        {isComparing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsComparing(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-5xl bg-card-bg border border-border rounded shadow-2xl flex flex-col overflow-hidden max-h-[85vh]"
            >
              <div className="p-10 border-b border-border flex items-center justify-between">
                <div>
                  <h3 className="text-[11px] text-accent uppercase tracking-[0.3em] font-bold mb-2">Comparative Intelligence</h3>
                  <h2 className="text-3xl font-light tracking-tighter">High-Resolution Analysis</h2>
                </div>
                <button 
                  onClick={() => setIsComparing(false)}
                  className="p-3 hover:bg-white/5 border border-border rounded text-text-secondary hover:text-text-primary transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 bg-black/20">
                {loadingComparison ? (
                  <div className="flex flex-col items-center justify-center py-20 text-zinc-600">
                    <Loader2 className="w-12 h-12 animate-spin mb-6 text-accent" />
                    <p className="font-bold uppercase tracking-[0.2em] text-[11px]">Compiling multi-source data points...</p>
                  </div>
                ) : (
                  <div className="markdown-content font-sans text-text-secondary leading-relaxed max-w-4xl mx-auto">
                    {comparisonText}
                  </div>
                )}
              </div>

              <div className="p-8 bg-bg-dark border-t border-border flex justify-center">
                <button 
                  onClick={() => setIsComparing(false)}
                  className="px-12 py-4 bg-white/5 border border-border text-text-primary uppercase text-[10px] font-bold tracking-[0.2em] rounded hover:bg-white/10 transition-colors"
                >
                  Exit Analysis
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="mt-40 py-20 border-t border-border bg-black/20">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-2xl font-light tracking-tighter mb-4">
              GEAR<span className="text-accent font-bold">INDIANA</span>
            </h1>
            <p className="text-xs text-text-secondary max-w-md leading-relaxed uppercase tracking-widest opacity-60">
              Precision vehicle intelligence for the Indian market. Powered by Google AI proprietary analysis.
            </p>
          </div>
          <div className="text-left md:text-right">
            <span className="text-[10px] text-zinc-700 uppercase tracking-[0.4em] font-bold">Terminal Reference: GI-2024-SYS</span>
            <div className="mt-4 flex flex-wrap gap-4 md:justify-end text-[10px] font-bold text-text-secondary uppercase tracking-widest underline decoration-border underline-offset-4">
              <a href="#" className="hover:text-accent">Protocols</a>
              <a href="#" className="hover:text-accent">Encryption</a>
              <a href="#" className="hover:text-accent">Privacy</a>
            </div>
          </div>
        </div>
      </footer>

      {/* AI Assistant */}
      <ChatBot />
    </div>
  );
}
