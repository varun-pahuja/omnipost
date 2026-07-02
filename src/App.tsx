import { useState } from "react";
import { Copy, Instagram, Linkedin, Loader2, Sparkles, Twitter, Check, RefreshCw, LogIn, LogOut, History, PenLine, Paperclip, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useAuth } from "./contexts/AuthContext";
import { ChatbotWidget } from "./components/ChatbotWidget";

import { collection, addDoc, getDocs, query, where, orderBy, serverTimestamp } from "firebase/firestore";

import { db } from "./lib/firebase";

type PlatformData = {
  text: string;
  image: string | null;
};

type GenerateResponse = {
  linkedin: PlatformData;
  twitter: PlatformData;
  instagram: PlatformData;
};

export default function App() {
  const [idea, setIdea] = useState("");
  const [tone, setTone] = useState("professional");
  const [imageSize, setImageSize] = useState("1K");
  const [aspectRatio, setAspectRatio] = useState("Auto");
  
  const [loading, setLoading] = useState(false);
  const [regeneratingPlatform, setRegeneratingPlatform] = useState<string | null>(null);
  const [results, setResults] = useState<GenerateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"create" | "history">("create");
  const [historyDocs, setHistoryDocs] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [mediaFile, setMediaFile] = useState<{ data: string; type: string; url: string } | null>(null);
  
  const { user, signInWithGoogle, logout } = useAuth();


  const loadHistory = async () => {
    if (!user) return;
    setHistoryLoading(true);
    try {
      const q = query(
        collection(db, "posts"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const docs: any[] = [];
      querySnapshot.forEach((doc) => {
        docs.push({ id: doc.id, ...doc.data() });
      });
      setHistoryDocs(docs);
    } catch (err) {
      console.error("Error loading history:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleTabSwitch = (tab: "create" | "history") => {
    setActiveTab(tab);
    if (tab === "history" && user) {
      loadHistory();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setMediaFile({
          data: event.target?.result as string,
          type: file.type,
          url: URL.createObjectURL(file)
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea.trim() && !mediaFile) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          idea, 
          tone, 
          imageSize, 
          aspectRatio,
          mediaData: mediaFile?.data,
          mediaMimeType: mediaFile?.type
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Generation failed");
      }

      const data = await res.json();
      setResults(data);

      if (user) {
        try {
          await addDoc(collection(db, "posts"), {
            userId: user.uid,
            idea,
            tone,
            results: data,
            createdAt: serverTimestamp(),
          });
        } catch (dbErr) {
          console.error("Failed to save to history", dbErr);
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, platform: string) => {
    navigator.clipboard.writeText(text);
    setCopied(platform);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleRegenerate = async (platformId: keyof GenerateResponse) => {
    if (!idea.trim() || !results) return;

    setRegeneratingPlatform(platformId);
    setError(null);
    try {
      const res = await fetch("/api/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, tone, imageSize, aspectRatio, platform: platformId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Regeneration failed");
      }

      const data = await res.json();
      setResults(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          [platformId]: data
        };
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setRegeneratingPlatform(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#E5E5E5] font-sans selection:bg-accent-gold/30 selection:text-white">
      <header className="border-b border-white/10 sticky top-0 z-10 bg-[#0A0A0A]/90 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-end justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] tracking-[0.3em] uppercase opacity-50 mb-1">Intelligence Layer 04</span>
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-accent-gold" />
              <h1 className="text-3xl font-serif italic tracking-tight text-accent-gold">OmniPost</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex gap-4">
              <button 
                onClick={() => handleTabSwitch("create")}
                className={`text-[10px] uppercase tracking-widest font-bold transition-colors flex items-center gap-1.5 ${activeTab === "create" ? "text-accent-gold" : "text-[#E5E5E5]/50 hover:text-white"}`}
              >
                <PenLine className="w-3.5 h-3.5" />
                <span>Create</span>
              </button>
              <button 
                onClick={() => handleTabSwitch("history")}
                className={`text-[10px] uppercase tracking-widest font-bold transition-colors flex items-center gap-1.5 ${activeTab === "history" ? "text-accent-gold" : "text-[#E5E5E5]/50 hover:text-white"}`}
              >
                <History className="w-3.5 h-3.5" />
                <span>History</span>
              </button>
            </div>
            
            <div className="h-6 w-px bg-white/10" />

            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <img src={user.photoURL || ""} alt={user.displayName || "User"} className="w-6 h-6 rounded-full" />
                  <span className="text-[10px] tracking-widest uppercase opacity-70 hidden sm:block">{user.displayName}</span>
                </div>
                <button
                  onClick={logout}
                  className="text-[#E5E5E5]/50 hover:text-white transition-colors flex items-center gap-1.5"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold text-accent-gold bg-accent-gold/10 px-3 py-1.5 rounded hover:bg-accent-gold/20 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "create" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column - Inputs */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass rounded-xl p-6">
              <h2 className="text-[11px] uppercase tracking-wider opacity-40 mb-6">Content Intent & Parameters</h2>
              
              <form onSubmit={handleGenerate} className="space-y-6">
                <div className="flex flex-col space-y-3">
                  <label className="text-[11px] uppercase tracking-wider opacity-40">
                    What's your idea?
                  </label>
                  <div className="relative">
                    <textarea
                      value={idea}
                      onChange={(e) => setIdea(e.target.value)}
                      placeholder="Describe your idea or upload an image for inspiration..."
                      className="w-full glass rounded-lg px-4 py-4 pr-12 font-serif italic text-lg outline-none focus:border-accent-gold/50 transition-colors resize-none min-h-[120px]"
                    />
                    <label className="absolute bottom-4 right-4 cursor-pointer text-white/50 hover:text-accent-gold transition-colors">
                      <Paperclip className="w-5 h-5" />
                      <input type="file" accept="image/*, audio/*" className="hidden" onChange={handleFileChange} />
                    </label>
                  </div>
                  {mediaFile && (
                    <div className="flex items-center gap-2 mt-2 bg-white/5 p-2 rounded border border-white/10 w-fit relative pr-8">
                      {mediaFile.type.startsWith('image/') ? (
                        <img src={mediaFile.url} alt="upload preview" className="w-8 h-8 object-cover rounded" />
                      ) : (
                        <div className="w-8 h-8 flex items-center justify-center bg-black/20 rounded text-[10px] uppercase">Audio</div>
                      )}
                      <span className="text-xs truncate max-w-[150px] opacity-70">Media Attached</span>
                      <button type="button" onClick={() => setMediaFile(null)} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/50 hover:text-red-400">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex flex-col space-y-3">
                  <label className="text-[11px] uppercase tracking-wider opacity-40">
                    Voice & Resonance
                  </label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full glass rounded-lg px-4 py-3 text-sm outline-none focus:border-accent-gold/50 transition-colors appearance-none bg-[#0A0A0A] text-[#E5E5E5]"
                  >
                    <option value="professional">Professional & Authoritative</option>
                    <option value="witty">Witty & Engaging</option>
                    <option value="urgent">Urgent & Action-Oriented</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-3">
                    <label className="text-[11px] uppercase tracking-wider opacity-40">
                      Image Resolution
                    </label>
                    <select
                      value={imageSize}
                      onChange={(e) => setImageSize(e.target.value)}
                      className="w-full glass rounded-lg px-4 py-3 text-sm outline-none focus:border-accent-gold/50 transition-colors appearance-none bg-[#0A0A0A] text-[#E5E5E5]"
                    >
                      <option value="1K">1K</option>
                      <option value="2K">2K</option>
                      <option value="4K">4K</option>
                    </select>
                  </div>
                  <div className="flex flex-col space-y-3">
                    <label className="text-[11px] uppercase tracking-wider opacity-40">
                      Target Aspect
                    </label>
                    <select
                      value={aspectRatio}
                      onChange={(e) => setAspectRatio(e.target.value)}
                      className="w-full glass rounded-lg px-4 py-3 text-sm outline-none focus:border-accent-gold/50 transition-colors appearance-none bg-[#0A0A0A] text-[#E5E5E5]"
                    >
                      <option value="Auto">Auto (Optimal)</option>
                      <option value="1:1">1:1 (Square)</option>
                      <option value="4:3">4:3</option>
                      <option value="3:4">3:4</option>
                      <option value="16:9">16:9 (Landscape)</option>
                      <option value="9:16">9:16 (Portrait)</option>
                      <option value="3:2">3:2</option>
                      <option value="2:3">2:3</option>
                      <option value="21:9">21:9</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || (!idea.trim() && !mediaFile)}
                  className="w-full glass border-accent-gold bg-accent-gold/10 hover:bg-accent-gold/20 text-[#E5E5E5] font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-accent-gold" />
                      <span className="text-accent-gold tracking-widest uppercase text-[10px] font-bold">Synthesizing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-accent-gold" />
                      <span className="text-accent-gold tracking-widest uppercase text-[10px] font-bold">Generate Content</span>
                    </>
                  )}
                </button>

                {error && (
                  <div className="p-4 bg-red-900/20 text-red-400 text-sm rounded-lg border border-red-900/50">
                    {error}
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="lg:col-span-8">
            {!results && !loading && (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 glass border-dashed border-white/20 rounded-xl">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-white/20" />
                </div>
                <h3 className="text-lg font-serif italic text-[#E5E5E5] mb-2">Awaiting Input</h3>
                <p className="text-[11px] uppercase tracking-wider opacity-40 max-w-sm">
                  Provide a concept to initiate high-fidelity synthesis for all channels.
                </p>
              </div>
            )}

            {loading && (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-8 glass border-accent-gold/20 rounded-xl">
                <Loader2 className="w-12 h-12 text-accent-gold animate-spin mb-4" />
                <h3 className="text-lg font-serif italic text-accent-gold mb-2">Synthesizing...</h3>
                <p className="text-[11px] uppercase tracking-wider opacity-40 text-center max-w-sm">
                  Generating custom copy and rendering studio-quality images. Please hold.
                </p>
              </div>
            )}

            {results && !loading && (
              <div className="space-y-8">
                {/* LinkedIn Result */}
                <ResultCard
                  platform="LinkedIn"
                  icon={<Linkedin className="w-5 h-5 opacity-60" />}
                  data={results.linkedin}
                  copied={copied === "linkedin"}
                  onCopy={() => copyToClipboard(results.linkedin.text, "linkedin")}
                  isRegenerating={regeneratingPlatform === "linkedin"}
                  onRegenerate={() => handleRegenerate("linkedin")}
                />
                
                {/* Twitter Result */}
                <ResultCard
                  platform="Twitter / X"
                  icon={<Twitter className="w-5 h-5 opacity-60" />}
                  data={results.twitter}
                  copied={copied === "twitter"}
                  onCopy={() => copyToClipboard(results.twitter.text, "twitter")}
                  isRegenerating={regeneratingPlatform === "twitter"}
                  onRegenerate={() => handleRegenerate("twitter")}
                />

                {/* Instagram Result */}
                <ResultCard
                  platform="Instagram"
                  icon={<Instagram className="w-5 h-5 opacity-60" />}
                  data={results.instagram}
                  copied={copied === "instagram"}
                  onCopy={() => copyToClipboard(results.instagram.text, "instagram")}
                  isRegenerating={regeneratingPlatform === "instagram"}
                  onRegenerate={() => handleRegenerate("instagram")}
                />
              </div>
            )}
          </div>
        </div>
      ) : (
          <div className="glass rounded-xl p-8 min-h-[400px]">
            {user ? (
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-4">
                  <History className="w-6 h-6 text-accent-gold" />
                  <h2 className="text-xl font-serif italic text-accent-gold">Your Generation History</h2>
                </div>
                
                {historyLoading ? (
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <Loader2 className="w-8 h-8 text-accent-gold animate-spin mb-2" />
                    <span className="text-[10px] tracking-widest uppercase opacity-50">Loading history...</span>
                  </div>
                ) : historyDocs.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
                    <p className="text-sm">No history found. Generate some content first!</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {historyDocs.map((doc) => (
                      <div key={doc.id} className="border border-white/10 rounded-lg p-6 bg-black/20">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="text-[10px] tracking-widest uppercase opacity-50 mb-1">
                              {doc.createdAt?.toDate ? doc.createdAt.toDate().toLocaleString() : "Just now"}
                            </p>
                            <h3 className="font-serif italic text-lg opacity-90">{doc.idea}</h3>
                          </div>
                          <span className="text-[10px] tracking-widest uppercase bg-accent-gold/10 text-accent-gold px-2 py-1 rounded border border-accent-gold/20">
                            {doc.tone}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {["linkedin", "twitter", "instagram"].map((platform) => (
                            <div key={platform} className="glass p-4 rounded border border-white/5 flex flex-col justify-between">
                              <span className="text-[10px] tracking-widest uppercase opacity-50 mb-2 block">{platform}</span>
                              <div className="text-sm opacity-80 line-clamp-3 mb-3">
                                {doc.results[platform]?.text}
                              </div>
                              {doc.results[platform]?.image && (
                                <img src={doc.results[platform].image} alt="" className="w-full h-24 object-cover rounded" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center h-full flex flex-col items-center justify-center">
                <LogIn className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <h3 className="text-lg font-serif italic text-[#E5E5E5] mb-2">Sign in Required</h3>
                <p className="text-[11px] uppercase tracking-wider opacity-40 max-w-sm mb-6">
                  Sign in to view your generation history and saved posts.
                </p>
                <button
                  onClick={signInWithGoogle}
                  className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-accent-gold bg-accent-gold/10 px-4 py-2 rounded-lg hover:bg-accent-gold/20 transition-colors mx-auto"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In with Google</span>
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      <ChatbotWidget />
    </div>
  );
}

function ResultCard({
  platform,
  icon,
  data,
  copied,
  onCopy,
  isRegenerating,
  onRegenerate,
}: {
  platform: string;
  icon: React.ReactNode;
  data: PlatformData;
  copied: boolean;
  onCopy: () => void;
  isRegenerating: boolean;
  onRegenerate: () => void;
}) {
  return (
    <div className={`glass rounded-xl overflow-hidden flex flex-col transition-opacity ${isRegenerating ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          {icon}
          <span className="text-[10px] tracking-[0.2em] uppercase bg-white/5 px-2 py-1 rounded">
            {platform}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold text-accent-gold transition-opacity hover:opacity-80 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
            <span>Regenerate</span>
          </button>
          <button
            onClick={onCopy}
            className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold text-accent-gold transition-opacity hover:opacity-80"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>
      
      <div className="p-6 flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <div className="prose prose-sm prose-invert max-w-none font-serif italic opacity-90 leading-relaxed text-[#E5E5E5]">
            <ReactMarkdown>{data.text}</ReactMarkdown>
          </div>
        </div>
        
        {data.image && (
          <div className="md:w-[280px] shrink-0">
            <div className="rounded border border-white/5 overflow-hidden bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A]">
              <img
                src={data.image}
                alt={`${platform} generated graphic`}
                className="w-full h-auto object-cover opacity-90 hover:opacity-100 transition-opacity"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
