import { sendPartnershipInquiryEmail } from '../../src/lib/resend';

const requiredFields = ['name', 'company', 'email'];

const normalizePayload = (body = {}) => {
    return {
        name: String(body.name || '').trim(),
        company: String(body.company || '').trim(),
        designation: String(body.designation || '').trim(),
        email: String(body.email || '').trim(),
        phone: String(body.phone || '').trim(),
        sector: String(body.sector || '').trim(),
        tier: String(body.tier || '').trim(),
        message: String(body.message || '').trim(),
    };
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ message: 'Method not allowed.' });
    }

    const payload = normalizePayload(req.body);
    const missingField = requiredFields.find((field) => !payload[field]);

    if (missingField) {
        return res.status(400).json({ message: `Missing required field: ${missingField}.` });
    }

    try {
        const result = await sendPartnershipInquiryEmail(payload);
        return res.status(200).json({
            success: true,
            inquiryId: result?.inquiry?.data?.id || null,
            confirmationId: result?.confirmation?.data?.id || null,
        });
    } catch (error) {
        // Keep server internals private but provide useful config hint when key is missing.
        const message = error?.message?.includes('RESEND_API_KEY')
            ? 'Email service is not configured yet.'
            : 'Unable to send inquiry right now. Please try again shortly.';

        return res.status(500).json({ message });
    }
}
