const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const User = require('../models/User');

describe('Registration Debug Test', () => {
    beforeAll(async () => {
        // Clear users before test to avoid duplicate email errors
        await User.deleteMany({ email: 'test@example.com' });
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    it('should register a new user successfully', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123'
            });

        if (res.statusCode !== 201) {
            console.error('Registration Failed:', JSON.stringify(res.body, null, 2));
        }

        expect(res.statusCode).toEqual(201);
        expect(res.body.success).toBe(true);
        expect(res.body.token).toBeDefined();
    });
});
