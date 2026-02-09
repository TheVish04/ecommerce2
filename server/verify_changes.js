const http = require('http');

const makeRequest = (path, method, body) => {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3001, // Updated to match .env
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, body: JSON.parse(data) });
                } catch (e) {
                    resolve({ status: res.statusCode, body: data });
                }
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
};

const runTest = async () => {
    try {
        const timestamp = Date.now();
        const newUser = {
            name: `Test User ${timestamp}`,
            email: `test${timestamp}@gmail.com`,
            password: 'Password123!',
            role: 'customer'
        };

        console.log('1. Testing Registration...');
        const regRes = await makeRequest('/api/auth/register', 'POST', newUser);
        console.log('Registration Status:', regRes.status);
        console.log('Registration Body:', JSON.stringify(regRes.body, null, 2));

        if (regRes.status !== 201) {
            throw new Error('Registration failed');
        }

        if (regRes.body.needsVerification) {
            throw new Error('Registration still requires verification!');
        }

        if (!regRes.body.token) {
            throw new Error('No token received on registration');
        }

        console.log('2. Testing Login...');
        const loginRes = await makeRequest('/api/auth/login', 'POST', {
            email: newUser.email,
            password: newUser.password
        });
        console.log('Login Status:', loginRes.status);

        if (loginRes.status !== 200) {
            console.log('Login Body:', JSON.stringify(loginRes.body, null, 2));
            throw new Error('Login failed');
        }

        if (!loginRes.body.token) {
            throw new Error('No token received on login');
        }

        console.log('✅ Verification Successful: Registration and Login work without email!');

    } catch (err) {
        console.error('❌ Verification Failed:', err.message);
    }
};

runTest();
