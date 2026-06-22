const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

// Restore DB.get and DB.set
code = code.replace('session: () => JSON.parse(localStorage.getItem(\'hf_session\') || \'null\'),', 
  'get: (k) => JSON.parse(localStorage.getItem(\'hf_\'+k) || \'[]\'),\n  set: (k, v) => localStorage.setItem(\'hf_\'+k, JSON.stringify(v)),\n  session: () => JSON.parse(localStorage.getItem(\'hf_session\') || \'null\'),');

// Restore seedData
const seedFn = \
function seedData() {
  if (!localStorage.getItem('hf_seeded')) {
    DB.set('profiles', [
      {id:'usr-1',email:'ungvien@tuyenthuctap.vn',full_name:'Nguyễn Văn An',role:'candidate',skills:['React','CSS','JavaScript'],bio:'Sinh viên CNTT năm 4, đam mê Frontend.',resume_url:'https://drive.google.com/'},
      {id:'usr-2',email:'hr@tuyenthuctap.vn',full_name:'Trần Thị Hương',role:'recruiter',skills:[],bio:'',resume_url:''},
    ]);
    DB.set('jobs', [
      {id:'j-1',title:'Frontend Developer Intern',department:'Engineering',location:'Hanoi, Vietnam',type:'Internship',salary_range:'5,000,000 - 8,000,000 VND',status:'active'},
      {id:'j-2',title:'UI/UX Designer Intern',department:'Product & Design',location:'Remote',type:'Internship',salary_range:'4,000,000 - 6,000,000 VND',status:'active'}
    ]);
    DB.set('applications', [
      {id:'a-1',job_id:'j-1',candidate_id:'usr-1',status:'col-new',applied_at:new Date().toISOString(),resume_url:'https://drive.google.com/'}
    ]);
    DB.set('interviews', []);
    localStorage.setItem('hf_seeded', '1');
  }
}
\;

// Insert seedData function before INIT block
code = code.replace('// =====================================================================\n// INIT\n// =====================================================================', 
  seedFn + '\n// =====================================================================\n// INIT\n// =====================================================================');

// Put seedData() back into INIT block
code = code.replace('// seedData();', 'seedData();');
if(!code.includes('seedData();\nrenderAuth();')) {
  code = code.replace('renderAuth();', 'seedData();\nrenderAuth();');
}

fs.writeFileSync('app.js', code, 'utf8');
