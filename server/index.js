const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3001; // Running on 3001 to avoid conflict with Vite (3000/5173)

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Shadow Board Backend Server is Running');
});

// --- Authentication Endpoints ---

// Login
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];
    const attemptId = uuidv4();

    try {
        // 1. Find user
        const user = await db.getAsync('SELECT * FROM users WHERE email = ?', [email]);

        if (!user) {
            // Record failed attempt
            await db.runAsync(`
                INSERT INTO login_attempts (attempt_id, user_id, success, ip_address, user_agent, failure_reason)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [attemptId, null, false, ipAddress, userAgent, 'User not found']);

            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // 2. Verify password
        const passwordMatch = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatch) {
            // Record failed attempt
            await db.runAsync(`
                INSERT INTO login_attempts (attempt_id, user_id, success, ip_address, user_agent, failure_reason)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [attemptId, user.user_id, false, ipAddress, userAgent, 'Invalid password']);

            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // 3. Login Success
        await db.runAsync(`
            INSERT INTO login_attempts (attempt_id, user_id, success, ip_address, user_agent)
            VALUES (?, ?, ?, ?, ?)
        `, [attemptId, user.user_id, true, ipAddress, userAgent]);

        // 4. Create Session
        const sessionId = uuidv4();
        const sessionToken = uuidv4();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

        await db.runAsync(`
            INSERT INTO user_sessions (session_id, user_id, login_attempt_id, session_token, expires_at, ip_address, user_agent)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [sessionId, user.user_id, attemptId, sessionToken, expiresAt, ipAddress, userAgent]);

        // 5. Update user last login
        await db.runAsync('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE user_id = ?', [user.user_id]);

        res.json({
            message: 'Login successful',
            token: sessionToken,
            user: {
                id: user.user_id,
                email: user.email,
                username: user.username
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Logout
app.post('/api/auth/logout', async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ error: 'Token required' });
    }

    try {
        await db.runAsync(`
            UPDATE user_sessions 
            SET logout_at = CURRENT_TIMESTAMP, 
                is_active = 0, 
                logout_type = 'user_initiated'
            WHERE session_token = ?
        `, [token]);

        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Register (Helper for seeding/testing)
app.post('/api/auth/register', async (req, res) => {
    const { email, username, password } = req.body;
    if (!email || !password || !username) {
        return res.status(400).json({ error: 'Missing fields' });
    }

    const userId = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 12);

    try {
        await db.runAsync(`
            INSERT INTO users (user_id, email, username, password_hash)
            VALUES (?, ?, ?, ?)
        `, [userId, email, username, hashedPassword]);

        res.json({ message: 'User created', userId });
    } catch (error) {
        // console.error('Registration error:', error);
        res.status(400).json({ error: 'User likely exists' });
    }
});

// --- Onboarding Endpoints ---

// Get Onboarding Status
app.get('/api/onboarding/status', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {
        // Validate session
        const session = await db.getAsync('SELECT user_id FROM user_sessions WHERE session_token = ? AND is_active = 1', [token]);
        if (!session) return res.status(401).json({ error: 'Invalid session' });

        const userId = session.user_id;

        // Get progress
        const progress = await db.getAsync('SELECT * FROM user_onboarding_progress WHERE user_id = ?', [userId]);

        if (!progress) {
            return res.json({ status: 'not_started' });
        }

        res.json(progress);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
