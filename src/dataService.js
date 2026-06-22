import { supabase } from './supabaseClient';

// Helper to check if Supabase is properly configured
const isSupabaseConfigured = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return !!(url && key && url !== 'https://your-project-id.supabase.co' && key !== 'your-anon-key');
};

const IS_REAL_DB = isSupabaseConfigured();

console.log(`[HireFlow] Running in ${IS_REAL_DB ? 'REAL SQL CLOUD' : 'MOCK LOCAL STORAGE'} mode.`);

// Seed initial data for local storage
const seedMockData = () => {
  if (!localStorage.getItem('hf_jobs')) {
    const defaultJobs = [
      {
        id: 'job-1',
        title: 'Frontend Developer Intern',
        department: 'Engineering',
        location: 'Hanoi, Vietnam (Hybrid)',
        type: 'Internship',
        salary_range: '5,000,000 - 8,000,000 VND',
        description: 'We are looking for a passionate Frontend Intern to build stunning UI components using React and modern CSS.',
        requirements: 'Basic understanding of HTML/CSS/JS. Familiarity with React is a plus. Eager to learn.',
        status: 'active',
        created_at: new Date().toISOString()
      },
      {
        id: 'job-2',
        title: 'Backend Engineer (Node.js/SQL)',
        department: 'Engineering',
        location: 'Ho Chi Minh City, Vietnam (Remote)',
        type: 'Full-time',
        salary_range: '15,000,000 - 25,000,000 VND',
        description: 'Join our core backend team to design database schemas, optimize SQL queries, and build robust API services.',
        requirements: 'Solid knowledge of JavaScript/TypeScript and SQL databases. Node.js experience of 1+ years.',
        status: 'active',
        created_at: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 'job-3',
        title: 'UI/UX Designer Intern',
        department: 'Product & Design',
        location: 'Hanoi, Vietnam (On-site)',
        type: 'Internship',
        salary_range: '4,000,000 - 6,000,000 VND',
        description: 'Collaborate with product managers and engineers to create beautiful mockups, user flows, and wireframes.',
        requirements: 'Proficiency in Figma. Strong portfolio demonstrating clean, grid-based layouts and color theory.',
        status: 'active',
        created_at: new Date(Date.now() - 172800000).toISOString()
      }
    ];
    localStorage.setItem('hf_jobs', JSON.stringify(defaultJobs));
  }

  if (!localStorage.getItem('hf_profiles')) {
    // Standard mock accounts
    const defaultProfiles = [
      { id: 'usr-1', email: 'candidate@hireflow.com', full_name: 'Nguyen Van A', role: 'candidate', resume_url: 'https://awesome-resume.pdf', skills: ['React', 'CSS', 'JavaScript'], bio: 'Chuyên viên phát triển Frontend tương lai.' },
      { id: 'usr-2', email: 'hr@hireflow.com', full_name: 'Tran Thi HR', role: 'recruiter' }
    ];
    localStorage.setItem('hf_profiles', JSON.stringify(defaultProfiles));
  }

  if (!localStorage.getItem('hf_applications')) {
    localStorage.setItem('hf_applications', JSON.stringify([]));
  }

  if (!localStorage.getItem('hf_interviews')) {
    localStorage.setItem('hf_interviews', JSON.stringify([]));
  }
};

if (!IS_REAL_DB) {
  seedMockData();
}

// ----------------------------------------------------
// DATABASE SERVICE EXPORTS
// ----------------------------------------------------
export const dataService = {
  isRealDb: IS_REAL_DB,

  // AUTHENTICATION
  auth: {
    async signUp(email, password, fullName, role) {
      if (IS_REAL_DB) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName, role: role }
          }
        });
        if (error) throw error;
        return data.user;
      } else {
        // Mock Auth
        const profiles = JSON.parse(localStorage.getItem('hf_profiles') || '[]');
        if (profiles.some(p => p.email.toLowerCase() === email.toLowerCase())) {
          throw new Error('Email đã được đăng ký!');
        }
        const newUserId = 'usr-' + Math.random().toString(36).substr(2, 9);
        const newProfile = { id: newUserId, email, full_name: fullName, role, skills: [], bio: '' };
        profiles.push(newProfile);
        localStorage.setItem('hf_profiles', JSON.stringify(profiles));

        const sessionUser = { id: newUserId, email, role, full_name: fullName };
        localStorage.setItem('hf_session', JSON.stringify(sessionUser));
        return sessionUser;
      }
    },

    async signIn(email, password) {
      if (IS_REAL_DB) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        // Fetch profile role
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, full_name')
          .eq('id', data.user.id)
          .single();
          
        return {
          id: data.user.id,
          email: data.user.email,
          role: profile?.role || 'candidate',
          full_name: profile?.full_name || ''
        };
      } else {
        // Mock Sign In
        const profiles = JSON.parse(localStorage.getItem('hf_profiles') || '[]');
        const user = profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
        
        // Hardcode a default password for mock login simplicity
        if (!user) {
          throw new Error('Email không tồn tại!');
        }
        
        localStorage.setItem('hf_session', JSON.stringify(user));
        return user;
      }
    },

    async signOut() {
      if (IS_REAL_DB) {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      } else {
        localStorage.removeItem('hf_session');
      }
    },

    async getCurrentUser() {
      if (IS_REAL_DB) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, full_name, resume_url, skills, bio')
          .eq('id', user.id)
          .single();
          
        return {
          id: user.id,
          email: user.email,
          role: profile?.role || 'candidate',
          full_name: profile?.full_name || '',
          resume_url: profile?.resume_url || '',
          skills: profile?.skills || [],
          bio: profile?.bio || ''
        };
      } else {
        const session = localStorage.getItem('hf_session');
        return session ? JSON.parse(session) : null;
      }
    },

    async updateProfile(userId, profileData) {
      if (IS_REAL_DB) {
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: profileData.full_name,
            resume_url: profileData.resume_url,
            skills: profileData.skills,
            bio: profileData.bio,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);
        if (error) throw error;
      } else {
        const profiles = JSON.parse(localStorage.getItem('hf_profiles') || '[]');
        const updatedProfiles = profiles.map(p => 
          p.id === userId ? { ...p, ...profileData } : p
        );
        localStorage.setItem('hf_profiles', JSON.stringify(updatedProfiles));
        
        // Update session too if current user
        const session = JSON.parse(localStorage.getItem('hf_session') || '{}');
        if (session.id === userId) {
          localStorage.setItem('hf_session', JSON.stringify({ ...session, ...profileData }));
        }
      }
    }
  },

  // JOBS
  jobs: {
    async getJobs() {
      if (IS_REAL_DB) {
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
      } else {
        return JSON.parse(localStorage.getItem('hf_jobs') || '[]');
      }
    },

    async createJob(jobData) {
      if (IS_REAL_DB) {
        const { data, error } = await supabase
          .from('jobs')
          .insert([jobData])
          .select();
        if (error) throw error;
        return data[0];
      } else {
        const jobs = JSON.parse(localStorage.getItem('hf_jobs') || '[]');
        const newJob = {
          id: 'job-' + Math.random().toString(36).substr(2, 9),
          ...jobData,
          status: 'active',
          created_at: new Date().toISOString()
        };
        jobs.unshift(newJob);
        localStorage.setItem('hf_jobs', JSON.stringify(jobs));
        return newJob;
      }
    },

    async updateJob(jobId, jobData) {
      if (IS_REAL_DB) {
        const { data, error } = await supabase
          .from('jobs')
          .update(jobData)
          .eq('id', jobId)
          .select();
        if (error) throw error;
        return data[0];
      } else {
        const jobs = JSON.parse(localStorage.getItem('hf_jobs') || '[]');
        const updatedJobs = jobs.map(j => j.id === jobId ? { ...j, ...jobData } : j);
        localStorage.setItem('hf_jobs', JSON.stringify(updatedJobs));
        return updatedJobs.find(j => j.id === jobId);
      }
    }
  },

  // APPLICATIONS
  applications: {
    async applyForJob(jobId, candidateId, resumeUrl, coverLetter) {
      if (IS_REAL_DB) {
        const { data, error } = await supabase
          .from('applications')
          .insert([{
            job_id: jobId,
            candidate_id: candidateId,
            resume_url: resumeUrl,
            cover_letter: coverLetter
          }])
          .select();
        if (error) throw error;
        return data[0];
      } else {
        const applications = JSON.parse(localStorage.getItem('hf_applications') || '[]');
        
        // Check if already applied
        if (applications.some(app => app.job_id === jobId && app.candidate_id === candidateId)) {
          throw new Error('Bạn đã nộp đơn cho công việc này rồi!');
        }

        const newApp = {
          id: 'app-' + Math.random().toString(36).substr(2, 9),
          job_id: jobId,
          candidate_id: candidateId,
          status: 'applied',
          resume_url: resumeUrl,
          cover_letter: coverLetter,
          applied_at: new Date().toISOString()
        };
        applications.unshift(newApp);
        localStorage.setItem('hf_applications', JSON.stringify(applications));
        return newApp;
      }
    },

    async getApplications(role, userId) {
      if (IS_REAL_DB) {
        let query = supabase.from('applications').select(`
          *,
          job:jobs(*),
          candidate:profiles(*)
        `);
        
        if (role === 'candidate') {
          query = query.eq('candidate_id', userId);
        }
        
        const { data, error } = await query.order('applied_at', { ascending: false });
        if (error) throw error;
        return data;
      } else {
        const apps = JSON.parse(localStorage.getItem('hf_applications') || '[]');
        const jobs = JSON.parse(localStorage.getItem('hf_jobs') || '[]');
        const profiles = JSON.parse(localStorage.getItem('hf_profiles') || '[]');
        
        // Enrich data mimicking SQL joins
        let filteredApps = apps;
        if (role === 'candidate') {
          filteredApps = apps.filter(app => app.candidate_id === userId);
        }
        
        return filteredApps.map(app => ({
          ...app,
          job: jobs.find(j => j.id === app.job_id),
          candidate: profiles.find(p => p.id === app.candidate_id)
        })).sort((a, b) => new Date(b.applied_at) - new Date(a.applied_at));
      }
    },

    async updateStatus(applicationId, status) {
      if (IS_REAL_DB) {
        const { data, error } = await supabase
          .from('applications')
          .update({ status })
          .eq('id', applicationId)
          .select();
        if (error) throw error;
        return data[0];
      } else {
        const apps = JSON.parse(localStorage.getItem('hf_applications') || '[]');
        const updatedApps = apps.map(app => app.id === applicationId ? { ...app, status } : app);
        localStorage.setItem('hf_applications', JSON.stringify(updatedApps));
        return updatedApps.find(app => app.id === applicationId);
      }
    }
  },

  // INTERVIEWS
  interviews: {
    async getInterviews(role, userId) {
      if (IS_REAL_DB) {
        let query = supabase.from('interviews').select(`
          *,
          application:applications(
            *,
            job:jobs(*),
            candidate:profiles(*)
          )
        `);
        
        const { data, error } = await query.order('scheduled_at', { ascending: true });
        if (error) throw error;
        
        if (role === 'candidate') {
          return data.filter(i => i.application?.candidate_id === userId);
        }
        return data;
      } else {
        const interviews = JSON.parse(localStorage.getItem('hf_interviews') || '[]');
        const apps = await dataService.applications.getApplications('recruiter');
        
        const enrichedInterviews = interviews.map(i => ({
          ...i,
          application: apps.find(app => app.id === i.application_id)
        })).sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at));

        if (role === 'candidate') {
          return enrichedInterviews.filter(i => i.application?.candidate_id === userId);
        }
        return enrichedInterviews;
      }
    },

    async schedule(applicationId, scheduledAt, interviewerName, meetingLink) {
      if (IS_REAL_DB) {
        const { data, error } = await supabase
          .from('interviews')
          .insert([{
            application_id: applicationId,
            scheduled_at: scheduledAt,
            interviewer_name: interviewerName,
            meeting_link: meetingLink
          }])
          .select();
        if (error) throw error;
        return data[0];
      } else {
        const interviews = JSON.parse(localStorage.getItem('hf_interviews') || '[]');
        const newInt = {
          id: 'int-' + Math.random().toString(36).substr(2, 9),
          application_id: applicationId,
          scheduled_at: scheduledAt,
          interviewer_name: interviewerName,
          meeting_link: meetingLink,
          created_at: new Date().toISOString()
        };
        interviews.push(newInt);
        localStorage.setItem('hf_interviews', JSON.stringify(interviews));
        return newInt;
      }
    },

    async submitEvaluation(interviewId, feedback, score) {
      if (IS_REAL_DB) {
        const { data, error } = await supabase
          .from('interviews')
          .update({ feedback, score })
          .eq('id', interviewId)
          .select();
        if (error) throw error;
        return data[0];
      } else {
        const interviews = JSON.parse(localStorage.getItem('hf_interviews') || '[]');
        const updatedInterviews = interviews.map(i => 
          i.id === interviewId ? { ...i, feedback, score } : i
        );
        localStorage.setItem('hf_interviews', JSON.stringify(updatedInterviews));
        return updatedInterviews.find(i => i.id === interviewId);
      }
    }
  }
};
