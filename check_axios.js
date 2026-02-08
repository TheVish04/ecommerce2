const axios = require('axios');

const testRegistration = async () => {
    try {
        const uniqueEmail = `testuser_${Date.now()}@example.com`;
        console.log(`Attempting to register with email: ${uniqueEmail}`);

        const response = await axios.post('http://localhost:3001/api/auth/register', {
            name: 'Axios Test User',
            email: uniqueEmail,
            password: 'password123',
            role: 'customer'
        });

        console.log('Registration Successful!');
        console.log('Status Code:', response.status);
        console.log('Data:', response.data);
    } catch (error) {
        console.error('Registration Failed!');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
};

testRegistration();
