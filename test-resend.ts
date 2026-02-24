
import { Resend } from 'resend';
import 'dotenv/config';

const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmail() {
    console.log("Testing Resend API...");
    console.log("FROM:", process.env.EMAIL_FROM);

    try {
        const data = await resend.emails.send({
            from: 'onboarding@resend.dev', // Try trial address first
            to: 'delivered@resend.dev', // Resend testing address
            subject: 'Test Email Verification',
            html: '<strong>It works!</strong>',
        });

        console.log("SUCCESS:", data);
    } catch (error) {
        console.error("ERROR:", error);
    }
}

testEmail();
