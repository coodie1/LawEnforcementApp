require('dotenv').config();
const http = require('http');

const API_URL = process.env.API_URL || 'http://localhost:5000/api';
const url = new URL(API_URL + '/auth/login');

const postData = JSON.stringify({
    email: 'admin@lawenforcement.com',
    password: 'Admin123!'
});

const options = {
    hostname: url.hostname,
    port: url.port || 5000,
    path: url.pathname,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

console.log('🧪 Testing login endpoint...\n');
console.log('API URL:', url.href);
console.log('Credentials:', { email: 'admin@lawenforcement.com', password: 'Admin123!' });
console.log('\n');

const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const response = JSON.parse(data);
            
            if (res.statusCode === 200) {
                console.log('✅ Login successful!');
                console.log('Response status:', res.statusCode);
                console.log('Has token:', !!response.token);
                console.log('User:', {
                    email: response.user?.email,
                    role: response.user?.role,
                    name: `${response.user?.firstName || ''} ${response.user?.lastName || ''}`.trim()
                });
            } else {
                console.error('❌ Login failed!');
                console.error('Status:', res.statusCode);
                console.error('Message:', response.message || 'Unknown error');
                console.error('Response:', response);
                process.exit(1);
            }
        } catch (err) {
            console.error('❌ Failed to parse response:', err);
            console.error('Raw response:', data);
            process.exit(1);
        }
    });
});

req.on('error', (error) => {
    console.error('❌ Request failed!');
    console.error('Error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
        console.error('\n💡 Backend server is not running!');
        console.error('   Start it with: cd backend && npm start');
    }
    
    process.exit(1);
});

req.write(postData);
req.end();

