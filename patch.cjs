const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

const apiLayer = `
const API_URL = 'http://localhost:3000/api';

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
`;

code = code.replace(/const DB = \{[\s\S]*?\};\s*(\/\/ Seed data[\s\S]*?\}\s*\})?/m, `const DB = {
  session: () => JSON.parse(localStorage.getItem('hf_session') || 'null'),
  setSession: (u) => localStorage.setItem('hf_session', JSON.stringify(u)),
  clearSession: () => localStorage.removeItem('hf_session'),
};
` + apiLayer);

code = code.replace(/function doLogin\(e\) \{[\s\S]*?toast\('\?ng nh-p thAnh cA'ng'\);[\s\S]*?\}/m, `async function doLogin(e) {
  e.preventDefault();
  const email = document.getElementById('l-email').value;
  try {
    const user = await API.post('/auth/login', { email });
    if (user.error) throw new Error('Email không tồn tại');
    DB.setSession(user);
    startApp();
    toast('Đăng nhập thành công');
  } catch(err) {
    toast('Đăng nhập thất bại: ' + err.message, 'err');
  }
}`);

code = code.replace(/function doRegister\(e\) \{[\s\S]*?toast\('To tAi khon thAnh cA'ng'\);[\s\S]*?\}/m, `async function doRegister(e) {
  e.preventDefault();
  const name = document.getElementById('r-name').value;
  const email = document.getElementById('r-email').value;
  const role = regRole;
  try {
    const user = await API.post('/auth/register', { email, full_name: name, role });
    DB.setSession(user);
    startApp();
    toast('Tạo tài khoản thành công');
  } catch(err) {
    toast('Đăng ký thất bại', 'err');
  }
}`);

code = code.replace(/function quickLogin\(email\) \{[\s\S]*?toast\('\?ng nh-p nhanh thAnh cA'ng'\);[\s\S]*?\}/m, `async function quickLogin(email) {
  try {
    const user = await API.post('/auth/login', { email });
    DB.setSession(user);
    startApp();
    toast('Đăng nhập nhanh thành công');
  } catch(err) {
    toast('Lỗi đăng nhập', 'err');
  }
}`);

code = code.replace(/function renderJobs\(\) \{[\s\S]*?document\.getElementById\('main-content'\)\.innerHTML = html;\s*\}/m, `async function renderJobs() {
  const jobs = await API.get('/jobs');
  let html = '<div class="header-bar"><h2>Tìm việc thực tập</h2></div><div class="jobs-grid">';
  jobs.forEach(j => {
    html += \`<div class="job-card">
      <h3>\${j.title}</h3>
      <div class="job-meta">\${j.location} • \${j.type}</div>
      <div class="job-meta">💰 \${j.salary_range}</div>
      <p style="color:#666; font-size:13px; margin:10px 0">\${j.department}</p>
      <button class="btn btn-green" style="width:100%" onclick="applyJob('\${j.id}', '\${j.title}')">Ứng tuyển ngay</button>
    </div>\`;
  });
  html += '</div>';
  document.getElementById('main-content').innerHTML = html;
}`);

code = code.replace(/function submitApply\(e, jid\) \{[\s\S]*?toast\('"ng tuyn thAnh cA'ng!'\);[\s\S]*?\}/m, `async function submitApply(e, jid) {
  e.preventDefault();
  const cv = document.getElementById('a-cv').value;
  const cl = document.getElementById('a-cl').value;
  const me = DB.session();
  try {
    await API.post('/applications', {
      job_id: jid,
      candidate_id: me.id,
      resume_url: cv,
      cover_letter: cl
    });
    closeModal();
    toast('Ứng tuyển thành công!');
    goTab('dashboard');
  } catch(err) {
    toast('Lỗi ứng tuyển', 'err');
  }
}`);

code = code.replace(/function renderDashboard\(\) \{[\s\S]*?document\.getElementById\('main-content'\)\.innerHTML = html;\s*\}/m, `async function renderDashboard() {
  const me = DB.session();
  const apps = await API.get('/applications?candidate_id=' + me.id);
  
  let html = '<div class="header-bar"><h2>Tiến độ ứng tuyển của tôi</h2></div>';
  if(apps.length===0) {
    html += '<div style="padding:40px;text-align:center;color:#666">Chưa có đơn ứng tuyển nào.</div>';
  } else {
    html += '<div class="dash-list">';
    apps.forEach(a => {
      let st = a.status;
      let badge = '';
      if(st==='applied') badge = '<span class="status-badge st-applied">Đã nộp</span>';
      if(st==='screening') badge = '<span class="status-badge st-screening">Đang lọc CV</span>';
      if(st==='interviewing') badge = '<span class="status-badge st-interviewing">Phỏng vấn</span>';
      if(st==='offered') badge = '<span class="status-badge st-offered">Đậu (Offer)</span>';
      if(st==='rejected') badge = '<span class="status-badge st-rejected">Từ chối</span>';

      html += \`<div class="dash-card">
        <div style="flex:1">
          <div style="font-weight:600">\${a.job_title}</div>
          <div style="font-size:12px;color:#666;margin-top:4px">\${a.department}</div>
        </div>
        <div>\${badge}</div>
      </div>\`;
    });
    html += '</div>';
  }
  document.getElementById('main-content').innerHTML = html;
}`);

code = code.replace(/function renderATS\(\) \{[\s\S]*?document\.getElementById\('main-content'\)\.innerHTML = html;\s*\}/m, `async function renderATS() {
  const apps = await API.get('/applications');
  
  const cols = {
    applied: '', screening: '', interviewing: '', offered: '', rejected: ''
  };

  apps.forEach(a => {
    if(!cols[a.status]) cols[a.status] = '';
    cols[a.status] += \`<div class="kanban-card" onclick="viewCandidate('\${a.id}', '\${a.candidate_name}', '\${a.job_title}', '\${a.status}', '\${a.bio}', '\${a.skills}', '\${a.resume_url}')">
      <div style="font-weight:600">\${a.candidate_name}</div>
      <div style="font-size:12px;color:#666;margin-top:4px">Vị trí: \${a.job_title}</div>
    </div>\`;
  });

  let html = \`<div class="header-bar"><h2>ATS Board - Quản lý ứng viên</h2></div>
  <div class="kanban-board">
    <div class="kanban-col">
      <div class="k-title">Đã nộp</div>
      <div class="k-cards">\${cols.applied}</div>
    </div>
    <div class="kanban-col">
      <div class="k-title">Lọc CV</div>
      <div class="k-cards">\${cols.screening}</div>
    </div>
    <div class="kanban-col">
      <div class="k-title">Phỏng vấn</div>
      <div class="k-cards">\${cols.interviewing}</div>
    </div>
    <div class="kanban-col">
      <div class="k-title">Đậu (Offer)</div>
      <div class="k-cards">\${cols.offered}</div>
    </div>
    <div class="kanban-col">
      <div class="k-title">Từ chối</div>
      <div class="k-cards">\${cols.rejected}</div>
    </div>
  </div>\`;
  document.getElementById('main-content').innerHTML = html;
}`);

code = code.replace(/function updateStatus\(aid, st\) \{[\s\S]*?renderATS\(\);\s*\}/m, `async function updateStatus(aid, st) {
  await API.patch('/applications/' + aid + '/status', { status: st });
  closeModal();
  toast('Đã cập nhật trạng thái');
  renderATS();
}`);

code += `
async function screenCVAI(appId) {
  const resDiv = document.getElementById('ai-result');
  resDiv.innerHTML = '<div style="margin-top:15px;color:#1ed760;font-weight:bold;">🤖 AI đang phân tích CV... vui lòng chờ...</div>';
  
  try {
    const aiResult = await API.post('/ai/screen-cv', { application_id: appId });
    
    let color = '#1ed760';
    if(aiResult.score < 50) color = '#e91429';
    else if(aiResult.score < 75) color = '#ffa42b';
    
    resDiv.innerHTML = \`
      <div style="margin-top:15px; padding:15px; border:1px solid #ddd; border-radius:8px; background:#f9f9f9;">
        <div style="font-weight:bold; font-size:18px; display:flex; align-items:center; gap:8px;">
          🤖 AI Score: <span style="color:\${color}">\${aiResult.score}%</span>
        </div>
        <p style="margin-top:8px; font-size:14px; color:#444;">\${aiResult.feedback}</p>
      </div>
    \`;
  } catch(err) {
    resDiv.innerHTML = '<div style="margin-top:15px;color:red;">Lỗi phân tích AI</div>';
  }
}
`;

// Replace viewCandidate to include AI button
code = code.replace(/function viewCandidate\(aid, cname, jtitle, cst\) \{[\s\S]*?openModal\(html\);\s*\}/m, `function viewCandidate(aid, cname, jtitle, cst, bio, skills, resume_url) {
  let html = \`
    <h3>Hồ sơ: \${cname}</h3>
    <div style="font-size:13px;color:#666;margin-bottom:20px">Vị trí ứng tuyển: \${jtitle}</div>
    <div style="margin-bottom:10px"><strong>Kỹ năng:</strong> \${skills}</div>
    <div style="margin-bottom:20px"><strong>Giới thiệu:</strong> \${bio}</div>
    
    <div style="display:flex; gap:10px; margin-bottom:20px;">
      <a href="\${resume_url}" target="_blank" class="btn btn-outline" style="flex:1;text-align:center;text-decoration:none">Xem CV PDF</a>
      <button class="btn btn-green" style="flex:1;" onclick="screenCVAI('\${aid}')">✨ AI Phân Tích CV</button>
    </div>
    
    <div id="ai-result"></div>

    <div style="margin-top:30px; font-weight:600">Cập nhật trạng thái:</div>
    <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:10px">
      <button class="btn btn-outline" onclick="updateStatus('\${aid}', 'applied')">Đã nộp</button>
      <button class="btn btn-outline" onclick="updateStatus('\${aid}', 'screening')">Lọc CV</button>
      <button class="btn btn-outline" onclick="updateStatus('\${aid}', 'interviewing')">Phỏng vấn</button>
      <button class="btn btn-outline" onclick="updateStatus('\${aid}', 'offered')">Đậu</button>
      <button class="btn btn-outline" onclick="updateStatus('\${aid}', 'rejected')">Từ chối</button>
    </div>
  \`;
  openModal(html);
}`);

fs.writeFileSync('app.js', code);
