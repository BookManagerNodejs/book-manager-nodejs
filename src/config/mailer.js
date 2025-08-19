const nodemailer = require('nodemailer');
const env = require('./env');

const transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.secure,
    auth: {
        user: env.smtp.user,
        pass: env.smtp.pass
    }
});
async function sendMail({ to, subject, html }) {
    const info = await transporter.sendMail({
        from: env.smtp.from,
        to,
        subject,
        html
    });
    return info;
}
module.exports = { sendMail, transporter };
