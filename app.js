
// =====================================================================
// DATA LAYER — LocalStorage SQL simulation
// =====================================================================
const DB = {
  get: (k) => JSON.parse(localStorage.getItem('hf_'+k) || '[]'),
  set: (k, v) => localStorage.setItem('hf_'+k, JSON.stringify(v)),
  session: () => JSON.parse(localStorage.getItem('hf_session') || 'null'),
  setSession: (u) => localStorage.setItem('hf_session', JSON.stringify(u)),
  clearSession: () => localStorage.removeItem('hf_session'),
};

// Sử dụng Vercel Proxy (/api) khi deploy để tránh lỗi CORS và bảo mật URL server.
// Nếu đang chạy local (Live Server), tự động dùng thẳng link Render.
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_URL = isLocal ? 'https://hireflow-9fn2.onrender.com/api' : '/api';

const API = {
  get: async (path) => {
    const res = await fetch(API_URL + path);
    return res.json();
  },
  post: async (path, data) => {
    const res = await fetch(API_URL + path, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(data)
    });
    return res.json();
  },
  patch: async (path, data) => {
    const res = await fetch(API_URL + path, {
      method: 'PATCH',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(data)
    });
    return res.json();
  }
};


// =====================================================================
// TOAST & MODAL
// =====================================================================
function toast(msg, type='ok') {
  const t = document.getElementById('toast');
  t.textContent = (type==='ok'?'✓ ':'⚠ ') + msg;
  t.className = 'show ' + type;
  clearTimeout(t._t);
  t._t = setTimeout(()=>{ t.classList.remove('show'); t.className=''; }, 3800);
}

function openModal(html) {
  const r = document.getElementById('modal-root');
  r.style.display = 'flex';
  r.innerHTML = `<div class="modal-bg" onclick="if(event.target===this)closeModal()">${html}</div>`;
}

function closeModal() {
  const r = document.getElementById('modal-root');
  r.style.display = 'none';
  r.innerHTML = '';
}

// =====================================================================
// AUTH
// =====================================================================
let authMode = 'login'; // 'login' | 'register'

function renderAuth() {
  const f = document.getElementById('auth-form-wrap');
  if (authMode === 'login') {
    f.innerHTML = `
      <div class="auth-title">Đăng nhập</div>
      <div class="auth-sub" style="margin-bottom:20px">Chào mừng quay trở lại Tuyển Thực Tập</div>
      <form onsubmit="doLogin(event)">
        <div class="form-group">
          <label class="fl">Email</label>
          <input id="l-email" type="email" class="fi" required placeholder="email@example.com">
        </div>
        <div class="form-group">
          <label class="fl">Mật khẩu</label>
          <input id="l-pass" type="password" class="fi" required placeholder="••••••••">
        </div>
        <div id="cf-turnstile-widget" style="margin-bottom: 12px; display: flex; justify-content: center;"></div>
        <button type="submit" class="btn btn-green" style="width:100%;margin-top:4px">Đăng nhập</button>
      </form>
      <div class="auth-switch">Chưa có tài khoản? <button onclick="authMode='register';renderAuth()">Đăng ký ngay</button></div>
      <div class="quick-logins">
        <div class="ql-label">Đăng nhập nhanh thử nghiệm</div>
        <button class="ql-btn" onclick="quickLogin('ungvien@tuyenthuctap.vn')">
          <span><span class="material-symbols-rounded">person</span> Tài khoản Ứng viên</span><em>Nguyễn Văn An</em>
        </button>
        <button class="ql-btn" onclick="quickLogin('hr@tuyenthuctap.vn')">
          <span><span class="material-symbols-rounded">domain</span> Tài khoản HR Manager</span><em>Trần Thị Hương</em>
        </button>
      </div>`;
  } else {
    f.innerHTML = `
      <div class="auth-title">Tạo tài khoản</div>
      <div class="auth-sub" style="margin-bottom:20px">Tham gia Tuyển Thực Tập ngay hôm nay</div>
      <form onsubmit="doRegister(event)">
        <div class="form-group">
          <label class="fl">Họ và Tên</label>
          <input id="r-name" type="text" class="fi" required placeholder="Nguyễn Văn A">
        </div>
        <div class="form-group">
          <label class="fl">Tôi là</label>
          <div class="role-pick">
            <div class="role-opt selected-candidate" id="ropt-c" onclick="pickRole('candidate')"><span class="material-symbols-rounded">person</span> Ứng viên</div>
            <div class="role-opt" id="ropt-r" onclick="pickRole('recruiter')"><span class="material-symbols-rounded">domain</span> Nhà tuyển dụng</div>
          </div>
          <input type="hidden" id="r-role" value="candidate">
        </div>
        <div class="form-group">
          <label class="fl">Email</label>
          <input id="r-email" type="email" class="fi" required placeholder="email@example.com">
        </div>
        <div class="form-group">
          <label class="fl">Mật khẩu</label>
          <input id="r-pass" type="password" class="fi" required placeholder="Tối thiểu 6 ký tự" minlength="6">
        </div>
        <div id="cf-turnstile-widget" style="margin-bottom: 12px; display: flex; justify-content: center;"></div>
        <button type="submit" class="btn btn-green" style="width:100%;margin-top:4px">Tạo tài khoản</button>
      </form>
      <div class="auth-switch">Đã có tài khoản? <button onclick="authMode='login';renderAuth()">Đăng nhập</button></div>`;
  }
  
  // Render Cloudflare Turnstile
  setTimeout(() => {
    if (window.turnstile) {
      turnstile.render('#cf-turnstile-widget', {
        sitekey: '1x00000000000000000000AA',
        theme: 'dark'
      });
    }
  }, 150);
}

function pickRole(r) {
  document.getElementById('r-role').value = r;
  document.getElementById('ropt-c').className = 'role-opt' + (r==='candidate'?' selected-candidate':'');
  document.getElementById('ropt-r').className = 'role-opt' + (r==='recruiter'?' selected-recruiter':'');
}

function doLogin(e) {
  e.preventDefault();
  const email = document.getElementById('l-email').value.trim().toLowerCase();
  const profiles = DB.get('profiles');
  const user = profiles.find(p => p.email.toLowerCase() === email);
  if (!user) { toast('Email không tồn tại!', 'err'); return; }
  DB.setSession(user);
  toast('Đăng nhập thành công!');
  startApp(user);
}

function doRegister(e) {
  e.preventDefault();
  const name = document.getElementById('r-name').value.trim();
  const email = document.getElementById('r-email').value.trim().toLowerCase();
  const role = document.getElementById('r-role').value;
  const profiles = DB.get('profiles');
  if (profiles.some(p => p.email.toLowerCase() === email)) {
    toast('Email này đã được đăng ký!', 'err'); return;
  }
  const newUser = {id:'usr-'+Math.random().toString(36).substr(2,8), email, full_name:name, role, skills:[], bio:'', resume_url:''};
  profiles.push(newUser);
  DB.set('profiles', profiles);
  DB.setSession(newUser);
  toast('Tài khoản đã được tạo thành công!');
  authMode = 'login';
  startApp(newUser);
}

function quickLogin(email) {
  const isHR = email.includes('hr');
  const user = {
    id: isHR ? 'hr-123' : 'intern-456',
    email: email,
    full_name: isHR ? 'Trần Thị Hương' : 'Nguyễn Văn An',
    role: isHR ? 'recruiter' : 'candidate'
  };
  DB.setSession(user);
  startApp(user);
}

function logout() {
  DB.clearSession();
  document.getElementById('app').style.display = 'none';
  document.getElementById('auth-page').style.display = 'flex';
  authMode = 'login';
  renderAuth();
  toast('Đã đăng xuất');
}

// =====================================================================
// APP SHELL
// =====================================================================
let currentUser = null;
let currentTab = '';

function startApp(user) {
  currentUser = user;
  document.getElementById('auth-page').style.display = 'none';
  document.getElementById('app').style.display = 'flex';
  document.getElementById('nav-role-label').textContent = user.role === 'recruiter' ? 'HR Manager' : 'Ứng viên';
  document.getElementById('nav-user-info').innerHTML = `<strong>${user.full_name||user.email}</strong><em>${user.role==='recruiter'?'Nhà tuyển dụng':'Ứng viên thực tập'}</em>`;
  renderNav();
  const defaultTab = user.role === 'recruiter' ? 'ats' : 'jobs';
  switchTab(defaultTab);
}

function goHome() {
  switchTab(currentUser?.role === 'recruiter' ? 'ats' : 'jobs');
}

function renderNav() {
  const tabs = currentUser.role === 'recruiter'
    ? [{id:'ats',label:'🗂 Bảng ATS'},{id:'jobs',label:'<span class="material-symbols-rounded">work</span> Đăng tuyển'},{id:'interviews',label:'<span class="material-symbols-rounded">calendar_month</span> Phỏng vấn'},{id:'profile',label:'<span class="material-symbols-rounded">person</span> Tài khoản'}]
    : [{id:'jobs',label:'<span class="material-symbols-rounded">work</span> Việc làm'},{id:'dashboard',label:'<span class="material-symbols-rounded">description</span> Đơn ứng tuyển'},{id:'interviews',label:'<span class="material-symbols-rounded">calendar_month</span> Lịch hẹn'},{id:'profile',label:'<span class="material-symbols-rounded">person</span> Tài khoản'}];
  document.getElementById('nav-tabs').innerHTML = tabs.map(t =>
    `<button class="nav-tab${currentTab===t.id?' active':''}" onclick="switchTab('${t.id}')">${t.label}</button>`
  ).join('');
}

function switchTab(tab) {
  currentTab = tab;
  renderNav();
  const c = document.getElementById('main-content');
  const pages = {
    jobs: renderJobs, dashboard: renderDashboard,
    ats: renderATS, interviews: renderInterviews, profile: renderProfile
  };
  if (pages[tab]) pages[tab](c);
}

// =====================================================================
// JOBS PAGE
// =====================================================================
function renderJobs(c) {
  const jobs = DB.get('jobs').filter(j => j.status === 'active');
  c.innerHTML = `
    <div class="sec-hd">
      <div>
        <div class="sec-title">Vị trí đang tuyển dụng</div>
        <div class="sec-sub">Tìm kiếm và ứng tuyển vào các vị trí phù hợp</div>
      </div>
      ${currentUser.role==='recruiter'?`<button class="btn btn-green btn-sm" onclick="openCreateJob()">+ Đăng công việc</button>`:''}
    </div>
    <div class="search-bar">
      <input class="fi" id="job-search" placeholder="🔍  Tìm kiếm chức danh, kỹ năng..." oninput="filterJobs()" style="flex:2">
      <select class="fi" id="job-type" onchange="filterJobs()" style="max-width:180px">
        <option value="">Loại hình: Tất cả</option>
        <option value="Internship">Thực tập</option>
        <option value="Full-time">Toàn thời gian</option>
        <option value="Part-time">Bán thời gian</option>
        <option value="Remote">Remote</option>
      </select>
    </div>
    <div class="jobs-grid" id="jobs-list">
      ${jobs.map(job => jobCard(job)).join('')}
    </div>`;
}

function jobCard(job) {
  const apps = DB.get('applications');
  const applied = apps.some(a => a.job_id===job.id && a.candidate_id===currentUser.id);
  return `<div class="job-card" onclick="openJobDetail('${job.id}')">
    <div class="job-dept">${job.department}</div>
    <div class="job-title">${job.title}</div>
    <div class="job-meta">
      <div class="job-meta-row"><span class="material-symbols-rounded">location_on</span> ${job.location}</div>
      <div class="job-meta-row"><span class="material-symbols-rounded">payments</span> ${job.salary_range||'Thỏa thuận'}</div>
    </div>
    <span class="job-type-badge">${job.type}</span>
    <p class="job-desc" style="margin-top:10px">${job.description}</p>
    ${currentUser.role==='candidate'
      ? (applied ? `<button class="btn btn-dark btn-sm" style="width:100%;color:#1ed760" disabled>✓ Đã ứng tuyển</button>`
                 : `<button class="btn btn-green btn-sm" style="width:100%" onclick="event.stopPropagation();openApply('${job.id}')">Ứng tuyển ngay</button>`)
      : `<button class="btn btn-dark btn-sm" style="width:100%">Xem chi tiết →</button>`}
  </div>`;
}

function filterJobs() {
  const q = document.getElementById('job-search').value.toLowerCase();
  const type = document.getElementById('job-type').value;
  const jobs = DB.get('jobs').filter(j => {
    const matchQ = !q || j.title.toLowerCase().includes(q) || j.description.toLowerCase().includes(q);
    const matchT = !type || j.type === type;
    return j.status==='active' && matchQ && matchT;
  });
  document.getElementById('jobs-list').innerHTML = jobs.length
    ? jobs.map(job => jobCard(job)).join('')
    : `<div style="grid-column:1/-1;text-align:center;padding:48px;color:var(--muted)">Không tìm thấy vị trí phù hợp.</div>`;
}

function openJobDetail(jobId) {
  const job = DB.get('jobs').find(j => j.id === jobId);
  if (!job) return;
  const apps = DB.get('applications');
  const applied = apps.some(a => a.job_id===jobId && a.candidate_id===currentUser.id);
  openModal(`<div class="modal">
    <div class="modal-hd">
      <div>
        <div style="font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:var(--green);margin-bottom:4px">${job.department}</div>
        <div class="modal-title">${job.title}</div>
        <div style="font-size:12px;color:var(--muted);margin-top:4px"><span class="material-symbols-rounded">location_on</span> ${job.location} &nbsp;•&nbsp; <span class="material-symbols-rounded">payments</span> ${job.salary_range||'Thỏa thuận'} &nbsp;•&nbsp; ${job.type}</div>
      </div>
      <button class="close-btn" onclick="closeModal()">✕</button>
    </div>
    <div style="margin-bottom:16px">
      <div style="font-size:13px;font-weight:700;color:var(--near);margin-bottom:6px">Mô tả công việc</div>
      <p style="font-size:13px;color:var(--muted);line-height:1.65">${job.description}</p>
    </div>
    <div style="margin-bottom:24px">
      <div style="font-size:13px;font-weight:700;color:var(--near);margin-bottom:6px">Yêu cầu ứng viên</div>
      <p style="font-size:13px;color:var(--muted);line-height:1.65">${job.requirements}</p>
    </div>
    ${currentUser.role==='candidate'
      ? (applied
          ? `<button class="btn btn-dark" style="width:100%;color:var(--green)" disabled>✓ Bạn đã ứng tuyển vị trí này</button>`
          : `<button class="btn btn-green" style="width:100%" onclick="closeModal();openApply('${job.id}')">Ứng tuyển ngay →</button>`)
      : `<button class="btn btn-dark" style="width:100%" onclick="closeModal()">Đóng</button>`}
  </div>`);
}

function openApply(jobId) {
  const job = DB.get('jobs').find(j => j.id === jobId);
  openModal(`<div class="modal">
    <div class="modal-hd">
      <div>
        <div class="modal-title">Nộp đơn ứng tuyển</div>
        <div class="modal-sub">Vị trí: ${job?.title}</div>
      </div>
      <button class="close-btn" onclick="closeModal()">✕</button>
    </div>
    <div class="form-group">
      <label class="fl">Link CV cá nhân (Google Drive / PDF)</label>
      <input id="ap-cv" type="url" class="fi" value="${currentUser.resume_url||''}" placeholder="https://drive.google.com/...">
    </div>
    <div class="form-group">
      <label class="fl">Thư giới thiệu (Cover Letter)</label>
      <textarea id="ap-cl" class="fi" placeholder="Chia sẻ lý do bạn phù hợp với vị trí này..."></textarea>
    </div>
    <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:8px">
      <button class="btn btn-dark btn-sm" onclick="closeModal()">Hủy</button>
      <button class="btn btn-green btn-sm" onclick="submitApply('${jobId}')">Xác nhận nộp đơn</button>
    </div>
  </div>`);
}

function submitApply(jobId) {
  const cv = document.getElementById('ap-cv').value.trim();
  const cl = document.getElementById('ap-cl').value.trim();
  if (!cl) { toast('Vui lòng điền thư giới thiệu!', 'err'); return; }
  const apps = DB.get('applications');
  if (apps.some(a => a.job_id===jobId && a.candidate_id===currentUser.id)) {
    toast('Bạn đã ứng tuyển vị trí này rồi!', 'err'); closeModal(); return;
  }
  apps.unshift({id:'app-'+Math.random().toString(36).substr(2,8), job_id:jobId, candidate_id:currentUser.id, status:'applied', resume_url:cv, cover_letter:cl, applied_at:new Date().toISOString()});
  DB.set('applications', apps);
  const job = DB.get('jobs').find(j=>j.id===jobId);
  toast(`Đã nộp đơn ứng tuyển thành công cho vị trí ${job?.title}!`);
  closeModal();
  switchTab('jobs');
}

// =====================================================================
// CANDIDATE DASHBOARD
// =====================================================================
function renderDashboard(c) {
  const apps = DB.get('applications').filter(a => a.candidate_id === currentUser.id);
  const jobs = DB.get('jobs');
  const ivs = DB.get('interviews');
  const statuses = ['applied','screening','interviewing','offered'];
  const enriched = apps.map(a => ({...a, job: jobs.find(j=>j.id===a.job_id)})).sort((a,b)=>new Date(b.applied_at)-new Date(a.applied_at));
  c.innerHTML = `
    <div class="sec-hd">
      <div><div class="sec-title">Đơn ứng tuyển của bạn</div><div class="sec-sub">Theo dõi tiến trình hồ sơ đến từng nhà tuyển dụng</div></div>
      <button class="btn btn-green btn-sm" onclick="switchTab('jobs')">+ Tìm việc mới</button>
    </div>
    <div class="status-cards">
      ${['applied','screening','interviewing','offered'].map(s => {
        const n = apps.filter(a=>a.status===s).length;
        const labels = {applied:'Đã nộp',screening:'Sàng lọc',interviewing:'Phỏng vấn',offered:'Nhận Offer'};
        const colors = {applied:getComputedStyle(document.documentElement).getPropertyValue('--blue'),screening:'var(--orange)',interviewing:'var(--green)',offered:'var(--green)'};
        return `<div class="stat-card"><div class="stat-num" style="color:${colors[s]}">${n}</div><div class="stat-lbl">${labels[s]}</div></div>`;
      }).join('')}
    </div>
    ${enriched.length===0 ? `<div class="empty"><div class="empty-icon">📂</div><h3>Chưa có đơn ứng tuyển nào</h3><p>Bắt đầu tìm kiếm việc làm phù hợp với kỹ năng của bạn.</p><br><button class="btn btn-green btn-sm" onclick="switchTab('jobs')">Xem việc làm →</button></div>` :
    `<div class="app-list">${enriched.map(a => {
      const iv = ivs.find(i => i.application_id === a.id);
      return `<div class="app-item">
        <div class="app-item-info">
          <h4>${a.job?.title||'—'}</h4>
          <p>${a.job?.department||''} &nbsp;•&nbsp; ${a.job?.location||''} &nbsp;•&nbsp; Nộp ${new Date(a.applied_at).toLocaleDateString('vi-VN')}</p>
          ${iv ? `<p style="margin-top:6px;font-size:12px;color:var(--green)"><span class="material-symbols-rounded">calendar_month</span> Phỏng vấn: ${new Date(iv.scheduled_at).toLocaleString('vi-VN')} ${iv.meeting_link?`— <a href="${iv.meeting_link}" target="_blank" style="color:var(--green)">Vào Meet →</a>`:''}</p>` : ''}
          ${iv?.feedback ? `<p style="margin-top:4px;font-size:12px;color:var(--muted)">Nhận xét: ${iv.feedback}</p>` : ''}
        </div>
        <span class="badge b-${a.status}">${{applied:'Đã nộp',screening:'Sàng lọc',interviewing:'Phỏng vấn',offered:'Nhận Offer',rejected:'Từ chối'}[a.status]||a.status}</span>
      </div>`;
    }).join('')}</div>`}`;
}

// =====================================================================
// ATS BOARD
// =====================================================================
const ATS_COLS = [
  {id:'applied', label:'Hồ sơ mới'},
  {id:'screening', label:'Sàng lọc'},
  {id:'interviewing', label:'Phỏng vấn'},
  {id:'offered', label:'Nhận Offer'},
  {id:'rejected', label:'Từ chối'}
];

function renderATS(c) {
  const jobs = DB.get('jobs');
  const jobId = c.dataset.atsJob || '';
  c.innerHTML = `
    <div class="sec-hd">
      <div><div class="sec-title">Bảng ATS Kanban</div><div class="sec-sub">Quản lý toàn bộ phễu tuyển dụng theo thời gian thực</div></div>
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
        <select class="fi" style="max-width:220px" onchange="filterATS(this.value)">
          <option value="">Tất cả vị trí</option>
          ${jobs.map(j=>`<option value="${j.id}"${j.id===jobId?' selected':''}>${j.title}</option>`).join('')}
        </select>
        <button class="btn btn-green btn-sm" onclick="openCreateJob()">+ Đăng tuyển</button>
      </div>
    </div>
    <div class="ats-wrap"><div class="ats-board">${ATS_COLS.map(col => atsCol(col, jobId)).join('')}</div></div>`;
}

function filterATS(jobId) {
  const c = document.getElementById('main-content');
  c.dataset.atsJob = jobId;
  renderATS(c);
}

function atsCol(col, filterJobId) {
  const apps = DB.get('applications').filter(a => a.status === col.id && (!filterJobId || a.job_id === filterJobId));
  const profiles = DB.get('profiles');
  const jobs = DB.get('jobs');
  const ivs = DB.get('interviews');
  const enriched = apps.map(a => ({...a, candidate: profiles.find(p=>p.id===a.candidate_id), job: jobs.find(j=>j.id===a.job_id), interview: ivs.find(i=>i.application_id===a.id)}));
  return `<div class="ats-col col-${col.id}">
    <div class="ats-col-hd">${col.label}<span class="cnt">${apps.length}</span></div>
    ${enriched.map(a => atsCandCard(a, col.id)).join('')}
  </div>`;
}

function atsCandCard(a, status) {
  const stars = a.interview?.score ? '<span class="material-symbols-rounded" style="color:gold;font-variation-settings:\'FILL\' 1">star</span>'.repeat(a.interview.score)+'<span class="material-symbols-rounded" style="color:gold;font-variation-settings:\'FILL\' 0">star</span>'.repeat(5-a.interview.score) : '';
  return `<div class="cand-card">
    <div class="cc-name">${a.candidate?.full_name||'—'}</div>
    <div class="cc-role">${a.job?.title||'—'}</div>
    ${(a.candidate?.skills||[]).length ? `<div class="cc-skills">${a.candidate.skills.slice(0,3).map(s=>`<span class="skill-tag">${s}</span>`).join('')}</div>` : ''}
    <div class="cc-actions">
      ${status==='applied' ? `<button class="btn btn-dark btn-xs" onclick="updateStatus('${a.id}','screening')">Sàng lọc →</button>` : ''}
      ${status==='screening' ? `<div style="display:flex;gap:4px"><button class="btn btn-green btn-xs" style="flex:1" onclick="openScheduleIV('${a.id}')"><span class="material-symbols-rounded">calendar_month</span> Lên lịch PV</button><button class="btn btn-red btn-xs" onclick="updateStatus('${a.id}','rejected')">✕</button></div>` : ''}
      ${status==='interviewing' && !a.interview ? `<button class="btn btn-green btn-xs" style="width:100%" onclick="openScheduleIV('${a.id}')"><span class="material-symbols-rounded">calendar_month</span> Lên lịch PV</button>` : ''}
      ${status==='interviewing' && a.interview ? `<div style="font-size:10px;color:var(--orange);margin-bottom:5px"><span class="material-symbols-rounded">schedule</span> ${new Date(a.interview.scheduled_at).toLocaleDateString('vi-VN')}</div>${a.interview.score?`<div class="cc-stars">${'<span class="material-symbols-rounded" style="color:gold;font-variation-settings:\'FILL\' 1">star</span>'.repeat(a.interview.score)+'<span class="material-symbols-rounded" style="color:gold;font-variation-settings:\'FILL\' 0">star</span>'.repeat(5-a.interview.score)} ${a.interview.score}/5</div>`:`<button class="btn btn-dark btn-xs" style="width:100%" onclick="openEval('${a.interview.id}','${a.id}')"><span class="material-symbols-rounded" style="color:gold;font-variation-settings:\'FILL\' 1">star</span> Đánh giá</button>`}<div style="display:flex;gap:4px;margin-top:5px"><button class="btn btn-green btn-xs" style="flex:1" onclick="updateStatus('${a.id}','offered')">Offer</button><button class="btn btn-red btn-xs" onclick="updateStatus('${a.id}','rejected')">Loại</button></div>` : ''}
      ${status==='offered' ? `<div style="color:var(--green);font-size:11px;font-weight:700">✓ Đã gửi Offer</div>${stars?`<div class="cc-stars">${stars}</div>`:''}` : ''}
      ${status==='rejected' ? `<div style="color:var(--red);font-size:11px;font-weight:700">✕ Đã từ chối</div>` : ''}
    </div>
    <div class="cc-date">${a.resume_url?`<a href="${a.resume_url}" target="_blank" style="color:var(--green);font-size:10px">📎 Xem CV</a> &nbsp;•&nbsp; `:''}<span>${new Date(a.applied_at).toLocaleDateString('vi-VN')}</span></div>
  </div>`;
}

function updateStatus(appId, status) {
  const apps = DB.get('applications');
  const idx = apps.findIndex(a=>a.id===appId);
  if (idx<0) return;
  apps[idx].status = status;
  DB.set('applications', apps);
  const labels = {screening:'Đã chuyển sang Sàng lọc',interviewing:'Đã chuyển sang Phỏng vấn',offered:'Đã gửi Offer!',rejected:'Đã từ chối ứng viên'};
  toast(labels[status]||'Đã cập nhật');
  renderATS(document.getElementById('main-content'));
}

function openScheduleIV(appId) {
  const now = new Date(); now.setDate(now.getDate()+3); now.setHours(9,0,0,0);
  const dtLocal = now.toISOString().slice(0,16);
  openModal(`<div class="modal">
    <div class="modal-hd"><div><div class="modal-title">Đặt lịch phỏng vấn</div></div><button class="close-btn" onclick="closeModal()">✕</button></div>
    <div class="form-group"><label class="fl">Thời gian phỏng vấn</label><input id="iv-dt" type="datetime-local" class="fi" value="${dtLocal}"></div>
    <div class="form-group"><label class="fl">Người phỏng vấn</label><input id="iv-iwr" type="text" class="fi" value="${currentUser.full_name}" placeholder="Tên người phỏng vấn"></div>
    <div class="form-group"><label class="fl">Link họp (Google Meet / Zoom)</label><input id="iv-link" type="url" class="fi" placeholder="https://meet.google.com/abc-xyz"></div>
    <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:8px">
      <button class="btn btn-dark btn-sm" onclick="closeModal()">Hủy</button>
      <button class="btn btn-green btn-sm" onclick="submitScheduleIV('${appId}')">Lưu lịch hẹn</button>
    </div>
  </div>`);
}

function submitScheduleIV(appId) {
  const dt = document.getElementById('iv-dt').value;
  const iwr = document.getElementById('iv-iwr').value.trim();
  const link = document.getElementById('iv-link').value.trim();
  if (!dt||!iwr) { toast('Vui lòng điền đầy đủ thông tin!','err'); return; }
  const ivs = DB.get('interviews');
  ivs.push({id:'iv-'+Math.random().toString(36).substr(2,8), application_id:appId, scheduled_at:new Date(dt).toISOString(), interviewer_name:iwr, meeting_link:link, created_at:new Date().toISOString()});
  DB.set('interviews', ivs);
  updateStatus(appId, 'interviewing');
  toast('Đã lên lịch phỏng vấn thành công!');
  closeModal();
}

let evalScore = 0;

function openEval(ivId, appId) {
  evalScore = 0;
  openModal(`<div class="modal">
    <div class="modal-hd"><div><div class="modal-title">Đánh giá phỏng vấn</div></div><button class="close-btn" onclick="closeModal()">✕</button></div>
    <div class="form-group">
      <label class="fl">Điểm đánh giá</label>
      <div class="star-row">${[1,2,3,4,5].map(n=>`<button class="star-btn" id="star-${n}" onclick="setEvalScore(${n})">${n} <span class="material-symbols-rounded" style="color:gold;font-variation-settings:\'FILL\' 1">star</span></button>`).join('')}</div>
    </div>
    <div class="form-group"><label class="fl">Nhận xét chi tiết</label><textarea id="ev-fb" class="fi" placeholder="Chuyên môn, thái độ, điểm mạnh, điểm cần cải thiện..."></textarea></div>
    <div class="form-group">
      <label class="fl">Cập nhật trạng thái hồ sơ</label>
      <select id="ev-status" class="fi">
        <option value="">Giữ nguyên (Đang phỏng vấn)</option>
        <option value="offered">Chấp nhận — Gửi Offer</option>
        <option value="rejected">Từ chối ứng viên</option>
      </select>
    </div>
    <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:8px">
      <button class="btn btn-dark btn-sm" onclick="closeModal()">Hủy</button>
      <button class="btn btn-green btn-sm" onclick="submitEval('${ivId}','${appId}')">Lưu đánh giá</button>
    </div>
  </div>`);
}

function setEvalScore(n) {
  evalScore = n;
  for(let i=1;i<=5;i++) {
    const el=document.getElementById('star-'+i);
    if(el) el.className='star-btn'+(i<=n?' active':'');
  }
}

function submitEval(ivId, appId) {
  const fb = document.getElementById('ev-fb').value.trim();
  const st = document.getElementById('ev-status').value;
  if (!fb) { toast('Vui lòng nhập nhận xét!','err'); return; }
  const ivs = DB.get('interviews');
  const idx = ivs.findIndex(i=>i.id===ivId);
  if (idx>=0) { ivs[idx].feedback=fb; ivs[idx].score=evalScore||null; }
  DB.set('interviews', ivs);
  if (st) updateStatus(appId, st);
  toast('Đã lưu đánh giá!');
  closeModal();
  renderATS(document.getElementById('main-content'));
}

// =====================================================================
// CREATE JOB
// =====================================================================
function openCreateJob() {
  openModal(`<div class="modal" style="max-width:560px">
    <div class="modal-hd"><div class="modal-title">Đăng tin tuyển dụng</div><button class="close-btn" onclick="closeModal()">✕</button></div>
    <div class="g2">
      <div class="form-group"><label class="fl">Chức danh công việc</label><input id="cj-title" type="text" class="fi" placeholder="Frontend Developer Intern" style="width:100%"></div>
      <div class="form-group"><label class="fl">Phòng ban</label><select id="cj-dept" class="fi">
        <option>Engineering</option><option>Product & Design</option><option>Marketing</option><option>Human Resources</option>
      </select></div>
    </div>
    <div class="g2">
      <div class="form-group"><label class="fl">Địa điểm</label><input id="cj-loc" type="text" class="fi" placeholder="Hà Nội (Hybrid)"></div>
      <div class="form-group"><label class="fl">Loại hình</label><select id="cj-type" class="fi">
        <option value="Internship">Thực tập</option><option value="Full-time">Toàn thời gian</option><option value="Part-time">Bán thời gian</option><option value="Remote">Remote</option>
      </select></div>
    </div>
    <div class="form-group"><label class="fl">Mức lương hỗ trợ</label><input id="cj-sal" type="text" class="fi" placeholder="5,000,000 – 8,000,000 VND"></div>
    <div class="form-group"><label class="fl">Mô tả công việc</label><textarea id="cj-desc" class="fi" placeholder="Mô tả nhiệm vụ và môi trường làm việc..."></textarea></div>
    <div class="form-group"><label class="fl">Yêu cầu ứng viên</label><textarea id="cj-req" class="fi" placeholder="Kỹ năng, kinh nghiệm, thái độ cần có..."></textarea></div>
    <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:8px">
      <button class="btn btn-dark btn-sm" onclick="closeModal()">Hủy</button>
      <button class="btn btn-green btn-sm" onclick="submitCreateJob()">Đăng tin</button>
    </div>
  </div>`);
}

function submitCreateJob() {
  const title = document.getElementById('cj-title').value.trim();
  const loc = document.getElementById('cj-loc').value.trim();
  const desc = document.getElementById('cj-desc').value.trim();
  const req = document.getElementById('cj-req').value.trim();
  if (!title||!loc||!desc||!req) { toast('Vui lòng điền đầy đủ thông tin!','err'); return; }
  const jobs = DB.get('jobs');
  jobs.unshift({
    id:'job-'+Math.random().toString(36).substr(2,8),
    title, department:document.getElementById('cj-dept').value,
    location:loc, type:document.getElementById('cj-type').value,
    salary_range:document.getElementById('cj-sal').value,
    description:desc, requirements:req, status:'active',
    created_at:new Date().toISOString()
  });
  DB.set('jobs', jobs);
  toast('Đã đăng tin tuyển dụng thành công!');
  closeModal();
  switchTab(currentUser.role==='recruiter'?'ats':'jobs');
}

// =====================================================================
// INTERVIEWS PAGE
// =====================================================================
function renderInterviews(c) {
  const ivs = DB.get('interviews');
  const apps = DB.get('applications');
  const jobs = DB.get('jobs');
  const profiles = DB.get('profiles');
  let data = ivs.map(iv => {
    const app = apps.find(a=>a.id===iv.application_id);
    const job = jobs.find(j=>j.id===app?.job_id);
    const cand = profiles.find(p=>p.id===app?.candidate_id);
    return {...iv, app, job, cand};
  });
  if (currentUser.role === 'candidate') {
    data = data.filter(iv => iv.app?.candidate_id === currentUser.id);
  }
  data.sort((a,b)=>new Date(a.scheduled_at)-new Date(b.scheduled_at));
  c.innerHTML = `
    <div class="sec-hd"><div>
      <div class="sec-title">Lịch phỏng vấn</div>
      <div class="sec-sub">${currentUser.role==='recruiter'?'Tất cả buổi phỏng vấn đã được lên lịch':'Các buổi phỏng vấn của bạn'}</div>
    </div></div>
    <div class="card" style="padding:0;overflow:hidden">
      ${data.length===0
        ? `<div class="empty" style="padding:48px"><div class="empty-icon"><span class="material-symbols-rounded">calendar_month</span></div><h3>Chưa có lịch phỏng vấn</h3><p>Lịch phỏng vấn sẽ xuất hiện sau khi HR lên lịch hẹn.</p></div>`
        : `<table class="iv-table"><thead><tr>
            <th>Ứng viên</th><th>Vị trí</th><th>Thời gian</th>
            <th>Người PV</th><th>Link họp</th><th>Điểm / Nhận xét</th>
            ${currentUser.role==='recruiter'?'<th></th>':''}
          </tr></thead><tbody>
          ${data.map(iv=>`<tr>
            <td><strong>${iv.cand?.full_name||'—'}</strong><br><span style="color:var(--muted);font-size:11px">${iv.cand?.email||''}</span></td>
            <td>${iv.job?.title||'—'}</td>
            <td><strong>${new Date(iv.scheduled_at).toLocaleDateString('vi-VN')}</strong><br><span style="color:var(--muted);font-size:11px">${new Date(iv.scheduled_at).toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'})}</span></td>
            <td>${iv.interviewer_name}</td>
            <td>${iv.meeting_link?`<a href="${iv.meeting_link}" target="_blank" class="btn btn-green btn-xs">Vào Meet →</a>`:'—'}</td>
            <td>
              ${iv.score?`<div style="color:var(--orange)">${'<span class="material-symbols-rounded" style="color:gold;font-variation-settings:\'FILL\' 1">star</span>'.repeat(iv.score)+'<span class="material-symbols-rounded" style="color:gold;font-variation-settings:\'FILL\' 0">star</span>'.repeat(5-iv.score)} ${iv.score}/5</div>`:''}
              ${iv.feedback?`<div style="font-size:11px;color:var(--muted);margin-top:3px">${iv.feedback}</div>`:(iv.score?'':`<span style="color:var(--muted);font-size:11px">Chưa đánh giá</span>`)}
            </td>
            ${currentUser.role==='recruiter'?`<td>${!iv.score?`<button class="btn btn-dark btn-xs" onclick="openEval('${iv.id}','${iv.app?.id}')"><span class="material-symbols-rounded" style="color:gold;font-variation-settings:\'FILL\' 1">star</span> Đánh giá</button>`:'—'}</td>`:''}`
          ).join('</tr>')}
          </tbody></table>`}
    </div>`;
}

// =====================================================================
// PROFILE PAGE
// =====================================================================
function renderProfile(c) {
  const u = DB.get('profiles').find(p=>p.id===currentUser.id) || currentUser;
  const skills = u.skills || [];
  c.innerHTML = `
    <div class="sec-hd"><div><div class="sec-title">Hồ sơ cá nhân</div><div class="sec-sub">Cập nhật thông tin và kỹ năng để nhà tuyển dụng dễ tìm thấy bạn</div></div></div>
    <div class="profile-wrap">
      <div class="card">
        <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px;padding-bottom:20px;border-bottom:1px solid var(--border)">
          <div style="width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,var(--green),#169c46);display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:800;color:#000;flex-shrink:0">${(u.full_name||u.email||'?')[0].toUpperCase()}</div>
          <div>
            <div style="font-size:18px;font-weight:700">${u.full_name||'—'}</div>
            <div style="font-size:12px;color:var(--muted)">${u.email}</div>
            <span class="badge b-${u.role}" style="margin-top:6px">${u.role==='recruiter'?'<span class="material-symbols-rounded">domain</span> Nhà tuyển dụng':'<span class="material-symbols-rounded">person</span> Ứng viên thực tập'}</span>
          </div>
        </div>
        <form onsubmit="saveProfile(event)">
          <div class="form-group">
            <label class="fl">Họ và Tên</label>
            <input id="pf-name" type="text" class="fi" value="${u.full_name||''}" required>
          </div>
          <div class="form-group">
            <label class="fl">Email (không thể thay đổi)</label>
            <input type="email" class="fi" value="${u.email}" disabled style="opacity:.5">
          </div>
          ${u.role==='candidate'?`
          <div class="form-group">
            <label class="fl">Link CV cá nhân (Google Drive / PDF)</label>
            <input id="pf-cv" type="url" class="fi" value="${u.resume_url||''}" placeholder="https://drive.google.com/...">
          </div>
          <div class="form-group">
            <label class="fl">Giới thiệu bản thân (Bio)</label>
            <textarea id="pf-bio" class="fi">${u.bio||''}</textarea>
          </div>
          <div class="form-group">
            <label class="fl">Kỹ năng nổi bật</label>
            <div style="display:flex;gap:8px;margin-bottom:10px">
              <input id="pf-skill-input" type="text" class="fi" placeholder="React, SQL, Python... rồi nhấn Enter" onkeydown="if(event.key==='Enter'){event.preventDefault();addSkill()}">
              <button type="button" class="btn btn-dark btn-sm" onclick="addSkill()">Thêm</button>
            </div>
            <div class="skills-list" id="skills-display">
              ${skills.map(s=>`<span class="skill-chip">${s}<button type="button" onclick="removeSkill('${s}')">×</button></span>`).join('')}
              ${!skills.length?`<span style="font-size:12px;color:var(--muted)">Chưa có kỹ năng nào</span>`:''}
            </div>
          </div>`:''}
          <div style="display:flex;justify-content:flex-end;margin-top:20px">
            <button type="submit" class="btn btn-green">Lưu thay đổi</button>
          </div>
        </form>
      </div>
    </div>`;
}

let profileSkills = [];

function addSkill() {
  const input = document.getElementById('pf-skill-input');
  if (!input) return;
  const val = input.value.trim();
  const u = DB.get('profiles').find(p=>p.id===currentUser.id) || currentUser;
  if (!val) return;
  if (!u.skills) u.skills = [];
  if (u.skills.includes(val)) { toast('Kỹ năng này đã có rồi!','err'); return; }
  u.skills.push(val);
  const profiles = DB.get('profiles');
  const idx = profiles.findIndex(p=>p.id===u.id);
  if (idx>=0) profiles[idx]=u; else profiles.push(u);
  DB.set('profiles', profiles);
  input.value='';
  renderSkills(u.skills);
}

function removeSkill(sk) {
  const u = DB.get('profiles').find(p=>p.id===currentUser.id) || currentUser;
  u.skills = (u.skills||[]).filter(s=>s!==sk);
  const profiles = DB.get('profiles');
  const idx = profiles.findIndex(p=>p.id===u.id);
  if (idx>=0) profiles[idx]=u;
  DB.set('profiles', profiles);
  renderSkills(u.skills);
}

function renderSkills(skills) {
  const el = document.getElementById('skills-display');
  if (!el) return;
  el.innerHTML = skills.length
    ? skills.map(s=>`<span class="skill-chip">${s}<button type="button" onclick="removeSkill('${s}')">×</button></span>`).join('')
    : `<span style="font-size:12px;color:var(--muted)">Chưa có kỹ năng nào</span>`;
}

function saveProfile(e) {
  e.preventDefault();
  const profiles = DB.get('profiles');
  const idx = profiles.findIndex(p=>p.id===currentUser.id);
  const u = idx>=0?profiles[idx]:{...currentUser};
  u.full_name = document.getElementById('pf-name').value.trim();
  const cvEl = document.getElementById('pf-cv');
  const bioEl = document.getElementById('pf-bio');
  if (cvEl) u.resume_url = cvEl.value.trim();
  if (bioEl) u.bio = bioEl.value.trim();
  if (idx>=0) profiles[idx]=u; else profiles.push(u);
  DB.set('profiles', profiles);
  DB.setSession(u);
  currentUser = u;
  document.getElementById('nav-user-info').innerHTML = `<strong>${u.full_name||u.email}</strong><em>${u.role==='recruiter'?'Nhà tuyển dụng':'Ứng viên thực tập'}</em>`;
  toast('Đã lưu thông tin cá nhân!');
}

function seedData() {
  if (!localStorage.getItem('hf_seeded_v2')) {
    DB.set('profiles', [
      {id:'usr-1',email:'ungvien@tuyenthuctap.vn',full_name:'Nguyễn Văn An',role:'candidate',skills:['React','CSS','JavaScript'],bio:'Sinh viên CNTT năm 4, đam mê Frontend.',resume_url:'https://drive.google.com/'},
      {id:'usr-2',email:'hr@tuyenthuctap.vn',full_name:'Trần Thị Hương',role:'recruiter',skills:[],bio:'',resume_url:''},
    ]);
    DB.set('jobs', [
      {id:'j-1',title:'Frontend Developer Intern',department:'Engineering',location:'Hanoi, Vietnam (Hybrid)',type:'Internship',salary_range:'5,000,000 - 8,000,000 VND',status:'active'},
      {id:'j-2',title:'Backend Engineer Intern (Node.js)',department:'Engineering',location:'Ho Chi Minh City, Vietnam',type:'Internship',salary_range:'6,000,000 - 9,000,000 VND',status:'active'},
      {id:'j-3',title:'UI/UX Designer Intern',department:'Product & Design',location:'Remote',type:'Internship',salary_range:'4,000,000 - 6,000,000 VND',status:'active'},
      {id:'j-4',title:'Data Analyst Intern',department:'Data',location:'Hanoi, Vietnam',type:'Internship',salary_range:'5,000,000 - 7,000,000 VND',status:'active'},
      {id:'j-5',title:'QA/QC Tester Intern',department:'Engineering',location:'Da Nang, Vietnam',type:'Internship',salary_range:'4,000,000 - 6,000,000 VND',status:'active'},
      {id:'j-6',title:'Product Management Intern',department:'Product',location:'Hanoi, Vietnam (Hybrid)',type:'Internship',salary_range:'5,000,000 - 8,000,000 VND',status:'active'},
      {id:'j-7',title:'Digital Marketing Intern',department:'Marketing',location:'Remote',type:'Internship',salary_range:'3,000,000 - 5,000,000 VND',status:'active'}
    ]);
    DB.set('applications', [
      {id:'a-1',job_id:'j-1',candidate_id:'usr-1',status:'col-new',applied_at:new Date().toISOString(),resume_url:'https://drive.google.com/'}
    ]);
    DB.set('interviews', []);
    localStorage.setItem('hf_seeded_v2', '1');
  }
}

// =====================================================================
// INIT
// =====================================================================
seedData();
renderAuth();

const savedUser = DB.session();
if (savedUser) {
  startApp(savedUser);
} else {
  // If came from landing page with a hash, show register
  if (window.location.hash === '#register') { authMode = 'register'; renderAuth(); }
}

async function screenCVAI(appId) {
  const resDiv = document.getElementById('ai-result');
  resDiv.innerHTML = '<div style="margin-top:15px;color:#1ed760;font-weight:bold;"><span class="material-symbols-rounded">smart_toy</span> AI đang phân tích CV... vui lòng chờ...</div>';
  
  try {
    const aiResult = await API.post('/ai/screen-cv', { application_id: appId });
    
    let color = '#1ed760';
    if(aiResult.score < 50) color = '#e91429';
    else if(aiResult.score < 75) color = '#ffa42b';
    
    resDiv.innerHTML = `
      <div style="margin-top:15px; padding:15px; border:1px solid #ddd; border-radius:8px; background:#f9f9f9;">
        <div style="font-weight:bold; font-size:18px; display:flex; align-items:center; gap:8px;">
          <span class="material-symbols-rounded">smart_toy</span> AI Score: <span style="color:${color}">${aiResult.score}%</span>
        </div>
        <p style="margin-top:8px; font-size:14px; color:#444;">${aiResult.feedback}</p>
      </div>
    `;
  } catch(err) {
    resDiv.innerHTML = '<div style="margin-top:15px;color:red;">Lỗi phân tích AI</div>';
  }
}
