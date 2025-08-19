jest.mock('nodemailer', () => {
    return {
        createTransport: () => ({
            sendMail: jest.fn().mockResolvedValue({ messageId: 'mocked' })
        })
    };
});

jest.mock('ioredis', () => require('ioredis-mock'));
