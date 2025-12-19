
import { User, UserRole, Job, Application, Company } from '../types';

/**
 * NEXUS HR AI - BACKEND ARCHITECTURE (Simulated)
 * 
 * System Architecture:
 * - Client: React SPA with ESM
 * - API Layer: Service-based simulated REST API
 * - Storage: LocalStorage (Simulated PostgreSQL)
 * - AI: Google Gemini 3 (AI Studio)
 */

const STORAGE_KEYS = {
  USERS: 'nexus_users',
  JOBS: 'nexus_jobs',
  APPS: 'nexus_apps',
  COMPANIES: 'nexus_companies'
};

// Database Schema Initialization
const db = {
  get: (key: string) => JSON.parse(localStorage.getItem(key) || '[]'),
  save: (key: string, data: any) => localStorage.setItem(key, JSON.stringify(data))
};

export const apiService = {
  // --- AUTH ENDPOINTS ---
  login: async (email: string, role: UserRole): Promise<User> => {
    const users = db.get(STORAGE_KEYS.USERS);
    let user = users.find((u: User) => u.email === email && u.role === role);
    
    if (!user) {
      // Create default user if not exists for demo
      user = {
        id: role === UserRole.HR ? 'hr_admin' : 'cand_arjun',
        name: role === UserRole.HR ? 'Nexus HR Admin' : 'Arjun Sharma',
        email,
        role,
        designation: role === UserRole.HR ? 'Lead Recruiter' : 'Senior Full Stack Developer',
        location: 'Bangalore, India',
        experience: role === UserRole.CANDIDATE ? '6 Years' : undefined,
        skills: role === UserRole.CANDIDATE ? ['React', 'Node.js', 'PostgreSQL', 'System Design'] : undefined,
        resumeText: role === UserRole.CANDIDATE ? 'Highly skilled developer with expertise in scalable React apps and cloud architecture.' : undefined
      };
      db.save(STORAGE_KEYS.USERS, [...users, user]);
    }
    return user;
  },

  // --- JOB ENDPOINTS ---
  getJobs: async (filters?: { domain?: string, search?: string, location?: string }): Promise<Job[]> => {
    let jobs = db.get(STORAGE_KEYS.JOBS);
    if (jobs.length === 0) {
      // Seed initial data if empty
      jobs = [
        {
          id: 'j1',
          title: 'Senior Frontend Architect',
          domain: 'Engineering',
          company: { name: 'NexusAI Global', logo: '🔷', industry: 'AI', location: 'Bangalore, KA' },
          description: 'Build high-performance UIs using React and Gemini API.',
          requiredSkills: ['React', 'TS'],
          experience: '8-10 Years',
          salaryRange: '45-60 LPA',
          totalVacancies: 2,
          filledVacancies: 0,
          postedAt: '1 day ago',
          joiningDetails: 'Immediate'
        }
      ];
      db.save(STORAGE_KEYS.JOBS, jobs);
    }

    return jobs.filter((j: Job) => {
      const matchDomain = !filters?.domain || filters.domain === 'All Domains' || j.domain === filters.domain;
      const matchSearch = !filters?.search || j.title.toLowerCase().includes(filters.search.toLowerCase()) || j.company.name.toLowerCase().includes(filters.search.toLowerCase());
      const matchLoc = !filters?.location || j.company.location.toLowerCase().includes(filters.location.toLowerCase());
      return matchDomain && matchSearch && matchLoc;
    });
  },

  postJob: async (job: Job): Promise<Job> => {
    const jobs = db.get(STORAGE_KEYS.JOBS);
    const newJobs = [job, ...jobs];
    db.save(STORAGE_KEYS.JOBS, newJobs);
    return job;
  },

  // --- APPLICATION ENDPOINTS ---
  getApplications: async (hrId?: string): Promise<Application[]> => {
    // In a real DB, we'd filter applications by jobs belonging to the HR's company
    return db.get(STORAGE_KEYS.APPS);
  },

  applyToJob: async (app: Application): Promise<Application> => {
    const apps = db.get(STORAGE_KEYS.APPS);
    db.save(STORAGE_KEYS.APPS, [app, ...apps]);
    return app;
  },

  updateApplicationStatus: async (appId: string, status: Application['status']): Promise<void> => {
    const apps = db.get(STORAGE_KEYS.APPS);
    const updated = apps.map((a: Application) => a.id === appId ? { ...a, status } : a);
    db.save(STORAGE_KEYS.APPS, updated);
  }
};
