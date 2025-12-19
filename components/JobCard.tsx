
import React from 'react';
import { Job } from '../types';

interface JobCardProps {
  job: Job;
  onApply?: (jobId: string) => void;
  onViewDetails?: (jobId: string) => void;
  isApplied?: boolean;
}

const JobCard: React.FC<JobCardProps> = ({ job, onApply, onViewDetails, isApplied }) => {
  return (
    <div className="bg-white rounded-[1.5rem] border border-slate-200 p-6 hover:shadow-xl transition-all hover:-translate-y-1 group relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4">
        <span className="text-xs font-bold text-slate-300 bg-slate-50 px-2 py-1 rounded">
          {job.domain}
        </span>
      </div>
      
      <div className="flex items-start gap-5 mb-6">
        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
           {job.company.logo || '🏢'}
        </div>
        <div>
          <h3 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">
            {job.title}
          </h3>
          <p className="text-sm font-semibold text-slate-600 mt-1">{job.company.name}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-y-2 gap-x-4 mb-6">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
           <span>💼</span> {job.experience}
        </div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
           <span>💰</span> {job.salaryRange}
        </div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
           <span>📍</span> {job.company.location}
        </div>
      </div>

      <p className="text-sm text-slate-500 line-clamp-2 mb-6 leading-relaxed italic">
        "{job.description}"
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        {job.requiredSkills.slice(0, 3).map((skill, idx) => (
          <span key={idx} className="bg-blue-50 text-blue-600 text-[10px] font-black uppercase px-2 py-1 rounded-md tracking-wider">
            {skill}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between pt-5 border-t border-slate-50">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
           Posted {job.postedAt}
        </span>
        <button 
          disabled={isApplied}
          onClick={() => onApply && onApply(job.id)}
          className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${
            isApplied 
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
            : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-blue-200'
          }`}
        >
          {isApplied ? 'Already Applied' : 'Apply Now'}
        </button>
      </div>
    </div>
  );
};

export default JobCard;
