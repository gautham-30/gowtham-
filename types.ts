
export enum UserRole {
  HR = 'HR',
  CANDIDATE = 'CANDIDATE'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  location?: string;
  designation?: string;
  experience?: string;
  skills?: string[];
  resumeText?: string;
}

export interface Company {
  name: string;
  logo: string;
  industry: string;
  location: string;
}

export interface Job {
  id: string;
  title: string;
  domain: string;
  description: string;
  company: Company;
  requiredSkills: string[];
  experience: string;
  salaryRange: string;
  totalVacancies: number;
  filledVacancies: number;
  postedAt: string;
  joiningDetails: string;
}

export interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  candidateName: string;
  status: 'pending' | 'shortlisted' | 'rejected' | 'hired';
  appliedAt: string;
  resumeUrl: string;
  atsScore?: number;
  aiFeedback?: string;
}
