import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;

const defaultToEmail = process.env.CONTACT_RECEIVER_EMAIL || 'acm@jinnah.edu';
const defaultFromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

export const resend = resendApiKey ? new Resend(resendApiKey) : null;

const site = {
    name: 'ACM MAJU - Jinnah League',
    supportEmail: 'acm@jinnah.edu',
    websiteUrl: 'https://www.jinnahleague.com',
    colors: {
        bgPrimary: '#080B10',
        bgCard: '#141C28',
        border: '#1E2D40',
        gold: '#C9A84C',
        textPrimary: '#F4F4F0',
        textSecondary: '#8A95A3',
    },
};

const esc = (value = '') => String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const emailShell = ({ eyebrow, title, subtitle, body }) => {
    const c = site.colors;

    return `
        <div style="margin:0;background:${c.bgPrimary};padding:24px 12px;font-family:'DM Sans',Arial,sans-serif;color:${c.textPrimary};">
            <div style="max-width:680px;margin:0 auto;background:${c.bgCard};border:1px solid ${c.border};">
                <div style="padding:22px 24px;border-bottom:1px solid ${c.border};background:linear-gradient(135deg,#0B1119 0%,#141C28 100%);">
                    <div style="font-family:'Syne',Arial,sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${c.gold};">${esc(eyebrow)}</div>
                    <h1 style="margin:10px 0 6px;font-size:24px;line-height:1.25;font-weight:700;color:${c.textPrimary};">${esc(title)}</h1>
                    <p style="margin:0;color:${c.textSecondary};font-size:14px;line-height:1.6;">${esc(subtitle)}</p>
                </div>
                <div style="padding:24px;">${body}</div>
                <div style="padding:16px 24px;border-top:1px solid ${c.border};font-size:12px;color:${c.textSecondary};line-height:1.6;">
                    ${esc(site.name)}<br/>
                    ${esc(site.websiteUrl)}
                </div>
            </div>
        </div>
    `;
};

const toPlainText = (payload) => {
    return [
        `New sponsorship inquiry from ${payload.name}`,
        '',
        `Name: ${payload.name}`,
        `Company: ${payload.company}`,
        `Designation: ${payload.designation || 'Not provided'}`,
        `Email: ${payload.email}`,
        `Phone: ${payload.phone || 'Not provided'}`,
        `Sector: ${payload.sector || 'Not provided'}`,
        `Tier: ${payload.tier || 'Not provided'}`,
        '',
        'Message:',
        payload.message || 'No message provided.',
    ].join('\n');
};

const inquiryHtmlTemplate = (payload) => {
    const c = site.colors;
    const rows = [
        ['Name', payload.name],
        ['Company', payload.company],
        ['Designation', payload.designation || 'Not provided'],
        ['Email', payload.email],
        ['Phone', payload.phone || 'Not provided'],
        ['Sector', payload.sector || 'Not provided'],
        ['Tier', payload.tier || 'Not provided'],
    ];

    const detailsTable = rows.map(([label, value]) => (
        `<tr>
            <td style="padding:10px 0;border-bottom:1px solid ${c.border};color:${c.textSecondary};width:38%;">${esc(label)}</td>
            <td style="padding:10px 0;border-bottom:1px solid ${c.border};color:${c.textPrimary};">${esc(value)}</td>
        </tr>`
    )).join('');

    const body = `
        <p style="margin:0 0 16px;color:${c.textSecondary};line-height:1.7;">A new sponsorship inquiry was submitted through the website contact form.</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">${detailsTable}</table>
        <div style="margin-top:18px;padding:14px 16px;border:1px solid ${c.border};background:#0E1520;">
            <div style="font-family:'Syne',Arial,sans-serif;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:${c.gold};margin-bottom:8px;">Message</div>
            <p style="margin:0;white-space:pre-wrap;color:${c.textPrimary};line-height:1.7;">${esc(payload.message || 'No message provided.')}</p>
        </div>
    `;

    return emailShell({
        eyebrow: 'Partnership Inquiry',
        title: 'New Sponsorship Inquiry',
        subtitle: 'A new lead is waiting in your inbox.',
        body,
    });
};

const confirmationHtmlTemplate = (payload) => {
    const c = site.colors;

    const body = `
        <p style="margin:0 0 14px;color:${c.textPrimary};line-height:1.7;">Hi ${esc(payload.name)},</p>
        <p style="margin:0 0 14px;color:${c.textSecondary};line-height:1.7;">
            Thank you for your interest in sponsoring Jinnah League. We have received your inquiry and our partnerships team will reach out within 24 hours.
        </p>
        <div style="margin:18px 0;padding:14px 16px;border:1px solid ${c.border};background:#0E1520;">
            <div style="font-family:'Syne',Arial,sans-serif;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:${c.gold};margin-bottom:8px;">Your Submission</div>
            <div style="color:${c.textPrimary};font-size:14px;line-height:1.75;">
                <strong>Company:</strong> ${esc(payload.company)}<br/>
                <strong>Email:</strong> ${esc(payload.email)}<br/>
                <strong>Sector:</strong> ${esc(payload.sector || 'Not specified')}<br/>
                <strong>Tier:</strong> ${esc(payload.tier || 'Not specified')}
            </div>
        </div>
        <p style="margin:0;color:${c.textSecondary};line-height:1.7;">
            For urgent assistance, contact us at <a href="mailto:${esc(site.supportEmail)}" style="color:${c.gold};text-decoration:none;">${esc(site.supportEmail)}</a>.
        </p>
    `;

    return emailShell({
        eyebrow: 'Inquiry Received',
        title: 'Thanks for reaching out',
        subtitle: 'Your partnership request has been successfully recorded.',
        body,
    });
};

const confirmationPlainText = (payload) => {
    return [
        `Hi ${payload.name},`,
        '',
        'Thank you for your interest in sponsoring Jinnah League.',
        'We have received your inquiry and our partnerships team will contact you within 24 hours.',
        '',
        'Your submission summary:',
        `Company: ${payload.company}`,
        `Email: ${payload.email}`,
        `Sector: ${payload.sector || 'Not specified'}`,
        `Tier: ${payload.tier || 'Not specified'}`,
        '',
        `Need help? Contact us at ${site.supportEmail}`,
        site.websiteUrl,
    ].join('\n');
};

export const sendPartnershipInquiryEmail = async (payload) => {
    if (!resend) {
        throw new Error('Missing RESEND_API_KEY environment variable.');
    }

    const [inquiry, confirmation] = await Promise.all([
        resend.emails.send({
            from: defaultFromEmail,
            to: [defaultToEmail],
            replyTo: payload.email,
            subject: `New Sponsorship Inquiry - ${payload.company}`,
            text: toPlainText(payload),
            html: inquiryHtmlTemplate(payload),
        }),
        resend.emails.send({
            from: defaultFromEmail,
            to: [payload.email],
            subject: 'Jinnah League Sponsorship Inquiry Received',
            text: confirmationPlainText(payload),
            html: confirmationHtmlTemplate(payload),
        }),
    ]);

    return {
        inquiry,
        confirmation,
    };
};
