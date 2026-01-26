const nodemailer = require('nodemailer');

const styles = `
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    color: #334155;
    line-height: 1.6;
`;

const containerStyle = `
    max-width: 600px;
    margin: 0 auto;
    background-color: #ffffff;
    border-radius: 16px;
    overflow: hidden;
    border: 1px solid #e2e8f0;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`;

const headerStyle = `
    background-color: #0F172A;
    color: #ffffff;
    padding: 30px;
    text-align: center;
`;

const bodyStyle = `
    padding: 40px 30px;
`;

const codeBoxStyle = `
    background-color: #F8FAFC;
    border: 2px dashed #cbd5e1;
    border-radius: 12px;
    padding: 20px;
    text-align: center;
    margin: 30px 0;
`;

const codeStyle = `
    font-size: 32px;
    font-weight: 800;
    letter-spacing: 4px;
    color: #0F172A;
    font-family: monospace;
`;

const footerStyle = `
    background-color: #F1F5F9;
    padding: 20px;
    text-align: center;
    font-size: 12px;
    color: #64748b;
`;

const getTransporter = () => {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
        console.log('⚠️ SMTP credentials missing.');
        return null;
    }
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 465,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
};

const sendEmail = async (to, subject, htmlContent, consoleFallback) => {
    const transporter = getTransporter();
    if (!transporter) {
        console.log('---------------------------------------------------');
        console.log(`📧  Email to: ${to}`);
        consoleFallback();
        console.log('---------------------------------------------------');
        return;
    }

    try {
        await transporter.sendMail({
            from: '"NS Partner Hub" <no-reply@nspartnerhub.com>',
            to: to,
            subject: subject,
            html: htmlContent,
        });
        console.log(`Email sent to ${to}: ${subject}`);
    } catch (error) {
        console.error('Error sending email:', error);
        console.log('--- FALLBACK LOG ---');
        consoleFallback();
    }
};

const sendPasswordSetupLinkEmail = async (email, link) => {
    const html = `
        <div style="${styles}">
            <div style="${containerStyle}">
                <div style="${headerStyle}">
                    <h1 style="margin:0; font-size: 24px;">Welcome to NS Partner Hub</h1>
                </div>
                <div style="${bodyStyle}">
                    <h2 style="color: #0F172A; margin-top: 0;">Account Approved!</h2>
                    <p>Dear Partner,</p>
                    <p>Your account has been approved. To get started, please set up your secure password by clicking the link below:</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${link}" style="background-color: #2563EB; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Set Your Password</a>
                    </div>
                    
                    <p style="font-size: 14px; color: #64748b;">Or copy this link to your browser:</p>
                    <p style="font-size: 12px; color: #3b82f6; word-break: break-all;">${link}</p>
                    
                    <p>This link is valid for 30 minutes and can only be used once.</p>
                </div>
                <div style="${footerStyle}">
                    &copy; 2026 NepaliShows Inc. All rights reserved.<br>
                    This is an automated message, please do not reply.
                </div>
            </div>
        </div>
    `;

    await sendEmail(email, 'Set Your Partner Password', html, () => {
        console.log(`🔗  Setup Link: ${link}`);
    });
};

const sendPasswordResetEmail = async (email, otp) => {
    const html = `
        <div style="${styles}">
            <div style="${containerStyle}">
                <div style="${headerStyle}">
                    <h1 style="margin:0; font-size: 24px;">Password Reset</h1>
                </div>
                <div style="${bodyStyle}">
                    <p>Hello,</p>
                    <p>We received a request to reset the password for your NS Partner Hub account associated with <strong>${email}</strong>.</p>
                    <p>Use the following verification code to complete the process. This code will expire in 15 minutes.</p>
                    
                    <div style="${codeBoxStyle}">
                        <span style="${codeStyle}">${otp}</span>
                    </div>

                    <p style="font-size: 14px; color: #64748b;">If you did not request this change, please ignore this email or contact support if you have concerns.</p>
                </div>
                <div style="${footerStyle}">
                    &copy; 2026 NepaliShows Inc. All rights reserved.
                </div>
            </div>
        </div>
    `;

    await sendEmail(email, 'Password Reset Verification Code', html, () => {
        console.log(`🔑  Reset OTP: ${otp}`);
    });
};

const sendWithdrawalOtpEmail = async (email, otp, amount) => {
    const html = `
        <div style="${styles}">
            <div style="${containerStyle}">
                <div style="${headerStyle}">
                    <h1 style="margin:0; font-size: 24px;">Confirm Withdrawal</h1>
                </div>
                <div style="${bodyStyle}">
                    <p>Hello,</p>
                    <p>You requested a withdrawal of <strong>Rs. ${amount}</strong> from your NS Partner Hub account.</p>
                    <p>Please use the verification code below to confirm this transaction. This code expires in 10 minutes.</p>
                    
                    <div style="${codeBoxStyle}">
                        <span style="${codeStyle}">${otp}</span>
                    </div>

                    <p style="font-size: 14px; color: #64748b;">If you did not request this, please change your password immediately.</p>
                </div>
                <div style="${footerStyle}">
                    &copy; 2026 NepaliShows Inc. All rights reserved.
                </div>
            </div>
        </div>
    `;

    await sendEmail(email, 'Withdrawal Verification Code', html, () => {
        console.log(`💸  Withdrawal OTP: ${otp}`);
    });
};

const sendProfileUpdateOtpEmail = async (email, otp) => {
    const html = `
        <div style="${styles}">
            <div style="${containerStyle}">
                <div style="${headerStyle}">
                    <h1 style="margin:0; font-size: 24px;">Confirm Profile Update</h1>
                </div>
                <div style="${bodyStyle}">
                    <p>Hello,</p>
                    <p>We received a request to update sensitive information (Phone/Email) on your NS Partner Hub profile.</p>
                    <p>Please use the verification code below to confirm this change. This code expires in 10 minutes.</p>
                    
                    <div style="${codeBoxStyle}">
                        <span style="${codeStyle}">${otp}</span>
                    </div>

                    <p style="font-size: 14px; color: #64748b;">If you did not request this, please change your password immediately.</p>
                </div>
                <div style="${footerStyle}">
                    &copy; 2026 NepaliShows Inc. All rights reserved.
                </div>
            </div>
        </div>
    `;

    await sendEmail(email, 'Profile Update Verification Code', html, () => {
        console.log(`🛡️  Profile OTP: ${otp}`);
    });
};

module.exports = { sendPasswordSetupLinkEmail, sendPasswordResetEmail, sendWithdrawalOtpEmail, sendProfileUpdateOtpEmail };
