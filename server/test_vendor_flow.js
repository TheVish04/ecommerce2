const API_URL = 'http://localhost:3001/api';

async function testVendorFlow() {
    try {
        const email = `vendor_${Date.now()}@demo.com`;
        const password = 'password123';

        console.log('1. Registering Vendor...');
        const regRes = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Vendor Tester',
                email,
                password,
                role: 'vendor'
            })
        });

        const regData = await regRes.json();
        if (!regRes.ok) throw new Error(regData.message || 'Registration failed');

        console.log('   Success! Created:', regData.email);
        const token = regData.token;

        console.log('\n2. Accessing Vendor Dashboard...');
        const dashRes = await fetch(`${API_URL}/vendor/dashboard`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const dashData = await dashRes.json();

        if (!dashRes.ok) throw new Error(dashData.message || 'Dashboard fetch failed');
        console.log('   Success! Dashboard Stats:', dashData);

        console.log('\n3. Fetching Vendor Orders (Dummy Data)...');
        const ordersRes = await fetch(`${API_URL}/vendor/orders`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const ordersData = await ordersRes.json();

        if (!ordersRes.ok) throw new Error(ordersData.message || 'Orders fetch failed');
        console.log('   Success! Orders retrieved:', ordersData.length);

        console.log('\n4. Fetching Vendor Payouts (Dummy Data)...');
        const payoutsRes = await fetch(`${API_URL}/vendor/payouts`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const payoutsData = await payoutsRes.json();

        if (!payoutsRes.ok) throw new Error(payoutsData.message || 'Payouts fetch failed');
        console.log('   Success! Available Balance:', payoutsData.availableBalance);

        console.log('\nVerified Phase 2 Backend Logic: ✅ PASSED');

    } catch (error) {
        console.error('❌ Test Failed:', error.message);
    }
}

testVendorFlow();
