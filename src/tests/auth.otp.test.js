// src/tests/auth.otp.test.js

// Manual mock user.model (sẽ dùng file trong __mocks__)
jest.mock('../models/user.model');

const request = require('supertest');
const app = require('../app');
const env = require('../config/env');
const { getRedis } = require('../config/redis');
const userModel = require('../models/user.model'); // đã là các jest.fn()

describe('OTP Flow', () => {
    const email = 'test@example.com';
    const name = 'Tester';
    const password = 'abc123456';

    beforeEach(async () => {
        jest.clearAllMocks();
        const redis = getRedis();
        await redis.flushall(); // reset Redis mock
    });

    test('Đăng ký thành công → gửi OTP', async () => {
        userModel.findByEmail.mockResolvedValue(null);
        userModel.createUser.mockResolvedValue(123);

        const res = await request(app)
            .post('/api/auth/signup')
            .send({ email, password, name });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(userModel.createUser).toHaveBeenCalled();

        const redis = getRedis();
        const otp = await redis.get(`otp:${email}`);
        expect(otp).toBeTruthy();
    });

    test('Không cho đăng ký nếu email đã tồn tại', async () => {
        userModel.findByEmail.mockResolvedValue({ id: 1, email });

        const res = await request(app)
            .post('/api/auth/signup')
            .send({ email, password, name });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toMatch(/Email đã tồn tại/i);
    });

    test('Xác minh OTP đúng → ACTIVE', async () => {
        userModel.findByEmail.mockResolvedValue({ id: 1, email, name, status: 'INACTIVE', deleted: 0 });
        userModel.activateUserByEmail.mockResolvedValue();

        const redis = getRedis();
        await redis.set(`otp:${email}`, '123456', 'EX', env.otp.ttl);
        await redis.set(`otp_attempts:${email}`, '0', 'EX', env.otp.ttl);

        const res = await request(app)
            .post('/api/auth/verify-otp')
            .send({ email, otp: '123456' });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(userModel.activateUserByEmail).toHaveBeenCalledWith(email);

        const otpAfter = await redis.get(`otp:${email}`);
        expect(otpAfter).toBeNull();
    });

    test('Nhập sai OTP 4 lần → bị chặn & xóa OTP', async () => {
        userModel.findByEmail.mockResolvedValue({ id: 1, email, name, status: 'INACTIVE', deleted: 0 });

        const redis = getRedis();
        await redis.set(`otp:${email}`, '654321', 'EX', env.otp.ttl);
        await redis.set(`otp_attempts:${email}`, '0', 'EX', env.otp.ttl);

        for (let i = 1; i <= env.otp.maxAttempts; i++) {
            const res = await request(app)
                .post('/api/auth/verify-otp')
                .send({ email, otp: '000000' });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        }

        const otpAfter = await redis.get(`otp:${email}`);
        expect(otpAfter).toBeNull(); // Bị xóa khi quá số lần
    });

    test('Resend khi OTP còn hiệu lực → báo lỗi TTL', async () => {
        userModel.findByEmail.mockResolvedValue({ id: 1, email, name, status: 'INACTIVE', deleted: 0 });

        const redis = getRedis();
        await redis.set(`otp:${email}`, '111111', 'EX', env.otp.ttl);

        const res = await request(app)
            .post('/api/auth/resend-otp')
            .send({ email });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toMatch(/còn hiệu lực/i);
    });

    test('Resend khi OTP đã hết hạn → tạo OTP mới', async () => {
        userModel.findByEmail.mockResolvedValue({ id: 1, email, name, status: 'INACTIVE', deleted: 0 });

        // Không set OTP → coi như hết hạn
        const res = await request(app)
            .post('/api/auth/resend-otp')
            .send({ email });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);

        const redis = getRedis();
        const otp = await redis.get(`otp:${email}`);
        expect(otp).toBeTruthy();
    });
});
