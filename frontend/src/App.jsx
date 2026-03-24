import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './index.css';

function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [expectedBrand, setExpectedBrand] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const fetchHistory = useCallback(async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await axios.get(`${apiUrl}/history`);
      if (response.data.success) {
        setHistory(response.data.history);
      }
    } catch (err) {
      console.error('Failed to fetch history:', err);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setResult(null);
      setError(null);
    }
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
        fetchHistory(); // Refresh history after successful scan
      } else {
        setError(response.data.message || 'Analysis failed.');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Error connecting to the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans selection:bg-indigo-500/30">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold shadow-lg shadow-indigo-500/20">
            V
          </div>
          <h1 className="text-xl font-bold tracking-tight">Fake Brand Detector</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-10 mb-16">
          {/* Left Column: Upload Form */}
          <div>
            <h2 className="text-3xl font-bold mb-2">Verify Product Authenticity</h2>
            <p className="text-gray-400 mb-8">
              Upload an image of the product and enter the expected brand. Our vision AI will scan logos and text to determine if it's genuine.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6 bg-gray-900/40 p-6 rounded-2xl border border-gray-800">
              
              {/* Brand Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Expected Brand</label>
                <input
                  type="text"
                  placeholder="e.g. Nike, Adidas, Gucci"
                  value={expectedBrand}
                  onChange={(e) => setExpectedBrand(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  required
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Product Image</label>
                <div 
                  className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center hover:bg-gray-800/50 hover:border-gray-500 transition-all cursor-pointer relative"
                  onClick={() => document.getElementById('file-upload').click()}
                >
                  {preview ? (
                    <div className="relative rounded-lg overflow-hidden flex justify-center bg-black/50">
                      <img src={preview} alt="Upload preview" className="max-h-48 object-contain" />
                    </div>
                  ) : (
                    <div className="py-6">
                      <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-gray-300 font-medium">Click to upload image</p>
                      <p className="text-gray-500 text-sm mt-1">JPG, PNG</p>
                    </div>
                  )}
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !file || !expectedBrand.trim()}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing Product...
                  </>
                ) : (
                  'Run AI Scan'
                )}
              </button>
              
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}
            </form>
          </div>

          {/* Right Column: Results */}
          <div>
            <div className="sticky top-24">
              {result ? (
                <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                  {/* Status Header */}
                  <div className={`p-4 rounded-xl mb-6 flex items-center gap-4 ${
                    result.status === 'genuine' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' :
                    result.status === 'fake' ? 'bg-red-500/10 border border-red-500/20 text-red-400' :
                    'bg-yellow-500/10 border border-yellow-500/20 text-yellow-400'
                  }`}>
                    <div className="text-3xl">
                      {result.status === 'genuine' ? '✓' : result.status === 'fake' ? '×' : '!'}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg capitalize">{result.status} Product</h3>
                      <p className="text-sm opacity-80">{result.confidence.toFixed(1)}% Confidence Score</p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-gray-800">
                      <span className="text-gray-400">Expected Brand</span>
                      <span className="font-medium text-white">{result.expected_brand}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-800">
                      <span className="text-gray-400">Detected Brand</span>
                      <span className="font-medium text-white">{result.detected_brand}</span>
                    </div>
                  </div>

                  {/* Raw AI Data */}
                  <div className="mt-8 pt-6 border-t border-gray-800">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">Raw Vision AI Data</h4>
                    
                    <div className="mb-4">
                      <span className="text-xs text-gray-400 mb-1 block">Detected Logos:</span>
                      <div className="flex flex-wrap gap-2">
                        {result.raw_data?.detected_logos?.length > 0 ? (
                          result.raw_data.detected_logos.map((logo, i) => (
                            <span key={i} className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-300 border border-gray-700">{logo}</span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-600 italic">No logos detected</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="text-xs text-gray-400 mb-1 block">Detected Text (OCR):</span>
                      <div className="bg-gray-950 border border-gray-800 rounded p-3 text-xs text-gray-400 max-h-32 overflow-y-auto whitespace-pre-wrap">
                        {result.raw_data?.detected_text || <span className="italic text-gray-600">No text detected</span>}
                      </div>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="h-full min-h-[400px] border border-gray-800 border-dashed rounded-2xl flex flex-col items-center justify-center text-gray-500 bg-gray-900/10 p-10 text-center">
                  <svg className="w-16 h-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <h3 className="text-xl font-medium text-gray-300 mb-2">Awaiting Image</h3>
                  <p className="text-sm">Upload a product image and run the scan to see the comprehensive AI analysis report here.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scan History Table */}
        <section className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Recent Scans</h2>
            <button 
              onClick={fetchHistory}
              className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg transition-colors border border-gray-700"
            >
              Refresh
            </button>
          </div>

          <div className="bg-gray-900/40 border border-gray-800 rounded-2xl overflow-hidden">
            {loadingHistory ? (
              <div className="p-12 text-center text-gray-500">Loading history...</div>
            ) : history.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-900/80 border-b border-gray-800 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      <th className="px-6 py-4">Image</th>
                      <th className="px-6 py-4">Expected</th>
                      <th className="px-6 py-4">Detected</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Confidence</th>
                      <th className="px-6 py-4 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {history.map((scan) => {
                      const apiUrl = import.meta.env.VITE_API_URL || '';
                      return (
                        <tr key={scan.id} className="hover:bg-gray-800/30 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="w-12 h-12 rounded bg-gray-950 border border-gray-800 overflow-hidden flex items-center justify-center">
                              {/* In Production, VITE_API_URL points to backend; scan.image_path starts with /uploads/ */}
                              <img src={`${apiUrl}${scan.image_path}`} alt="Scan" className="w-full h-full object-cover" />
                            </div>
                          </td>
                          <td className="px-6 py-4 font-medium">{scan.expected_brand}</td>
                          <td className="px-6 py-4 text-gray-400">{scan.detected_brand}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${
                              scan.status === 'genuine' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                              scan.status === 'fake' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                              'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                            }`}>
                              {scan.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-mono text-sm">{scan.confidence.toFixed(1)}%</td>
                          <td className="px-6 py-4 text-right text-xs text-gray-500">
                            {new Date(scan.timestamp).toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-gray-500 border border-dashed border-gray-800 rounded-2xl m-4">
                No scan history found. Start by uploading an image!
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
