// Seed live database
const API_URL = 'https://nestely-api.onrender.com/api/v1';

async function seed() {
    try {
        console.log('1. Registering Admin Account...');
        const regRes = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tenantName: 'Nestely Grand',
                name: 'System Admin',
                email: 'admin@nestely.com',
                password: 'password123',
                role: 'ADMIN'
            })
        });
        const regData = await regRes.json();
        const token = regData.token;
        if (!token) throw new Error('Failed to register: ' + JSON.stringify(regData));
        console.log('✅ Admin registered!');

        console.log('2. Creating Global Category...');
        const catRes = await fetch(`${API_URL}/vendor/category`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ name: 'Signatures', description: 'Premium items' })
        });
        const catData = await catRes.json();
        console.log('✅ Category created!');

        console.log('3. Creating Premium Item...');
        const itemRes = await fetch(`${API_URL}/vendor/item`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
                name: 'Truffle Burger',
                description: 'Wagyu beef with truffle mayo',
                price: 18.99,
                categoryId: catData.data.id,
                isAvailable: true,
                image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=60'
            })
        });
        await itemRes.json();
        console.log('✅ Item created!');
        
        console.log('🎉 SEED COMPLETE! The database is ready for End-to-End testing.');
    } catch (e) {
        console.error('Error seeding:', e.message);
    }
}

seed();
