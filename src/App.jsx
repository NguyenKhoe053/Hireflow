import React, { useState, useEffect } from 'react';
import { 
  Briefcase, Users, Calendar, User, LogOut, Plus, Search, MapPin, 
  DollarSign, CheckCircle, Clock, X, ChevronRight, Info, ExternalLink, 
  Lock, Building, Database, Award, Star, Settings, FileText, Check, AlertTriangle
} from 'lucide-react';
import { dataService } from './dataService';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('jobs'); // 'jobs' | 'dashboard' | 'ats' | 'interviews' | 'profile'
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  
  // Modals & Selected items
  const [selectedJob, setSelectedJob] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showJobModal, setShowJobModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(null); // application object
  const [showEvalModal, setShowEvalModal] = useState(null); // interview object
  
  // Notification toast
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  const checkUser = async () => {
    try {
      const user = await dataService.auth.getCurrentUser();
      if (user) {
        setCurrentUser(user);
        // Default tabs based on role
        setActiveTab(user.role === 'recruiter' ? 'ats' : 'jobs');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    try {
      const fetchedJobs = await dataService.jobs.getJobs();
      setJobs(fetchedJobs);
      
      if (currentUser) {
        const fetchedApps = await dataService.applications.getApplications(currentUser.role, currentUser.id);
        setApplications(fetchedApps);
        
        const fetchedInterviews = await dataService.interviews.getInterviews(currentUser.role, currentUser.id);
        setInterviews(fetchedInterviews);
      }
    } catch (err) {
      showToast('Lỗi khi tải dữ liệu: ' + err.message, 'error');
    }
  };

  const handleLogout = async () => {
    try {
      await dataService.auth.signOut();
      setCurrentUser(null);
      setApplications([]);
      setInterviews([]);
      showToast('Đăng xuất thành công');
    } catch (err) {
      showToast('Đăng xuất thất bại: ' + err.message, 'error');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ color: 'var(--text-secondary)' }}>Đang tải ứng dụng...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Toast Alert */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000,
          background: toast.type === 'error' ? 'var(--status-rejected-bg)' : 'var(--status-offered-bg)',
          color: toast.type === 'error' ? 'hsl(346, 84%, 65%)' : 'hsl(142, 70%, 45%)',
          border: `1px solid ${toast.type === 'error' ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}`,
          padding: '12px 20px', borderRadius: 'var(--radius-md)', backdropFilter: 'blur(8px)',
          boxShadow: 'var(--shadow-lg)', display: 'flex', alignItems: 'center', gap: '8px',
          animation: 'slideInRight 0.3s ease forwards'
        }}>
          {toast.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
          <span style={{ fontSize: '14px', fontWeight: 500 }}>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <header style={{
        background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'var(--glass-blur)',
        borderBottom: 'var(--glass-border)', sticky: 'top', top: 0, zIndex: 100
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '70px' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} onClick={() => setActiveTab(currentUser?.role === 'recruiter' ? 'ats' : 'jobs')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
              width: '36px', height: '36px', borderRadius: 'var(--radius-md)',
              display: 'flex', alignItems: 'center', justify: 'center', color: 'white',
              boxShadow: '0 4px 10px rgba(99,102,241,0.3)'
            }}>
              <Briefcase size={18} style={{ margin: 'auto' }} />
            </div>
            <div>
              <span style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.5px' }}>Hire<span style={{ color: 'var(--accent)' }}>Flow</span></span>
              <span style={{ display: 'block', fontSize: '9px', color: 'var(--text-muted)', marginTop: '-4px', fontWeight: 500 }}>INTERN PLATFORM</span>
            </div>
          </div>

          {/* Database & Mode Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', background: 'rgba(255,255,255,0.03)', padding: '6px 12px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-color)' }}>
            <Database size={12} style={{ color: dataService.isRealDb ? 'hsl(142, 70%, 50%)' : 'hsl(38, 92%, 50%)' }} />
            <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
              {dataService.isRealDb ? 'Supabase SQL Cloud' : 'Demo Offline SQL'}
            </span>
          </div>

          {/* Navigation */}
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <nav style={{ display: 'flex', alignItems: 'center', gap: '4px', marginRight: '16px' }}>
                {currentUser.role === 'candidate' ? (
                  <>
                    <button onClick={() => setActiveTab('jobs')} style={navBtnStyle(activeTab === 'jobs')}>
                      <Briefcase size={14} /> Việc làm
                    </button>
                    <button onClick={() => setActiveTab('dashboard')} style={navBtnStyle(activeTab === 'dashboard')}>
                      <FileText size={14} /> Đơn ứng tuyển
                    </button>
                    <button onClick={() => setActiveTab('interviews')} style={navBtnStyle(activeTab === 'interviews')}>
                      <Calendar size={14} /> Lịch hẹn
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setActiveTab('ats')} style={navBtnStyle(activeTab === 'ats')}>
                      <Users size={14} /> Bảng ATS (HR)
                    </button>
                    <button onClick={() => setActiveTab('jobs')} style={navBtnStyle(activeTab === 'jobs')}>
                      <Briefcase size={14} /> Đăng tuyển
                    </button>
                    <button onClick={() => setActiveTab('interviews')} style={navBtnStyle(activeTab === 'interviews')}>
                      <Calendar size={14} /> Lịch phỏng vấn
                    </button>
                  </>
                )}
                <button onClick={() => setActiveTab('profile')} style={navBtnStyle(activeTab === 'profile')}>
                  <User size={14} /> Cá nhân
                </button>
              </nav>

              {/* User Dropdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '1px solid var(--border-color)', paddingLeft: '16px' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>{currentUser.full_name || 'My Profile'}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                    {currentUser.role === 'recruiter' ? 'HR Manager' : 'Ứng viên'}
                  </div>
                </div>
                <button onClick={handleLogout} style={{
                  background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
                  padding: '6px', borderRadius: 'var(--radius-sm)', transition: 'all var(--transition-fast)'
                }} title="Đăng xuất">
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Chưa đăng nhập</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '40px 0' }}>
        <div className="container animate-fade-in">
          {currentUser ? (
            <>
              {activeTab === 'jobs' && (
                <JobBoard 
                  jobs={jobs} 
                  currentUser={currentUser} 
                  onJobSelect={(job) => { setSelectedJob(job); setShowJobModal(true); }}
                  onJobCreated={loadData}
                  showToast={showToast}
                />
              )}
              {activeTab === 'dashboard' && currentUser.role === 'candidate' && (
                <CandidateDashboard 
                  applications={applications} 
                  interviews={interviews}
                  onTabChange={setActiveTab}
                />
              )}
              {activeTab === 'ats' && currentUser.role === 'recruiter' && (
                <ATSBoard 
                  applications={applications} 
                  jobs={jobs}
                  onStatusUpdate={async (appId, status) => {
                    try {
                      await dataService.applications.updateStatus(appId, status);
                      showToast('Đã cập nhật trạng thái ứng viên');
                      loadData();
                    } catch (err) {
                      showToast(err.message, 'error');
                    }
                  }}
                  onScheduleInterview={(app) => setShowScheduleModal(app)}
                  onEvaluateInterview={(interview) => setShowEvalModal(interview)}
                  interviews={interviews}
                />
              )}
              {activeTab === 'interviews' && (
                <InterviewsPage 
                  interviews={interviews} 
                  currentUser={currentUser}
                  onEvaluate={(interview) => setShowEvalModal(interview)}
                />
              )}
              {activeTab === 'profile' && (
                <ProfilePage 
                  currentUser={currentUser} 
                  onUpdate={checkUser} 
                  showToast={showToast}
                />
              )}
            </>
          ) : (
            <AuthPage onAuthSuccess={checkUser} showToast={showToast} />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: 'var(--glass-border)', padding: '24px 0', background: 'rgba(10,15,30,0.5)', marginTop: 'auto' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            © {new Date().getFullYear()} HireFlow - Dự án thực tập ấn tượng ghi điểm 10/10 với HR.
          </p>
          <div style={{ display: 'flex', gap: '16px', fontSize: '13px' }}>
            <a href="https://supabase.com" target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Database size={12} /> SQL Database cloud bởi Supabase
            </a>
            <span style={{ color: 'var(--text-muted)' }}>|</span>
            <a href="https://vercel.com" target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)' }}>
              Deploy hosting miễn phí trên Vercel
            </a>
          </div>
        </div>
      </footer>

      {/* Job Details Modal */}
      {showJobModal && selectedJob && (
        <JobDetailModal 
          job={selectedJob} 
          currentUser={currentUser}
          onClose={() => setShowJobModal(false)}
          onApply={() => { setShowJobModal(false); setShowApplyModal(true); }}
          hasApplied={applications.some(app => app.job_id === selectedJob.id)}
        />
      )}

      {/* Job Application Form Modal */}
      {showApplyModal && selectedJob && (
        <ApplicationModal 
          job={selectedJob}
          currentUser={currentUser}
          onClose={() => setShowApplyModal(false)}
          onSubmit={async (resumeUrl, coverLetter) => {
            try {
              await dataService.applications.applyForJob(selectedJob.id, currentUser.id, resumeUrl, coverLetter);
              showToast(`Đã nộp đơn ứng tuyển cho vị trí ${selectedJob.title}!`);
              setShowApplyModal(false);
              loadData();
            } catch (err) {
              showToast(err.message, 'error');
            }
          }}
        />
      )}

      {/* Schedule Interview Modal (HR Only) */}
      {showScheduleModal && (
        <ScheduleInterviewModal 
          application={showScheduleModal}
          onClose={() => setShowScheduleModal(null)}
          onSubmit={async (date, interviewerName, link) => {
            try {
              await dataService.interviews.schedule(showScheduleModal.id, date, interviewerName, link);
              await dataService.applications.updateStatus(showScheduleModal.id, 'interviewing');
              showToast('Lên lịch phỏng vấn thành công!');
              setShowScheduleModal(null);
              loadData();
            } catch (err) {
              showToast(err.message, 'error');
            }
          }}
        />
      )}

      {/* Evaluate Interview Modal (HR Only) */}
      {showEvalModal && (
        <EvaluationModal 
          interview={showEvalModal}
          onClose={() => setShowEvalModal(null)}
          onSubmit={async (feedback, score, finalStatus) => {
            try {
              await dataService.interviews.submitEvaluation(showEvalModal.id, feedback, score);
              if (finalStatus) {
                await dataService.applications.updateStatus(showEvalModal.application_id, finalStatus);
              }
              showToast('Đã lưu đánh giá phỏng vấn và cập nhật trạng thái hồ sơ');
              setShowEvalModal(null);
              loadData();
            } catch (err) {
              showToast(err.message, 'error');
            }
          }}
        />
      )}
    </div>
  );
}

// Navigation button custom active helper
const navBtnStyle = (isActive) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  background: isActive ? 'var(--primary-glow)' : 'transparent',
  border: '1px solid',
  borderColor: isActive ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
  color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
  padding: '8px 14px',
  borderRadius: 'var(--radius-md)',
  fontSize: '13px',
  fontWeight: isActive ? 600 : 500,
  cursor: 'pointer',
  transition: 'all var(--transition-fast)'
});

// ----------------------------------------------------
// COMPONENTS
// ----------------------------------------------------

// 1. AUTH PAGE (Login / Register)
function AuthPage({ onAuthSuccess, showToast }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('candidate');
  const [authLoading, setAuthLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      if (isRegister) {
        await dataService.auth.signUp(email, password, fullName, role);
        showToast('Đăng ký thành công! Hãy đăng nhập bằng tài khoản mới.');
        setIsRegister(false);
      } else {
        await dataService.auth.signIn(email, password);
        showToast('Đăng nhập thành công!');
        onAuthSuccess();
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleQuickLogin = async (mockEmail, mockPass) => {
    setAuthLoading(true);
    try {
      await dataService.auth.signIn(mockEmail, mockPass);
      showToast('Đăng nhập tài khoản Test thành công!');
      onAuthSuccess();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '440px', margin: '60px auto 0 auto' }} className="glass-card">
      <div style={{ padding: '32px' }}>
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '6px' }}>
            {isRegister ? 'Tạo tài khoản mới' : 'Chào mừng trở lại'}
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Hệ thống Quản lý và Nộp hồ sơ thực tập HireFlow
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <>
              <div className="form-group">
                <label className="form-label">Họ và Tên</label>
                <input 
                  type="text" className="form-input" required 
                  value={fullName} onChange={e => setFullName(e.target.value)}
                  placeholder="Nguyễn Văn A" 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tôi ứng tuyển làm:</label>
                <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                  <label style={{
                    flex: 1, padding: '10px', borderRadius: 'var(--radius-md)', 
                    border: '1px solid', borderColor: role === 'candidate' ? 'var(--primary)' : 'var(--border-color)',
                    background: role === 'candidate' ? 'var(--primary-glow)' : 'transparent',
                    display: 'flex', alignItems: 'center', justify: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px'
                  }}>
                    <input 
                      type="radio" name="role" checked={role === 'candidate'} 
                      onChange={() => setRole('candidate')} style={{ display: 'none' }}
                    />
                    <User size={14} /> Ứng viên
                  </label>
                  <label style={{
                    flex: 1, padding: '10px', borderRadius: 'var(--radius-md)', 
                    border: '1px solid', borderColor: role === 'recruiter' ? 'var(--accent)' : 'var(--border-color)',
                    background: role === 'recruiter' ? 'var(--accent-glow)' : 'transparent',
                    display: 'flex', alignItems: 'center', justify: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px'
                  }}>
                    <input 
                      type="radio" name="role" checked={role === 'recruiter'} 
                      onChange={() => setRole('recruiter')} style={{ display: 'none' }}
                    />
                    <Building size={14} /> Nhà tuyển dụng
                  </label>
                </div>
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label">Email</label>
            <input 
              type="email" className="form-input" required 
              value={email} onChange={e => setEmail(e.target.value)}
              placeholder="name@example.com" 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Mật khẩu</label>
            <input 
              type="password" className="form-input" required 
              value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" 
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={authLoading}>
            {authLoading ? 'Đang xử lý...' : (isRegister ? 'Đăng ký tài khoản' : 'Đăng nhập')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button 
            onClick={() => setIsRegister(!isRegister)}
            style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '13px' }}
          >
            {isRegister ? 'Đã có tài khoản? Đăng nhập ngay' : 'Chưa có tài khoản? Đăng ký ngay'}
          </button>
        </div>

        {/* Quick Login for Demo Mode */}
        {!dataService.isRealDb && (
          <div style={{ marginTop: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
            <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '12px', textTransform: 'uppercase', fontWeight: 600 }}>
              Đăng nhập nhanh (Chế độ Demo)
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button 
                onClick={() => handleQuickLogin('candidate@hireflow.com', '123456')}
                className="btn btn-secondary btn-sm" style={{ display: 'flex', justifyContent: 'space-between' }}
              >
                <span>Tài khoản Ứng viên Test</span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Nguyen Van A</span>
              </button>
              <button 
                onClick={() => handleQuickLogin('hr@hireflow.com', '123456')}
                className="btn btn-secondary btn-sm" style={{ display: 'flex', justifyContent: 'space-between' }}
              >
                <span>Tài khoản HR Manager Test</span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Tran Thi HR</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// 2. JOB BOARD & SEARCH
function JobBoard({ jobs, currentUser, onJobSelect, onJobCreated, showToast }) {
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [showCreateJob, setShowCreateJob] = useState(false);
  
  // Create job form state
  const [title, setTitle] = useState('');
  const [dept, setDept] = useState('Engineering');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('Internship');
  const [salary, setSalary] = useState('');
  const [desc, setDesc] = useState('');
  const [reqs, setReqs] = useState('');

  const departments = ['All', ...new Set(jobs.map(j => j.department))];

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(search.toLowerCase()) || 
                          job.description.toLowerCase().includes(search.toLowerCase());
    const matchesDept = deptFilter === 'All' || job.department === deptFilter;
    const matchesType = typeFilter === 'All' || job.type === typeFilter;
    return matchesSearch && matchesDept && matchesType && job.status === 'active';
  });

  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      await dataService.jobs.createJob({
        title,
        department: dept,
        location,
        type,
        salary_range: salary,
        description: desc,
        requirements: reqs
      });
      showToast('Đã đăng tin tuyển dụng mới thành công!');
      setShowCreateJob(false);
      // Reset form
      setTitle('');
      setLocation('');
      setSalary('');
      setDesc('');
      setReqs('');
      onJobCreated();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div>
      {/* Header and Add button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '6px' }}>Cơ hội thực tập hấp dẫn</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Tìm kiếm và ứng tuyển trực tiếp vào các dự án phần mềm thực tế</p>
        </div>
        {currentUser.role === 'recruiter' && (
          <button onClick={() => setShowCreateJob(true)} className="btn btn-primary">
            <Plus size={16} /> Đăng công việc mới
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="glass-card" style={{ padding: '20px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
            <input 
              type="text" className="form-input" style={{ paddingLeft: '38px' }}
              placeholder="Tìm kiếm chức danh, kỹ năng, nội dung..."
              value={search} onChange={e => setSearch(e.target.value)}
            />
          </div>
          
          <div style={{ minWidth: '150px' }}>
            <select className="form-select" value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
              <option value="All">Phòng ban: Tất cả</option>
              {departments.filter(d => d !== 'All').map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div style={{ minWidth: '150px' }}>
            <select className="form-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              <option value="All">Loại hình: Tất cả</option>
              <option value="Internship">Internship (Thực tập)</option>
              <option value="Full-time">Full-time (Toàn thời gian)</option>
              <option value="Remote">Remote (Từ xa)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Jobs Grid */}
      {filteredJobs.length > 0 ? (
        <div className="grid-3">
          {filteredJobs.map(job => (
            <div key={job.id} className="glass-card animate-fade-in" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <span style={{ fontSize: '11px', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                  {job.department}
                </span>
                <span style={{
                  fontSize: '11px', color: 'var(--primary)', background: 'var(--primary-glow)',
                  padding: '4px 8px', borderRadius: 'var(--radius-sm)', fontWeight: 600
                }}>
                  {job.type}
                </span>
              </div>
              
              <h3 style={{ fontSize: '18px', marginBottom: '12px', fontWeight: 600 }}>{job.title}</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={14} style={{ color: 'var(--text-muted)' }} />
                  <span>{job.location}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <DollarSign size={14} style={{ color: 'var(--text-muted)' }} />
                  <span>{job.salary_range || 'Thỏa thuận'}</span>
                </div>
              </div>

              <p style={{ fontSize: '13px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '20px', flex: 1 }}>
                {job.description}
              </p>

              <button onClick={() => onJobSelect(job)} className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                Xem chi tiết <ChevronRight size={14} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card" style={{ padding: '48px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Không tìm thấy vị trí tuyển dụng phù hợp.</p>
        </div>
      )}

      {/* Create Job Modal */}
      {showCreateJob && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1000,
          background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(4px)'
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700 }}>Đăng tin tuyển dụng mới</h2>
              <button onClick={() => setShowCreateJob(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateJob}>
              <div className="form-group">
                <label className="form-label">Tiêu đề công việc</label>
                <input type="text" className="form-input" required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Frontend Developer Intern" />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Phòng ban</label>
                  <select className="form-select" value={dept} onChange={e => setDept(e.target.value)}>
                    <option value="Engineering">Engineering (Kỹ thuật)</option>
                    <option value="Product & Design">Product & Design (Sản phẩm)</option>
                    <option value="Marketing">Marketing (Truyền thông)</option>
                    <option value="Human Resources">Human Resources (Nhân sự)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Loại hình làm việc</label>
                  <select className="form-select" value={type} onChange={e => setType(e.target.value)}>
                    <option value="Internship">Internship (Thực tập)</option>
                    <option value="Full-time">Full-time (Toàn thời gian)</option>
                    <option value="Part-time">Part-time (Bán thời gian)</option>
                    <option value="Contract">Contract (Hợp đồng)</option>
                    <option value="Remote">Remote (Từ xa)</option>
                  </select>
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Địa điểm làm việc</label>
                  <input type="text" className="form-input" required value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Hà Nội, Việt Nam" />
                </div>
                <div className="form-group">
                  <label className="form-label">Mức lương hỗ trợ</label>
                  <input type="text" className="form-input" value={salary} onChange={e => setSalary(e.target.value)} placeholder="e.g. 5,000,000 - 8,000,000 VND" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Mô tả công việc</label>
                <textarea className="form-textarea" required value={desc} onChange={e => setDesc(e.target.value)} placeholder="Viết mô tả ngắn gọn về nhiệm vụ, công việc hàng ngày..." />
              </div>

              <div className="form-group">
                <label className="form-label">Yêu cầu ứng viên</label>
                <textarea className="form-textarea" required value={reqs} onChange={e => setReqs(e.target.value)} placeholder="Yêu cầu về kỹ năng, thái độ, ngôn ngữ lập trình..." />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" onClick={() => setShowCreateJob(false)} className="btn btn-secondary">Hủy</button>
                <button type="submit" className="btn btn-primary">Đăng tin</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// 3. CANDIDATE DASHBOARD
function CandidateDashboard({ applications, interviews, onTabChange }) {
  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '6px' }}>Đơn ứng tuyển của bạn</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Theo dõi trạng thái phản hồi hồ sơ từ HR các công ty</p>

      <div className="grid-3" style={{ gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
        {/* Applications List */}
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} /> Danh sách hồ sơ đã nộp ({applications.length})
          </h2>
          
          {applications.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {applications.map(app => (
                <div key={app.id} className="glass-card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 600 }}>{app.job?.title}</h3>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{app.job?.department} • {app.job?.location}</span>
                    </div>
                    <span className={`badge badge-${app.status}`}>
                      {app.status}
                    </span>
                  </div>

                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: 'var(--radius-sm)', marginBottom: '12px' }}>
                    <strong>Thư giới thiệu:</strong> {app.cover_letter || 'Không đính kèm'}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
                    <span>Đã nộp vào: {new Date(app.applied_at).toLocaleDateString('vi-VN')}</span>
                    {app.resume_url && (
                      <a href={app.resume_url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <ExternalLink size={12} /> Xem CV đã nộp
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>Bạn chưa nộp hồ sơ vào vị trí nào.</p>
              <button onClick={() => onTabChange('jobs')} className="btn btn-primary btn-sm">Tìm kiếm việc làm</button>
            </div>
          )}
        </div>

        {/* Interviews Sidebar Panel */}
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} /> Phỏng vấn sắp tới ({interviews.filter(i => new Date(i.scheduled_at) > new Date()).length})
          </h2>

          {interviews.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {interviews.map(i => {
                const isUpcoming = new Date(i.scheduled_at) > new Date();
                return (
                  <div key={i.id} className="glass-card" style={{ padding: '16px', borderLeft: `4px solid ${isUpcoming ? 'var(--status-interviewing)' : 'var(--border-color)'}` }}>
                    <div style={{ display: 'flex', justify: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 600, textTransform: 'uppercase' }}>
                        {isUpcoming ? 'Lịch sắp tới' : 'Đã diễn ra'}
                      </span>
                      {i.score && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: 'hsl(38, 92%, 50%)', fontSize: '12px' }}>
                          <Star size={12} fill="currentColor" /> {i.score}/5
                        </div>
                      )}
                    </div>
                    
                    <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>{i.application?.job?.title}</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      Người phỏng vấn: {i.interviewer_name}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-primary)', marginBottom: '10px' }}>
                      <Clock size={12} style={{ color: 'var(--text-muted)' }} />
                      <span>{new Date(i.scheduled_at).toLocaleString('vi-VN')}</span>
                    </div>

                    {i.meeting_link && isUpcoming && (
                      <a href={i.meeting_link} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm" style={{ width: '100%', fontSize: '11px', padding: '6px 0' }}>
                        Vào phòng phỏng vấn <ExternalLink size={12} />
                      </a>
                    )}

                    {i.feedback && (
                      <div style={{ marginTop: '10px', padding: '8px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', fontSize: '11px' }}>
                        <strong>Nhận xét:</strong> {i.feedback}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="glass-card" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              Chưa có lịch hẹn phỏng vấn nào được lên lịch.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 4. ATS BOARD (HR Admin Kanban)
function ATSBoard({ applications, jobs, onStatusUpdate, onScheduleInterview, onEvaluateInterview, interviews }) {
  const [selectedJobId, setSelectedJobId] = useState('All');
  
  const columns = [
    { id: 'applied', title: 'Hồ sơ mới', color: 'var(--status-applied)' },
    { id: 'screening', title: 'Sàng lọc', color: 'var(--status-screening)' },
    { id: 'interviewing', title: 'Phỏng vấn', color: 'var(--status-interviewing)' },
    { id: 'offered', title: 'Nhận Offer', color: 'var(--status-offered)' },
    { id: 'rejected', title: 'Từ chối', color: 'var(--status-rejected)' }
  ];

  // Filter apps by job
  const filteredApps = selectedJobId === 'All' 
    ? applications 
    : applications.filter(app => app.job_id === selectedJobId);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '6px' }}>Bảng quản trị tuyển dụng (ATS)</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Theo dõi, lên lịch phỏng vấn và quản lý phễu ứng viên tiện lợi</p>
        </div>
        
        {/* Job selector filter */}
        <div style={{ minWidth: '220px' }}>
          <label className="form-label">Xem theo vị trí tuyển:</label>
          <select className="form-select" value={selectedJobId} onChange={e => setSelectedJobId(e.target.value)}>
            <option value="All">Tất cả vị trí ({applications.length})</option>
            {jobs.map(j => (
              <option key={j.id} value={j.id}>{j.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Kanban Board Container */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', overflowX: 'auto', paddingBottom: '16px', minWidth: '950px' }}>
        {columns.map(col => {
          const colApps = filteredApps.filter(app => app.status === col.id);
          return (
            <div key={col.id} style={{ display: 'flex', flexDirection: 'column', background: 'rgba(15,23,42,0.3)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '12px', minHeight: '550px' }}>
              {/* Column Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: `2px solid ${col.color}`, paddingBottom: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600 }}>{col.title}</span>
                <span style={{
                  background: 'var(--bg-tertiary)', fontSize: '11px', fontWeight: 600,
                  padding: '2px 8px', borderRadius: 'var(--radius-full)', color: 'var(--text-secondary)'
                }}>{colApps.length}</span>
              </div>

              {/* Candidates Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, overflowY: 'auto' }}>
                {colApps.map(app => {
                  // Find related interview
                  const appInterview = interviews.find(i => i.application_id === app.id);
                  return (
                    <div key={app.id} className="glass-card animate-fade-in" style={{ padding: '12px', background: 'rgba(25,35,55,0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '2px' }}>{app.candidate?.full_name}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '8px' }}>Ứng tuyển: {app.job?.title}</div>
                      
                      {/* Skills badge list */}
                      {app.candidate?.skills && app.candidate.skills.length > 0 && (
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '10px' }}>
                          {app.candidate.skills.slice(0, 3).map((sk, idx) => (
                            <span key={idx} style={{ fontSize: '9px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', padding: '2px 4px', borderRadius: '4px', color: 'var(--text-secondary)' }}>
                              {sk}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Action trigger states */}
                      {app.status === 'applied' && (
                        <button onClick={() => onStatusUpdate(app.id, 'screening')} className="btn btn-secondary btn-sm" style={{ width: '100%', padding: '4px 0', fontSize: '11px' }}>
                          Sàng lọc hồ sơ
                        </button>
                      )}

                      {app.status === 'screening' && (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => onScheduleInterview(app)} className="btn btn-primary btn-sm" style={{ flex: 1, padding: '4px 0', fontSize: '11px' }}>
                            Lên lịch PV
                          </button>
                          <button onClick={() => onStatusUpdate(app.id, 'rejected')} className="btn btn-danger btn-sm" style={{ padding: '4px 8px' }}>
                            <X size={12} />
                          </button>
                        </div>
                      )}

                      {app.status === 'interviewing' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {appInterview ? (
                            <div style={{ fontSize: '10px', color: 'hsl(38, 92%, 50%)', background: 'rgba(245,158,11,0.05)', padding: '6px', borderRadius: '4px', border: '1px solid rgba(245,158,11,0.1)' }}>
                              Lịch: {new Date(appInterview.scheduled_at).toLocaleDateString('vi-VN')}
                              {appInterview.score ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginTop: '2px' }}>
                                  Điểm: <Star size={10} fill="currentColor" /> {appInterview.score}/5
                                </div>
                              ) : (
                                <button onClick={() => onEvaluateInterview(appInterview)} className="btn btn-primary btn-sm" style={{ width: '100%', padding: '2px 0', fontSize: '9px', marginTop: '4px' }}>
                                  Đánh giá ngay
                                </button>
                              )}
                            </div>
                          ) : (
                            <button onClick={() => onScheduleInterview(app)} className="btn btn-primary btn-sm" style={{ width: '100%', padding: '4px 0', fontSize: '11px' }}>
                              Lên lịch PV
                            </button>
                          )}
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button onClick={() => onStatusUpdate(app.id, 'offered')} className="btn btn-secondary btn-sm" style={{ flex: 1, padding: '3px 0', fontSize: '10px', color: 'hsl(142, 70%, 45%)' }}>
                              Offer
                            </button>
                            <button onClick={() => onStatusUpdate(app.id, 'rejected')} className="btn btn-danger btn-sm" style={{ flex: 1, padding: '3px 0', fontSize: '10px' }}>
                              Loại
                            </button>
                          </div>
                        </div>
                      )}

                      {app.status === 'offered' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'hsl(142, 70%, 45%)', fontSize: '11px', fontWeight: 500 }}>
                          <CheckCircle size={12} /> Đã gửi thư Offer
                        </div>
                      )}

                      {app.status === 'rejected' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'hsl(346, 84%, 60%)', fontSize: '11px', fontWeight: 500 }}>
                          <X size={12} /> Đã loại ứng viên
                        </div>
                      )}

                      <div style={{ marginTop: '10px', borderTop: '1px solid var(--border-color)', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)' }}>
                        <a href={app.resume_url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                          Xem CV <ExternalLink size={8} />
                        </a>
                        <span>{new Date(app.applied_at).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 5. INTERVIEWS PAGE
function InterviewsPage({ interviews, currentUser, onEvaluate }) {
  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '6px' }}>Hội thoại phỏng vấn</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Quản lý chi tiết lịch hẹn phỏng vấn của các ứng viên và nhà tuyển dụng</p>

      <div className="glass-card" style={{ padding: '24px' }}>
        {interviews.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px' }}>Ứng viên / Tin tuyển dụng</th>
                <th style={{ padding: '12px' }}>Thời gian</th>
                <th style={{ padding: '12px' }}>Người phỏng vấn</th>
                <th style={{ padding: '12px' }}>Phòng họp</th>
                <th style={{ padding: '12px' }}>Điểm số</th>
                <th style={{ padding: '12px' }}>Nhận xét / Đánh giá</th>
              </tr>
            </thead>
            <tbody>
              {interviews.map(i => (
                <tr key={i.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '16px 12px' }}>
                    <div style={{ fontWeight: 600 }}>{i.application?.candidate?.full_name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{i.application?.job?.title}</div>
                  </td>
                  <td style={{ padding: '16px 12px' }}>
                    <div>{new Date(i.scheduled_at).toLocaleDateString('vi-VN')}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{new Date(i.scheduled_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</div>
                  </td>
                  <td style={{ padding: '16px 12px' }}>{i.interviewer_name}</td>
                  <td style={{ padding: '16px 12px' }}>
                    {i.meeting_link ? (
                      <a href={i.meeting_link} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--primary)' }}>
                        Vào Meet <ExternalLink size={12} />
                      </a>
                    ) : '---'}
                  </td>
                  <td style={{ padding: '16px 12px' }}>
                    {i.score ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: 'hsl(38, 92%, 50%)' }}>
                        <Star size={12} fill="currentColor" /> {i.score}/5
                      </div>
                    ) : 'Chưa chấm'}
                  </td>
                  <td style={{ padding: '16px 12px' }}>
                    {i.feedback ? (
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{i.feedback}</span>
                    ) : (
                      currentUser.role === 'recruiter' ? (
                        <button onClick={() => onEvaluate(i)} className="btn btn-secondary btn-sm" style={{ padding: '4px 8px', fontSize: '12px' }}>
                          Ghi đánh giá
                        </button>
                      ) : 'Chờ phản hồi'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
            Chưa có lịch phỏng vấn nào được ghi nhận.
          </div>
        )}
      </div>
    </div>
  );
}

// 6. PROFILE PAGE
function ProfilePage({ currentUser, onUpdate, showToast }) {
  const [fullName, setFullName] = useState(currentUser.full_name || '');
  const [resumeUrl, setResumeUrl] = useState(currentUser.resume_url || '');
  const [bio, setBio] = useState(currentUser.bio || '');
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState(currentUser.skills || []);
  const [saving, setSaving] = useState(false);

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (sk) => {
    setSkills(skills.filter(s => s !== sk));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await dataService.auth.updateProfile(currentUser.id, {
        full_name: fullName,
        resume_url: resumeUrl,
        skills,
        bio
      });
      showToast('Đã lưu thông tin cá nhân!');
      onUpdate();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '650px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '6px' }}>Hồ sơ cá nhân</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Cập nhật các kỹ năng và thông tin liên hệ để nhà tuyển dụng dễ dàng tìm thấy bạn</p>

      <div className="glass-card" style={{ padding: '32px' }}>
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Email tài khoản (Không thể thay đổi)</label>
            <input type="email" className="form-input" value={currentUser.email} disabled style={{ opacity: 0.5 }} />
          </div>

          <div className="form-group">
            <label className="form-label">Họ và Tên</label>
            <input type="text" className="form-input" required value={fullName} onChange={e => setFullName(e.target.value)} />
          </div>

          {currentUser.role === 'candidate' && (
            <>
              <div className="form-group">
                <label className="form-label">Đường dẫn CV ứng tuyển (Google Drive/PDF link)</label>
                <input type="url" className="form-input" value={resumeUrl} onChange={e => setResumeUrl(e.target.value)} placeholder="https://drive.google.com/your-cv.pdf" />
              </div>

              <div className="form-group">
                <label className="form-label">Giới thiệu ngắn (Bio)</label>
                <textarea className="form-textarea" value={bio} onChange={e => setBio(e.target.value)} placeholder="Hãy chia sẻ kinh nghiệm học tập hoặc mục tiêu nghề nghiệp..." />
              </div>

              <div className="form-group">
                <label className="form-label">Kỹ năng nổi bật (Skills)</label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <input 
                    type="text" className="form-input" placeholder="e.g. React, JavaScript, SQL, Python" 
                    value={skillInput} onChange={e => setSkillInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddSkill(e))}
                  />
                  <button type="button" onClick={handleAddSkill} className="btn btn-secondary">
                    Thêm
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {skills.map(sk => (
                    <span key={sk} style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      background: 'var(--primary-glow)', border: '1px solid rgba(99,102,241,0.2)',
                      padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: '12px'
                    }}>
                      {sk}
                      <button type="button" onClick={() => handleRemoveSkill(sk)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}>
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                  {skills.length === 0 && <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Chưa điền kỹ năng nào.</span>}
                </div>
              </div>
            </>
          )}

          <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 7. MODALS

// A. Job Detail Modal
function JobDetailModal({ job, currentUser, onClose, onApply, hasApplied }) {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1000,
      background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(4px)'
    }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '600px', padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>{job.department}</span>
            <h2 style={{ fontSize: '22px', fontWeight: 700, marginTop: '4px' }}>{job.title}</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} /> {job.location}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><DollarSign size={14} /> {job.salary_range || 'Thỏa thuận'}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Briefcase size={14} /> {job.type}</span>
        </div>

        <div style={{ maxHeight: '350px', overflowY: 'auto', paddingRight: '8px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-primary)' }}>Mô tả công việc</h4>
            <p style={{ fontSize: '13px', whiteSpace: 'pre-line' }}>{job.description}</p>
          </div>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-primary)' }}>Yêu cầu ứng viên</h4>
            <p style={{ fontSize: '13px', whiteSpace: 'pre-line' }}>{job.requirements}</p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
          <button onClick={onClose} className="btn btn-secondary">Đóng</button>
          
          {currentUser.role === 'candidate' && (
            hasApplied ? (
              <button disabled className="btn btn-secondary" style={{ color: 'var(--status-offered)', borderColor: 'rgba(16,185,129,0.2)' }}>
                <Check size={14} /> Đã ứng tuyển
              </button>
            ) : (
              <button onClick={onApply} className="btn btn-primary">Ứng tuyển ngay</button>
            )
          )}
        </div>
      </div>
    </div>
  );
}

// B. Application Modal
function ApplicationModal({ job, currentUser, onClose, onSubmit }) {
  const [cvLink, setCvLink] = useState(currentUser.resume_url || '');
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setApplying(true);
    await onSubmit(cvLink, coverLetter);
    setApplying(false);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1000,
      background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(4px)'
    }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '500px', padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Nộp đơn ứng tuyển</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Vị trí: {job.title}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleFormSubmit}>
          <div className="form-group">
            <label className="form-label">Đường dẫn CV cá nhân (Google Drive/Dropbox/PDF link)</label>
            <input 
              type="url" className="form-input" required 
              value={cvLink} onChange={e => setCvLink(e.target.value)} 
              placeholder="https://drive.google.com/file/d/your-cv/view" 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Thư giới thiệu / Động lực ứng tuyển (Cover Letter)</label>
            <textarea 
              className="form-textarea" required 
              rows={4} value={coverLetter} onChange={e => setCoverLetter(e.target.value)}
              placeholder="Chia sẻ lý do bạn phù hợp với vị trí thực tập này..." 
            />
          </div>

          <div style={{ display: 'flex', justify: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={applying}>Hủy</button>
            <button type="submit" className="btn btn-primary" disabled={applying}>
              {applying ? 'Đang nộp hồ sơ...' : 'Xác nhận nộp đơn'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// C. Schedule Interview Modal (HR)
function ScheduleInterviewModal({ application, onClose, onSubmit }) {
  const [date, setDate] = useState('');
  const [interviewer, setInterviewer] = useState('');
  const [link, setLink] = useState('https://meet.google.com/abc-defg-hij');
  const [submitting, setSubmitting] = useState(false);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await onSubmit(date, interviewer, link);
    setSubmitting(false);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1000,
      background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(4px)'
    }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '450px', padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Đặt lịch phỏng vấn</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Ứng viên: {application.candidate?.full_name}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleFormSubmit}>
          <div className="form-group">
            <label className="form-label">Thời gian phỏng vấn</label>
            <input 
              type="datetime-local" className="form-input" required 
              value={date} onChange={e => setDate(e.target.value)} 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tên người phỏng vấn (Interviewer)</label>
            <input 
              type="text" className="form-input" required 
              value={interviewer} onChange={e => setInterviewer(e.target.value)} 
              placeholder="e.g. Anh Nguyễn Văn Lead / Chị Trần Thị HR"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Link họp trực tuyến (Google Meet/Zoom)</label>
            <input 
              type="url" className="form-input" required 
              value={link} onChange={e => setLink(e.target.value)} 
            />
          </div>

          <div style={{ display: 'flex', justify: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={submitting}>Hủy</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Đang tạo lịch...' : 'Lưu lịch hẹn'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// D. Evaluation Modal (HR)
function EvaluationModal({ interview, onClose, onSubmit }) {
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState(5);
  const [finalStatus, setFinalStatus] = useState(''); // '' | 'offered' | 'rejected'
  const [submitting, setSubmitting] = useState(false);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await onSubmit(feedback, Number(score), finalStatus || null);
    setSubmitting(false);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1000,
      background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(4px)'
    }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '450px', padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Đánh giá phỏng vấn</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Ứng viên: {interview.application?.candidate?.full_name}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleFormSubmit}>
          <div className="form-group">
            <label className="form-label">Điểm đánh giá (1 - 5 sao)</label>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', margin: '8px 0' }}>
              {[1, 2, 3, 4, 5].map(num => (
                <label key={num} style={{
                  cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                  background: score === num ? 'var(--primary-glow)' : 'transparent',
                  border: '1px solid', borderColor: score === num ? 'var(--primary)' : 'var(--border-color)',
                  padding: '8px 12px', borderRadius: 'var(--radius-sm)'
                }}>
                  <input type="radio" name="score" value={num} checked={score === num} onChange={() => setScore(num)} style={{ display: 'none' }} />
                  <Star size={16} fill={score >= num ? 'hsl(38, 92%, 50%)' : 'none'} style={{ color: score >= num ? 'hsl(38, 92%, 50%)' : 'var(--text-muted)' }} />
                  <span style={{ fontSize: '11px' }}>{num}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Nhận xét chi tiết (Feedback)</label>
            <textarea 
              className="form-textarea" required 
              rows={4} value={feedback} onChange={e => setFeedback(e.target.value)}
              placeholder="Ghi nhận xét về chuyên môn, thái độ, điểm mạnh, điểm yếu..." 
            />
          </div>

          <div className="form-group" style={{ marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            <label className="form-label">Đồng thời cập nhật trạng thái hồ sơ (Tùy chọn)</label>
            <select className="form-select" value={finalStatus} onChange={e => setFinalStatus(e.target.value)}>
              <option value="">Giữ nguyên: Interviewing (Đang phỏng vấn)</option>
              <option value="offered">Chấp nhận: Gửi Offer</option>
              <option value="rejected">Từ chối: Loại ứng viên</option>
            </select>
          </div>

          <div style={{ display: 'flex', justify: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={submitting}>Hủy</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Đang lưu đánh giá...' : 'Lưu đánh giá'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
