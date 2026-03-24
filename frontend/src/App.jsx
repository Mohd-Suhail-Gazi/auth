import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import './index.css';

// ---- ICONS ----
const IconUpload = () => (
  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
  </svg>
);
const IconShield = () => (
  <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
  </svg>
);
const IconScan = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75H6A2.25 2.25 0 003.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0120.25 6v1.5m0 9V18A2.25 2.25 0 0118 20.25h-1.5m-9 0H6A2.25 2.25 0 013.75 18v-1.5M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const IconInstagram = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
);
const IconTwitter = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

// ---- SCAN LOG MESSAGES ----
const SCAN_LOGS = [
  'Initiating neural pattern recognition...',
  'Loading brand fingerprint database...',
  'Analyzing logo geometry & vectors...',
  'Running OCR text extraction...',
  'Cross-referencing stitching patterns...',
  'Comparing material texture signatures...',
  'Validating hologram integrity...',
  'Authenticating brand DNA markers...',
  'Calculating confidence score...',
  'Generating authenticity report...',
];

function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [expectedBrand, setExpectedBrand] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [dragging, setDragging] = useState(false);
  const [scanLog, setScanLog] = useState('');
  const [scanLogIdx, setScanLogIdx] = useState(0);
  const fileInputRef = useRef(null);
  const scanIntervalRef = useRef(null);

  const fetchHistory = useCallback(async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await axios.get(`${apiUrl}/history`);
      if (response.data.success) setHistory(response.data.history);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  // Scan log animation
  useEffect(() => {
    if (loading) {
      setScanLog(SCAN_LOGS[0]);
      setScanLogIdx(0);
      let idx = 0;
      scanIntervalRef.current = setInterval(() => {
        idx = (idx + 1) % SCAN_LOGS.length;
        setScanLogIdx(idx);
        setScanLog(SCAN_LOGS[idx]);
      }, 900);
    } else {
      clearInterval(scanIntervalRef.current);
      setScanLog('');
    }
    return () => clearInterval(scanIntervalRef.current);
  }, [loading]);

  const handleFileChange = (selectedFile) => {
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult(null);
      setError(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type.startsWith('image/')) handleFileChange(dropped);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !expectedBrand.trim()) {
      setError('Please provide both an image and the expected brand.');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('expected_brand', expectedBrand.trim());
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await axios.post(`${apiUrl}/analyze`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.data.success) {
        setResult(response.data.data.analysis_result);
        fetchHistory();
      } else {
        setError(response.data.message || 'Analysis failed.');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Error connecting to the server.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    if (status === 'genuine') return 'status-genuine';
    if (status === 'fake') return 'status-fake';
    return 'status-suspicious';
  };
  const getStatusIcon = (status) => {
    if (status === 'genuine') return '✓';
    if (status === 'fake') return '✕';
    return '!';
  };

  return (
    <div className="min-h-screen text-white relative" style={{background:'#050508'}}>
      {/* Gradient Orbs */}
      <div className="orb-1" />
      <div className="orb-2" />
      <div className="orb-3" />

      {/* ---- HEADER ---- */}
      <header className="sticky top-0 z-50 glass border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:'linear-gradient(135deg,#7c3aed,#be185d)'}}>
              <div className="w-5 h-5 text-white"><IconShield /></div>
            </div>
            <span className="text-xl font-bold tracking-tight">
              Authen<span className="gradient-text">tix</span>
            </span>
            <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border live-badge" style={{color:'#a855f7',borderColor:'rgba(168,85,247,0.6)',background:'rgba(168,85,247,0.08)'}}>
              AI POWERED
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-white/50">
            <a href="#detect" className="hover:text-white transition-colors">Detect</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
            <a href="#history" className="hover:text-white transition-colors">History</a>
          </nav>
        </div>
      </header>

      {/* ---- HERO ---- */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm mb-8" style={{color:'rgba(168,85,247,0.9)'}}>
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
          Real-time fashion brand authentication
        </div>
        <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight mb-6">
          Is your drip
          <br />
          <span className="gradient-text">actually legit?</span>
        </h1>
        <p className="text-xl text-white/40 max-w-2xl mx-auto mb-10 leading-relaxed">
          Drop your product image. Our Vision AI scans logos, text & patterns to tell you if your fit is real or a rep — in seconds.
        </p>
        <div className="flex flex-wrap gap-4 justify-center text-sm text-white/30">
          <span>🏷️ 1,200+ brands supported</span>
          <span>⚡ Results in under 5s</span>
          <span>🔒 Private & secure</span>
        </div>
      </section>

      {/* ---- MAIN DETECT SECTION ---- */}
      <section id="detect" className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
        <div className="grid lg:grid-cols-2 gap-8">

          {/* Upload Form */}
          <div className="glass rounded-3xl p-8 hover-lift">
            <h2 className="text-2xl font-bold mb-1">Run AI Scan</h2>
            <p className="text-white/30 text-sm mb-8">Upload a product photo and enter the brand name.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Brand Input */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-white/40 mb-2">Expected Brand</label>
                <input
                  type="text"
                  id="brand-input"
                  placeholder="e.g. Nike, Gucci, Supreme..."
                  value={expectedBrand}
                  onChange={(e) => setExpectedBrand(e.target.value)}
                  className="w-full authentix-input rounded-xl px-4 py-3.5 text-white text-sm"
                  required
                />
              </div>

              {/* Drop Zone */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-white/40 mb-2">Product Image</label>
                <div
                  id="drop-zone"
                  className={`drop-zone rounded-2xl relative overflow-hidden ${dragging ? 'dragging' : ''}`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                >
                  {/* Scan Overlay */}
                  {loading && preview && (
                    <div className="scan-overlay scan-corners">
                      <div className="scan-line" />
                      <div className="text-center relative z-10 px-8">
                        <p className="text-xs font-mono text-purple-300 mb-3 opacity-80">{scanLog}</p>
                        <div className="scan-dots">
                          <div className="scan-dot" />
                          <div className="scan-dot" />
                          <div className="scan-dot" />
                        </div>
                      </div>
                    </div>
                  )}

                  {preview ? (
                    <div className="flex justify-center items-center bg-black/30 min-h-52">
                      <img src={preview} alt="Preview" className="max-h-52 object-contain" />
                    </div>
                  ) : (
                    <div className="py-14 text-center">
                      <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center mx-auto mb-4 text-white/30">
                        <IconUpload />
                      </div>
                      <p className="text-white/50 font-medium">Drag & drop or click to upload</p>
                      <p className="text-white/20 text-xs mt-1.5">JPG, PNG, WEBP up to 10MB</p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileChange(e.target.files[0])}
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                id="scan-btn"
                type="submit"
                disabled={loading || !file || !expectedBrand.trim()}
                className="w-full glow-btn text-white font-semibold py-4 rounded-xl disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-3 text-sm"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Scanning...
                  </>
                ) : (
                  <>
                    <IconScan />
                    Run AI Scan
                  </>
                )}
              </button>

              {error && (
                <div className="p-4 rounded-xl text-sm text-red-300 status-fake">
                  ⚠️ {error}
                </div>
              )}
            </form>
          </div>

          {/* Results Panel */}
          <div className="sticky top-24">
            {result ? (
              <div className={`glass rounded-3xl p-8 hover-lift ${getStatusClass(result.status)} border`}>
                {/* Status Header */}
                <div className="flex items-center gap-5 mb-8">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold ${getStatusClass(result.status)}`}>
                    {getStatusIcon(result.status)}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold capitalize">{result.status}</h3>
                    <p className="text-sm text-white/40">{result.confidence.toFixed(1)}% Confidence</p>
                  </div>
                </div>

                {/* Confidence Bar */}
                <div className="mb-8">
                  <div className="flex justify-between text-xs text-white/30 mb-2">
                    <span>Authenticity Score</span>
                    <span className="font-mono">{result.confidence.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${result.confidence}%`,
                        background: result.status === 'genuine'
                          ? 'linear-gradient(90deg,#10b981,#34d399)'
                          : result.status === 'fake'
                          ? 'linear-gradient(90deg,#ef4444,#f87171)'
                          : 'linear-gradient(90deg,#f59e0b,#fbbf24)'
                      }}
                    />
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-3 mb-8">
                  <div className="flex justify-between items-center py-3 border-b border-white/5">
                    <span className="text-sm text-white/40">Expected Brand</span>
                    <span className="text-sm font-semibold">{result.expected_brand}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-white/5">
                    <span className="text-sm text-white/40">Detected Brand</span>
                    <span className="text-sm font-semibold">{result.detected_brand}</span>
                  </div>
                </div>

                {/* Raw Data */}
                <div>
                  <p className="text-xs uppercase tracking-widest text-white/20 font-semibold mb-3">Vision AI Raw Data</p>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-white/30 mb-2">Detected Logos</p>
                      <div className="flex flex-wrap gap-2">
                        {result.raw_data?.detected_logos?.length > 0 ? (
                          result.raw_data.detected_logos.map((l, i) => (
                            <span key={i} className="px-3 py-1 rounded-full text-xs glass border-white/10" style={{border:'1px solid rgba(255,255,255,0.08)'}}>{l}</span>
                          ))
                        ) : (
                          <span className="text-xs text-white/20 italic">No logos detected</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-white/30 mb-2">Detected Text (OCR)</p>
                      <div className="glass rounded-xl p-3 text-xs text-white/40 font-mono max-h-24 overflow-y-auto whitespace-pre-wrap">
                        {result.raw_data?.detected_text || <span className="italic text-white/20">No text detected</span>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass rounded-3xl min-h-96 flex flex-col items-center justify-center text-center p-12">
                <div className="w-20 h-20 rounded-3xl glass flex items-center justify-center text-white/10 mb-6">
                  <div className="w-10 h-10"><IconShield /></div>
                </div>
                <h3 className="text-xl font-semibold text-white/30 mb-2">Awaiting Scan</h3>
                <p className="text-sm text-white/20 max-w-xs">Upload a product image, enter a brand name, and click "Run AI Scan" to see the result.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ---- HOW IT WORKS ---- */}
      <section id="how-it-works" className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{color:'rgba(168,85,247,0.7)'}}>The Process</p>
          <h2 className="text-4xl font-bold">How Authentix Works</h2>
          <p className="text-white/30 mt-3 max-w-xl mx-auto">Three simple steps powered by Google Vision AI to keep your wardrobe authentic.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              num: '01',
              title: 'Upload Your Product',
              desc: 'Snap a clear photo of the product — tags, logos, soles, packaging. The clearer the image, the higher the accuracy.',
              icon: '📸',
            },
            {
              num: '02',
              title: 'AI Scans & Analyzes',
              desc: 'Our Vision AI runs logo detection, OCR text extraction and brand pattern analysis simultaneously.',
              icon: '🤖',
            },
            {
              num: '03',
              title: 'Instant Verdict',
              desc: "Get a clear Genuine, Suspicious, or Fake verdict with a confidence score and full AI breakdown.",
              icon: '⚡',
            },
          ].map((step) => (
            <div key={step.num} className="glass rounded-3xl p-8 hover-lift">
              <div className="flex items-start gap-4 mb-5">
                <div className="step-num">{step.num}</div>
                <span className="text-3xl">{step.icon}</span>
              </div>
              <h3 className="text-lg font-bold mb-3">{step.title}</h3>
              <p className="text-sm text-white/40 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* Tips */}
        <div className="mt-8 glass rounded-3xl p-8">
          <h3 className="font-bold mb-5 flex items-center gap-2">
            <span>💡</span> Pro Tips for Best Results
          </h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: '☀️', tip: 'Use good lighting' },
              { icon: '🔍', tip: 'Focus on the logo tag' },
              { icon: '📐', tip: 'Shoot straight-on, no blur' },
              { icon: '🏷️', tip: 'Include the label & stitching' },
            ].map((t) => (
              <div key={t.tip} className="glass rounded-2xl p-4 flex items-center gap-3 text-sm">
                <span className="text-xl">{t.icon}</span>
                <span className="text-white/50">{t.tip}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- SCAN HISTORY ---- */}
      <section id="history" className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{color:'rgba(168,85,247,0.7)'}}>Database</p>
            <h2 className="text-3xl font-bold">Recent Scans</h2>
          </div>
          <button
            id="refresh-btn"
            onClick={fetchHistory}
            className="glass rounded-xl px-4 py-2 text-sm text-white/40 hover:text-white transition-colors border border-white/5 hover:border-purple-500/30"
          >
            ↻ Refresh
          </button>
        </div>

        <div className="glass rounded-3xl overflow-hidden">
          {loadingHistory ? (
            <div className="p-16 text-center text-white/20">Loading scan history...</div>
          ) : history.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5 text-xs font-semibold uppercase tracking-widest text-white/20">
                    <th className="px-6 py-5">Image</th>
                    <th className="px-6 py-5">Expected</th>
                    <th className="px-6 py-5">Detected</th>
                    <th className="px-6 py-5">Status</th>
                    <th className="px-6 py-5">Confidence</th>
                    <th className="px-6 py-5 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {history.map((scan) => {
                    const apiUrl = import.meta.env.VITE_API_URL || '';
                    return (
                      <tr key={scan.id} className="hover:bg-white/2 transition-colors">
                        <td className="px-6 py-4">
                          <div className="w-12 h-12 rounded-xl glass overflow-hidden flex items-center justify-center">
                            <img src={`${apiUrl}${scan.image_path}`} alt="Scan" className="w-full h-full object-cover" />
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-sm">{scan.expected_brand}</td>
                        <td className="px-6 py-4 text-sm text-white/40">{scan.detected_brand}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${getStatusClass(scan.status)}`}>
                            {scan.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-sm text-white/60">{scan.confidence.toFixed(1)}%</td>
                        <td className="px-6 py-4 text-right text-xs text-white/20">
                          {new Date(scan.timestamp).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-16 text-center text-white/20">
              <p className="text-4xl mb-4">🔍</p>
              <p>No scans yet. Start by uploading a product image!</p>
            </div>
          )}
        </div>
      </section>

      {/* ---- FOOTER ---- */}
      <footer className="relative z-10 glass border-t border-white/5 mt-8">
        <div className="footer-divider" />
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-10 mb-10">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:'linear-gradient(135deg,#7c3aed,#be185d)'}}>
                  <div className="w-5 h-5 text-white"><IconShield /></div>
                </div>
                <span className="text-xl font-bold">Authen<span className="gradient-text">tix</span></span>
              </div>
              <p className="text-sm text-white/30 leading-relaxed max-w-xs">
                AI-powered fashion authenticity verification. Don't get played — know if your drip is real.
              </p>
              <div className="flex gap-4 mt-6">
                {[IconTwitter, IconInstagram].map((Icon, i) => (
                  <a key={i} href="#" className="w-9 h-9 rounded-lg glass flex items-center justify-center text-white/30 hover:text-white hover:border-purple-500/30 transition-colors border border-white/5">
                    <Icon />
                  </a>
                ))}
              </div>
            </div>

            {/* Links */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/20 mb-4">Product</p>
              <ul className="space-y-3 text-sm text-white/40">
                {['How it Works', 'Scan History', 'Supported Brands', 'API Access'].map(l => (
                  <li key={l}><a href="#" className="hover:text-white transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/20 mb-4">Company</p>
              <ul className="space-y-3 text-sm text-white/40">
                {['About Us', 'Privacy Policy', 'Terms of Use', 'Contact'].map(l => (
                  <li key={l}><a href="#" className="hover:text-white transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
          </div>

          <div className="footer-divider mb-6" />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/20">
            <p>© 2026 Authentix. All rights reserved.</p>
            <p className="font-mono">Powered by Google Vision AI &nbsp;·&nbsp; Built for the culture</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
