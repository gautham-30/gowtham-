
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

interface ChatAndCallProps {
  onClose: () => void;
  targetName: string;
  mode: 'chat' | 'call';
}

export const ChatAndCall: React.FC<ChatAndCallProps> = ({ onClose, targetName, mode }) => {
  const [isCalling, setIsCalling] = useState(mode === 'call');
  const [messages, setMessages] = useState<{ sender: 'me' | 'ai', text: string }[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLiveActive, setIsLiveActive] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);

  // Live API setup for Call mode
  useEffect(() => {
    if (mode === 'call') {
      startLiveSession();
    }
    return () => {
      // Cleanup audio/video
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, [mode]);

  const startLiveSession = async () => {
    try {
      setIsLiveActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;

      // In a real production app, we would use ai.live.connect here.
      // For this demo, we simulate the AI responding to voice.
      setMessages(prev => [...prev, { sender: 'ai', text: `[Call Started] Connected to ${targetName}. AI Assistant joined.` }]);
    } catch (err) {
      console.error("Live session failed", err);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;
    const newMsg = { sender: 'me' as const, text: inputText };
    setMessages(prev => [...prev, newMsg]);
    setInputText('');

    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { sender: 'ai' as const, text: `Hello! I am the NexusHR AI assistant. I've noted your message for ${targetName}.` }]);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[150] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-white/20">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xl">
              {targetName.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-slate-900">{targetName}</h3>
              <p className="text-xs text-green-500 font-bold flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Online
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setIsCalling(!isCalling)}
              className={`p-3 rounded-full transition-all ${isCalling ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}
            >
              {isCalling ? '📞 End Call' : '📹 Start Video Call'}
            </button>
            <button onClick={onClose} className="p-3 text-slate-400 hover:text-slate-900 bg-slate-100 rounded-full">✕</button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Main Chat/Video Area */}
          <div className="flex-1 flex flex-col relative bg-slate-50">
            {isCalling ? (
              <div className="absolute inset-0 bg-slate-900 flex items-center justify-center overflow-hidden">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4">
                  <button className="p-4 bg-white/20 backdrop-blur rounded-full text-white hover:bg-white/30">🎤</button>
                  <button onClick={() => setIsCalling(false)} className="p-4 bg-red-600 rounded-full text-white hover:bg-red-700 shadow-xl shadow-red-900/40">📵</button>
                  <button className="p-4 bg-white/20 backdrop-blur rounded-full text-white hover:bg-white/30">📷</button>
                </div>
                <div className="absolute top-6 right-6 w-48 h-32 bg-slate-800 rounded-2xl border-2 border-white/20 overflow-hidden">
                   <div className="w-full h-full flex items-center justify-center text-white text-xs opacity-50">Remote Feed...</div>
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] p-4 rounded-2xl shadow-sm text-sm ${
                        m.sender === 'me' 
                          ? 'bg-blue-600 text-white rounded-tr-none' 
                          : 'bg-white text-slate-700 rounded-tl-none border border-slate-200'
                      }`}>
                        {m.text}
                      </div>
                    </div>
                  ))}
                  {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50">
                       <span className="text-4xl mb-4">💬</span>
                       <p>Start a conversation with {targetName}</p>
                    </div>
                  )}
                </div>
                
                <div className="p-6 bg-white border-t border-slate-100">
                  <div className="flex gap-4">
                    <input 
                      type="text" 
                      value={inputText}
                      onChange={e => setInputText(e.target.value)}
                      onKeyPress={e => e.key === 'Enter' && sendMessage()}
                      placeholder="Type a message..." 
                      className="flex-1 px-6 py-4 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500"
                    />
                    <button 
                      onClick={sendMessage}
                      className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 shadow-lg"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Sidebar Info */}
          <div className="hidden lg:block w-72 border-l border-slate-100 p-6 bg-white">
            <h4 className="font-bold text-slate-900 mb-6 uppercase text-xs tracking-widest text-slate-400">Candidate Profile</h4>
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-4 border border-blue-100">👤</div>
                <h5 className="font-bold text-slate-900">{targetName}</h5>
                <p className="text-sm text-slate-400">Senior Frontend Engineer</p>
              </div>
              
              <div className="space-y-3">
                 <div className="flex justify-between text-xs">
                   <span className="text-slate-400 font-bold">Experience</span>
                   <span className="text-slate-900 font-bold">6 Years</span>
                 </div>
                 <div className="flex justify-between text-xs">
                   <span className="text-slate-400 font-bold">Location</span>
                   <span className="text-slate-900 font-bold">Remote</span>
                 </div>
                 <div className="flex justify-between text-xs">
                   <span className="text-slate-400 font-bold">ATS Score</span>
                   <span className="text-blue-600 font-black">92%</span>
                 </div>
              </div>

              <div className="pt-6 border-t border-slate-50">
                <h4 className="font-bold text-slate-900 mb-4 uppercase text-xs tracking-widest text-slate-400">AI Assistant</h4>
                <div className="bg-blue-50/50 p-4 rounded-2xl text-[11px] text-blue-700 leading-relaxed italic">
                  "I recommend asking about their experience with distributed design systems during the call."
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
