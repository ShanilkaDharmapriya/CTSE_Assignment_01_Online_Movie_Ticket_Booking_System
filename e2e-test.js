const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000';

async function testE2E() {
    try {
        console.log('--- Starting E2E Test ---');

        // 1. Login as Admin
        console.log('1. Logging in as Admin...');
        const loginRes = await axios.post(`${API_BASE_URL}/auth/login`, {
            email: 'admin@cinema.com',
            password: 'adminpassword123'
        });
        const adminToken = loginRes.data.data.token;
        console.log('Admin logged in.');

        const adminHeader = { headers: { Authorization: `Bearer ${adminToken}` } };

        // 2. Create a Movie
        console.log('2. Creating a Movie...');
        const movieRes = await axios.post(`${API_BASE_URL}/movies`, {
            title: 'The Great Cinema Adventure',
            description: 'An epic journey into the world of film.',
            genre: ['Adventure', 'Drama'],
            language: 'English',
            duration: 150,
            director: 'Cinema Master',
            releaseDate: new Date().toISOString(),
            pricePerSeat: 800,
            status: 'now_showing'
        }, adminHeader);
        const movieId = movieRes.data._id;
        console.log(`Movie created with ID: ${movieId}`);

        // 3. Create a Show
        console.log('3. Creating a Show...');
        const showRes = await axios.post(`${API_BASE_URL}/shows`, {
            movieId: movieId,
            theater: 'Main Cinema Hall',
            date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
            showTime: '18:30',
            availableSeats: 100,
            reservedSeats: 0
        }, adminHeader);
        const showId = showRes.data._id;
        console.log(`Show created with ID: ${showId}`);

        // 4. Register and Login as a Customer
        console.log('4. Registering and logging in as Customer...');
        const customerEmail = `user${Math.floor(Math.random() * 100000)}@test.com`;
        await axios.post(`${API_BASE_URL}/auth/register`, {
            name: 'Test Customer',
            email: customerEmail,
            password: 'customerpassword123'
        });
        const customerLoginRes = await axios.post(`${API_BASE_URL}/auth/login`, {
            email: customerEmail,
            password: 'customerpassword123'
        });
        const customerToken = customerLoginRes.data.data.token;
        const customerId = customerLoginRes.data.data.user.id;
        console.log(`Customer ${customerId} logged in.`);

        const customerHeader = { headers: { Authorization: `Bearer ${customerToken}` } };

        // 5. Create a Booking
        console.log('5. Creating a Booking...');
        const bookingRes = await axios.post(`${API_BASE_URL}/bookings`, {
            movieId: movieId,
            showId: showId,
            seats: 2,
            userId: customerId // In some implementations, this might be taken from JWT, but we'll include it.
        }, customerHeader);
        console.log('Booking successful:', bookingRes.data.bookingReference);

        console.log('--- E2E Test Passed Successfully ---');
    } catch (err) {
        console.error('--- E2E Test Failed ---');
        if (err.response) {
            console.error('Status:', err.response.status);
            console.error('Data:', JSON.stringify(err.response.data, null, 2));
        } else {
            console.error('Error:', err.message);
        }
        process.exit(1);
    }
}

testE2E();
