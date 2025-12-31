// Native fetch used

// Using native fetch if available (Node 18+), otherwise mocking for simplicity or erroring
// Since we are likely on a recent Node, try standard fetch.

const BASE_URL = 'http://localhost:3001/api';

async function runTest() {
    console.log('--- Starting Test Flow ---');

    const email = `testuser_${Date.now()}@example.com`;
    const password = 'Password123!';
    const username = `testuser_${Date.now()}`;
    let token = '';

    try {
        // 1. Register
        console.log(`\n1. Registering user: ${email}...`);
        const regRes = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, username })
        });
        const regData = await regRes.json();
        console.log('Response:', regRes.status, regData);
        if (regRes.status !== 200) throw new Error('Registration failed');

        // 2. Login
        console.log('\n2. Logging in...');
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const loginData = await loginRes.json();
        console.log('Response:', loginRes.status, loginData);
        if (loginRes.status !== 200) throw new Error('Login failed');
        token = loginData.token;

        // 3. User Info
        console.log('\n3. Verifying login data...');
        if (!token) throw new Error('No token received');
        console.log('Token received:', token.substring(0, 10) + '...');

        // 4. Onboarding Status
        console.log('\n4. Checking onboarding status...');
        const statusRes = await fetch(`${BASE_URL}/onboarding/status`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const statusData = await statusRes.json();
        console.log('Response:', statusRes.status, statusData);

        // 5. Logout
        console.log('\n5. Logging out...');
        const logoutRes = await fetch(`${BASE_URL}/auth/logout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
        });
        const logoutData = await logoutRes.json();
        console.log('Response:', logoutRes.status, logoutData);
        if (logoutRes.status !== 200) throw new Error('Logout failed');

        console.log('\n--- Test Flow Completed Successfully ---');

    } catch (error) {
        console.error('\n!!! TEST FAILED !!!', error);
    }
}

// Simple delay to allow server to start if running via script runner (not needed here since we run server separately)
// But for this tool usage, we can't easily start background server AND run this script in parallel without "start-server-and-test".
// For now, I will assume the user or I will start the server. 
// I'll add a self-contained runner if I can.

runTest();
