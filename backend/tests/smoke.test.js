const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');

describe('Backend Smoke Tests', () => {
    // Close database connection after tests to prevent hanging
    afterAll(async () => {
        await mongoose.connection.close();
    });

    it('GET /api/health should return 200', async () => {
        const res = await request(app).get('/api/health');
        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toEqual(true);
    });

    it('GET / should return 200', async () => {
        const res = await request(app).get('/');
        expect(res.statusCode).toEqual(200);
        expect(res.body.version).toBeDefined();
    });
});
