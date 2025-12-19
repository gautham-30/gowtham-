
import React, { useState, useMemo, useEffect } from 'react';
import Layout from './components/Layout';
import JobCard from './components/JobCard';
import { ChatAndCall } from './components/ChatAndCall';
import { User, UserRole, Job, Application } from './types';
import { apiService } from './services/apiService';
import { 
  analyzeResumeAI, 
  getProfileTipsAI, 
  suggestMessageReplyAI, 
  getMapLinkAI, 
  generateEmailTemplateAI 
} from './services/geminiService';

const DOMAINS = ['All Domains', 'Engineering', 'Design', 'Marketing', 'Sales', 'HR', 'Finance', 'Legal'];

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('explore');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [apps, setApps] = useState<Application[]>([]);

  // Global Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [locQuery, setLocQuery] = useState('');
  const [domainFilter, setDomainFilter] = useState('All Domains');
  
  // UI Controls
  const [isBusy, setIsBusy] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isNewPostOpen, setIsNewPostOpen] = useState(false);
  const [isEmailOpen, setIsEmailOpen] = useState(false);
  const [activeComm, setActiveComm] = useState<{ name: string; mode: 'chat' | 'call' } | null>(null);

  // AI Content State
  const [emailContent, setEmailContent] = useState('');
  const [aiTips, setAiTips] = useState('');
  const [aiDraft, setAiDraft] = useState('');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  // Job Form State
  const [jobForm, setJobForm] = useState({ title: '', domain: 'Engineering', exp: '', sal: '', loc: '', desc: '', vac: 1 });

  // Initial Data Fetching from Simulated API
  useEffect(() => {
    fetchData();
  }, [currentUser]);

  const fetchData = async () => {
    if (!currentUser) return;
    setIsBusy(true);
    const fetchedJobs = await apiService.getJobs({ 
      domain: domainFilter, 
      search: searchQuery, 
      location: locQuery 
    });
    const fetchedApps = await apiService.getApplications(currentUser.id);
    setJobs(fetchedJobs);
    setApps(fetchedApps);
    setIsBusy(false);
  };

  // Re-fetch when filters change
  useEffect(() => {
    if (currentUser) fetchData();
  }, [domainFilter, searchQuery, locQuery]);

  const showToast = () => {
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
  };

  const handleLogin = async (role: UserRole) => {
    const email = role === UserRole.HR ? 'admin@nexus.ai' : 'arjun.dev@gmail.com';
    const user = await apiService.login(email, role);
    setCurrentUser(user);
    setActiveTab(role === UserRole.HR ? 'dashboard' : 'explore');
  };

  const handleApply = async (job: Job) => {
    if (!currentUser) return;
    setIsBusy(true);
    
    // AI Analysis Trigger
    const analysis = await analyzeResumeAI(
      currentUser.resumeText || "Profile skills: " + currentUser.skills?.join(", "), 
      job.title, 
      job.description
    );
    
    const newApp: Application = {
      id: `a_${Date.now()}`,
      jobId: job.id,
      candidateId: currentUser.id,
      candidateName: currentUser.name,
      status: 'pending',
      appliedAt: new Date().toISOString().split('T')[0],
      resumeUrl: 'profile_cv.pdf',
      atsScore: analysis.score,
      aiFeedback: analysis.feedback
    };
    
    await apiService.applyToJob(newApp);
    await fetchData();
    setIsBusy(false);
    showToast();
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsBusy(true);
    const newJob: Job = {
      id: `j_${Date.now()}`,
      title: jobForm.title,
      domain: jobForm.domain,
      company: { 
        name: 'NexusAI Global', 
        logo: '🔷', 
        industry: 'AI', 
        location: jobForm.loc 
      },
      description: jobForm.desc,
      requiredSkills: ['Role Specific Skills'],
      experience: jobForm.exp,
      salaryRange: jobForm.sal,
      totalVacancies: jobForm.vac,
      filledVacancies: 0,
      postedAt: 'Just now',
      joiningDetails: 'Negotiable'
    };
    await apiService.postJob(newJob);
    await fetchData();
    setIsNewPostOpen(false);
    setIsBusy(false);
    showToast();
  };

  const handleStatusChange = async (appId: string, status: Application['status']) => {
    setIsBusy(true);
    await apiService.updateApplicationStatus(appId, status);
    await fetchData();
    setIsBusy(false);
    showToast();
  };

  const handleGetTips = async () => {
    if (!currentUser) return;
    setIsBusy(true);
    const tips = await getProfileTipsAI(currentUser);
    setAiTips(tips);
    setIsBusy(false);
  };

  const handleSuggestReply = async (msg: string, role: string) => {
    setIsBusy(true);
    const draft = await suggestMessageReplyAI(msg, role);
    setAiDraft(draft);
    setIsBusy(false);
  };

  const handleSendEmail = async (app: Application, type: 'offer' | 'interview') => {
    setIsBusy(true);
    setSelectedApp(app);
    const job = jobs.find(j => j.id === app.jobId);
    const text = await generateEmailTemplateAI(type, app.candidateName, job?.title || 'Position');
    setEmailContent(text);
    setIsEmailOpen(true);
    setIsBusy(false);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <nav className="p-6 bg-white border-b flex justify-between items-center px-10 shadow-sm">
          <div className="text-3xl font-black text-[#275DF5] tracking-tighter">NexusHR <span className="text-slate-300 font-normal">AI</span></div>
          <div className="flex gap-6 items-center">
            <button onClick={() => handleLogin(UserRole.CANDIDATE)} className="font-bold text-slate-600 hover:text-blue-600 transition-colors">Find Your Job</button>
            <button onClick={() => handleLogin(UserRole.HR)} className="bg-[#275DF5] text-white px-8 py-3 rounded-full font-bold shadow-xl hover:bg-blue-700 transition-all">For Employers</button>
          </div>
        </nav>
        <main className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
          <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <h1 className="text-6xl md:text-8xl font-black text-slate-900 leading-[1.1]">India's #1 <span className="text-[#275DF5]">AI-First</span> Job Portal</h1>
            <p className="text-2xl text-slate-500 font-medium tracking-tight">2.5 Lakh+ Opportunities • Verified by Gemini AI • Real-time ATS</p>
            
            <div className="bg-white p-4 rounded-[4rem] shadow-[0_35px_60px_-15px_rgba(39,93,245,0.2)] flex flex-col md:flex-row w-full border border-slate-100 gap-2">
              <div className="flex-1 flex items-center px-8 gap-4">
                <span className="text-2xl">🔍</span>
                <input type="text" placeholder="Skills, Roles, or Companies" className="w-full py-6 outline-none text-slate-700 font-bold text-lg" />
              </div>
              <div className="hidden md:block w-px h-12 bg-slate-100 self-center"></div>
              <div className="flex-1 flex items-center px-8 gap-4">
                <span className="text-2xl">📍</span>
                <input type="text" placeholder="Location" className="w-full py-6 outline-none text-slate-700 font-bold text-lg" />
              </div>
              <button onClick={() => handleLogin(UserRole.CANDIDATE)} className="bg-[#275DF5] text-white px-16 py-6 rounded-full font-black text-xl hover:bg-blue-700 hover:scale-[1.02] transition-all active:scale-95 shadow-lg shadow-blue-200">Search</button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <Layout role={currentUser.role} userName={currentUser.name} activeTab={activeTab} setActiveTab={setActiveTab} onLogout={() => setCurrentUser(null)}>
      
      {isSuccess && (
        <div className="fixed top-10 right-10 bg-green-600 text-white px-8 py-4 rounded-3xl shadow-2xl z-[500] animate-bounce-short flex items-center gap-4">
          <span className="text-2xl font-bold">✓</span>
          <p className="font-bold text-lg tracking-tight">Nexus Cloud: Database Synced!</p>
        </div>
      )}

      {activeComm && (
        <ChatAndCall mode={activeComm.mode} targetName={activeComm.name} onClose={() => setActiveComm(null)} />
      )}

      {/* NEW POST MODAL */}
      {isNewPostOpen && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xl z-[400] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl border border-white/20">
            <div className="bg-[#275DF5] p-8 text-white flex justify-between items-center">
               <h3 className="text-3xl font-black italic">Post Requirement</h3>
               <button onClick={() => setIsNewPostOpen(false)} className="text-3xl opacity-50 hover:opacity-100">✕</button>
            </div>
            <form onSubmit={handleCreateJob} className="p-10 space-y-6">
               <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Role Title</label>
                    <input required value={jobForm.title} onChange={e => setJobForm({...jobForm, title: e.target.value})} className="w-full mt-2 px-6 py-4 bg-slate-50 rounded-2xl border-0 font-bold" />
                  </div>
                  <div>
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Experience Range</label>
                    <input required value={jobForm.exp} onChange={e => setJobForm({...jobForm, exp: e.target.value})} className="w-full mt-2 px-6 py-4 bg-slate-50 rounded-2xl border-0 font-bold" />
                  </div>
                  <div>
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Vacancies</label>
                    <input type="number" value={jobForm.vac} onChange={e => setJobForm({...jobForm, vac: parseInt(e.target.value)})} className="w-full mt-2 px-6 py-4 bg-slate-50 rounded-2xl border-0 font-bold" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Description</label>
                    <textarea value={jobForm.desc} onChange={e => setJobForm({...jobForm, desc: e.target.value})} className="w-full mt-2 px-6 py-4 bg-slate-50 rounded-2xl border-0 h-32 font-medium" />
                  </div>
               </div>
               <button type="submit" className="w-full bg-[#275DF5] text-white py-6 rounded-3xl font-black text-xl shadow-2xl">Publish Job</button>
            </form>
          </div>
        </div>
      )}

      {/* EMAIL EDITOR */}
      {isEmailOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[400] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-4xl overflow-hidden shadow-2xl">
            <div className="p-8 border-b bg-slate-50 flex justify-between items-center">
               <h3 className="text-2xl font-black">AI Comm Editor</h3>
               <button onClick={() => setIsEmailOpen(false)} className="text-2xl">✕</button>
            </div>
            <div className="p-10 space-y-6">
               <textarea 
                value={emailContent} 
                onChange={e => setEmailContent(e.target.value)}
                className="w-full h-[50vh] p-8 bg-slate-50 rounded-3xl border-0 font-mono text-sm outline-none focus:ring-4 focus:ring-blue-50"
               />
               <button onClick={() => {setIsEmailOpen(false); showToast();}} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg">Send Official Email</button>
            </div>
          </div>
        </div>
      )}

      {/* --- DASHBOARD VIEWS --- */}
      {currentUser.role === UserRole.HR ? (
        <div className="space-y-10 pb-24">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
             <div>
                <h2 className="text-4xl font-black text-slate-900">Talent Hub</h2>
                <p className="text-lg text-slate-500">Overseeing <span className="text-blue-600 font-bold">{jobs.length} Active Listings</span>.</p>
             </div>
             <button onClick={() => setIsNewPostOpen(true)} className="bg-[#275DF5] text-white px-12 py-5 rounded-[2rem] font-black text-lg shadow-xl">+ New Role</button>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
             <aside className="lg:col-span-1 space-y-8">
                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200">
                   <h3 className="font-bold text-slate-900 mb-8 uppercase text-[11px] tracking-widest text-slate-400">Database Filter</h3>
                   <div className="space-y-3">
                      {DOMAINS.map(d => (
                        <button key={d} onClick={() => setDomainFilter(d)} className={`w-full text-left px-5 py-3 rounded-2xl text-sm font-bold ${domainFilter === d ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-50'}`}>{d}</button>
                      ))}
                   </div>
                </div>
             </aside>

             <div className="lg:col-span-3 space-y-10">
                <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
                   <div className="p-10 border-b bg-slate-50 flex justify-between items-center">
                      <h3 className="text-2xl font-black italic">Candidate Resdex</h3>
                   </div>
                   <div className="divide-y divide-slate-100">
                      {apps.map(app => (
                        <div key={app.id} className="p-10 flex flex-col md:flex-row justify-between items-center gap-8 group">
                           <div className="flex items-center gap-8">
                              <div className="w-20 h-20 bg-blue-100 rounded-[2rem] flex items-center justify-center text-3xl font-black shadow-inner">{app.candidateName.charAt(0)}</div>
                              <div>
                                 <h4 className="text-2xl font-black text-slate-900">{app.candidateName}</h4>
                                 <p className="text-sm font-bold text-blue-600">Match Rank: #{Math.floor(Math.random() * 5 + 1)} | {app.atsScore}% Score</p>
                              </div>
                           </div>
                           <div className="flex gap-3">
                              <button onClick={() => setActiveComm({name: app.candidateName, mode: 'chat'})} className="p-4 bg-slate-100 rounded-2xl">💬</button>
                              <button onClick={() => handleSendEmail(app, 'interview')} className="px-6 py-3 bg-blue-50 text-blue-700 text-xs font-black rounded-2xl">Interview</button>
                              <button onClick={() => handleStatusChange(app.id, 'hired')} className="px-6 py-3 bg-[#275DF5] text-white text-xs font-black rounded-2xl shadow-lg shadow-blue-100">Hire</button>
                           </div>
                        </div>
                      ))}
                      {apps.length === 0 && <div className="p-20 text-center text-slate-400 italic font-bold text-xl">Database currently empty. Refreshing...</div>}
                   </div>
                </div>
             </div>
          </div>
        </div>
      ) : (
        <div className="space-y-10 pb-24">
          {activeTab === 'explore' && (
            <div className="space-y-10">
              <div className="bg-white rounded-[3.5rem] p-12 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-12">
                 <div className="w-28 h-28 bg-[#275DF5] rounded-[2.5rem] flex items-center justify-center text-white text-4xl font-black shadow-2xl">AS</div>
                 <div className="flex-1 text-center md:text-left">
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">Success is near, Arjun.</h2>
                    <p className="text-xl text-slate-500 font-medium mt-1">Recommended roles based on your <span className="text-blue-600 font-bold">AI Profile Analysis</span>.</p>
                 </div>
                 <button onClick={handleGetTips} className="bg-[#275DF5] text-white px-10 py-5 rounded-[2rem] font-black shadow-xl">Get AI Tips</button>
              </div>

              {aiTips && (
                <div className="p-8 bg-blue-50 border border-blue-100 rounded-[2rem] text-blue-900 italic font-medium">
                   <h4 className="font-black uppercase text-xs mb-4 tracking-widest">💡 Gemini AI Resume Optimization</h4>
                   {aiTips}
                </div>
              )}

              <div className="flex flex-col md:flex-row gap-6">
                 <div className="flex-[3] relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl opacity-40">🔍</span>
                    <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search Roles or Companies..." className="w-full pl-16 pr-8 py-6 bg-white rounded-[2rem] border border-slate-200 shadow-sm font-bold text-lg outline-none focus:ring-4 focus:ring-blue-50" />
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 {jobs.map(job => (
                   <JobCard key={job.id} job={job} onApply={() => handleApply(job)} isApplied={apps.some(a => a.jobId === job.id)} />
                 ))}
              </div>
            </div>
          )}

          {activeTab === 'my-apps' && (
            <div className="space-y-10">
              <h2 className="text-4xl font-black italic">My Career Log</h2>
              <div className="grid grid-cols-1 gap-8">
                {apps.map(app => {
                  const job = jobs.find(j => j.id === app.jobId);
                  return (
                    <div key={app.id} className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
                       <div className="flex justify-between items-center mb-8">
                          <h3 className="text-2xl font-black text-[#275DF5]">{job?.title}</h3>
                          <span className="px-6 py-2 bg-blue-100 text-blue-700 rounded-full text-xs font-black uppercase tracking-widest">{app.status}</span>
                       </div>
                       <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                          <p className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2">AI Summary</p>
                          <p className="text-lg font-medium italic text-slate-700">"{app.aiFeedback}"</p>
                       </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl h-[70vh] flex flex-col overflow-hidden">
               <div className="p-10 border-b bg-slate-50 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold">HR</div>
                     <h3 className="text-xl font-black">Nexus Recruitment Desk</h3>
                  </div>
                  <button onClick={() => handleSuggestReply("Would you like a call?", "Architect")} className="text-blue-600 font-black text-xs">✨ Draft AI Reply</button>
               </div>
               <div className="flex-1 p-10 space-y-6 overflow-y-auto bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')]">
                  <div className="max-w-[70%] bg-white p-6 rounded-3xl rounded-tl-none shadow-sm">
                     <p className="font-medium">"Hello Arjun, we reviewed your AI profile and would love to discuss the Architecture role. Monday at 4 PM?"</p>
                  </div>
                  {aiDraft && (
                    <div className="max-w-[70%] bg-blue-600 text-white p-6 rounded-3xl rounded-tr-none ml-auto shadow-xl">
                       <p className="text-xs opacity-70 mb-2 font-black uppercase">Suggested Draft</p>
                       <p className="font-bold">"{aiDraft}"</p>
                    </div>
                  )}
               </div>
               <div className="p-10 border-t bg-white flex gap-4">
                  <input type="text" placeholder="Type a message..." className="flex-1 px-8 py-5 bg-slate-50 rounded-[2rem] outline-none font-bold" />
                  <button className="bg-[#275DF5] text-white px-10 py-5 rounded-[2rem] font-black">Send</button>
               </div>
            </div>
          )}
        </div>
      )}

      {isBusy && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-xl z-[1000] flex flex-col items-center justify-center">
           <div className="w-20 h-20 border-8 border-[#275DF5] border-t-transparent rounded-full animate-spin"></div>
           <p className="mt-8 font-black text-[#275DF5] uppercase tracking-[0.4em] text-sm">Nexus Syncing Database...</p>
        </div>
      )}
    </Layout>
  );
};

export default App;
