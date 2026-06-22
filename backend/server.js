require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const { screenCV } = require('./ai');

const app = express();
app.use(cors());
app.use(express.json());

// MySQL Connection Pool
let pool;

async function initDB() {
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'tuyenthuctap',
      port: process.env.DB_PORT || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    console.log('✅ Connected to MySQL database');
  } catch (error) {
    console.error('❌ MySQL Connection Error:', error);
  }
}

initDB();

// --- API ENDPOINTS ---

// 1. Auth: Đăng nhập
app.post('/api/auth/login', async (req, res) => {
  const { email } = req.body;
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(401).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Auth: Đăng ký
app.post('/api/auth/register', async (req, res) => {
  const { email, full_name, role } = req.body;
  const id = 'usr-' + Math.random().toString(36).substr(2, 8);
  try {
    await pool.query('INSERT INTO users (id, email, full_name, role) VALUES (?, ?, ?, ?)', [id, email, full_name, role]);
    res.json({ id, email, full_name, role });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Jobs: Lấy danh sách công việc
app.get('/api/jobs', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM jobs WHERE status = "active" ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Jobs: Tạo công việc mới
app.post('/api/jobs', async (req, res) => {
  const id = 'job-' + Math.random().toString(36).substr(2, 8);
  const { title, department, location, type, salary_range, description, requirements } = req.body;
  try {
    await pool.query(
      'INSERT INTO jobs (id, title, department, location, type, salary_range, description, requirements) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, title, department, location, type, salary_range, description, requirements]
    );
    res.json({ success: true, id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Applications: Nộp đơn ứng tuyển
app.post('/api/applications', async (req, res) => {
  const id = 'app-' + Math.random().toString(36).substr(2, 8);
  const { job_id, candidate_id, resume_url, cover_letter } = req.body;
  try {
    await pool.query(
      'INSERT INTO applications (id, job_id, candidate_id, resume_url, cover_letter) VALUES (?, ?, ?, ?, ?)',
      [id, job_id, candidate_id, resume_url, cover_letter]
    );
    res.json({ success: true, id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 6. Applications: Lấy danh sách ứng tuyển (Cho HR và Candidate)
app.get('/api/applications', async (req, res) => {
  const { candidate_id, job_id } = req.query;
  try {
    let query = `
      SELECT a.*, j.title as job_title, j.department, u.full_name as candidate_name, u.skills, u.bio
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      JOIN users u ON a.candidate_id = u.id
      WHERE 1=1
    `;
    const params = [];
    if (candidate_id) { query += ' AND a.candidate_id = ?'; params.push(candidate_id); }
    if (job_id) { query += ' AND a.job_id = ?'; params.push(job_id); }
    query += ' ORDER BY a.applied_at DESC';

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 7. Applications: Cập nhật trạng thái
app.patch('/api/applications/:id/status', async (req, res) => {
  const { status } = req.body;
  try {
    await pool.query('UPDATE applications SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 8. AI: Chấm điểm CV
app.post('/api/ai/screen-cv', async (req, res) => {
  const { application_id } = req.body;
  try {
    // Lấy thông tin công việc và ứng viên
    const [apps] = await pool.query(`
      SELECT j.title, j.requirements, j.description, u.full_name, u.skills, u.bio
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      JOIN users u ON a.candidate_id = u.id
      WHERE a.id = ?
    `, [application_id]);

    if (apps.length === 0) return res.status(404).json({ error: 'Application not found' });

    const jobDetails = apps[0];
    const candidateDetails = apps[0];

    const aiResult = await screenCV(jobDetails, candidateDetails);

    // Lưu vào bảng interview hoặc update application
    // Tạm thời trả về cho frontend hiển thị
    res.json(aiResult);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Khởi động server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
