import { Resend } from 'resend';
import process from 'node:process';

const getEmailConfig = () => {
    return {
        resendApiKey: String(process.env.RESEND_API_KEY || '').trim(),
        toEmail: String(process.env.CONTACT_RECEIVER_EMAIL || 'acm@jinnah.edu').trim(),
        fromEmail: String(process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev').trim(),
    };
};

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
        <!doctype html>
        <html>
        <head>
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
            <title>${esc(title)}</title>
        </head>
        <body style="margin:0;padding:0;background:${c.bgPrimary};">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="${c.bgPrimary}" style="background:${c.bgPrimary};border-collapse:collapse;">
                <tr>
                    <td align="center" style="padding:24px 12px;">
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="680" style="width:680px;max-width:680px;border-collapse:collapse;background:${c.bgCard};border:1px solid ${c.border};font-family:Arial,sans-serif;color:${c.textPrimary};">
                            <tr>
                                <td bgcolor="#0B1119" style="padding:20px 24px;border-bottom:1px solid ${c.border};">
                                    <div style="font-size:11px;line-height:14px;letter-spacing:2px;text-transform:uppercase;color:${c.gold};font-weight:bold;">${esc(eyebrow)}</div>
                                    <div style="margin-top:10px;font-size:38px;line-height:1.25;font-weight:700;color:${c.textPrimary};">${esc(title)}</div>
                                    <div style="margin-top:8px;font-size:14px;line-height:1.6;color:${c.textSecondary};">${esc(subtitle)}</div>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding:24px;">${body}</td>
                            </tr>
                            <tr>
                                <td style="padding:14px 24px;border-top:1px solid ${c.border};font-size:12px;line-height:1.6;color:${c.textSecondary};">
                                    ${esc(site.name)}<br />
                                    <a href="${esc(site.websiteUrl)}" style="color:${c.textSecondary};text-decoration:underline;">${esc(site.websiteUrl)}</a>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
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
            <td valign="top" style="padding:10px 0;border-bottom:1px solid ${c.border};color:${c.textSecondary};width:38%;font-size:14px;line-height:1.4;">${esc(label)}</td>
            <td valign="top" style="padding:10px 0;border-bottom:1px solid ${c.border};color:${c.textPrimary};font-size:14px;line-height:1.4;">${esc(value)}</td>
        </tr>`
    )).join('');

    const body = `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
            <tr>
                <td style="padding:0 0 16px 0;color:${c.textSecondary};font-size:15px;line-height:1.7;">
                    A new sponsorship inquiry was submitted through the website contact form.
                </td>
            </tr>
            <tr>
                <td>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">${detailsTable}</table>
                </td>
            </tr>
            <tr>
                <td style="padding-top:18px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#0E1520" style="border-collapse:collapse;background:#0E1520;border:1px solid ${c.border};">
                        <tr>
                            <td style="padding:12px 16px 8px 16px;color:${c.gold};font-size:11px;line-height:14px;letter-spacing:2px;text-transform:uppercase;font-weight:bold;">
                                Message
                            </td>
                        </tr>
                        <tr>
                            <td style="padding:0 16px 14px 16px;color:${c.textPrimary};font-size:14px;line-height:1.7;white-space:pre-wrap;">
                                ${esc(payload.message || 'No message provided.')}
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
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
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
            <tr>
                <td style="padding:0 0 12px 0;color:${c.textPrimary};font-size:32px;line-height:1.5;">
                    Hi ${esc(payload.name)},
                </td>
            </tr>
            <tr>
                <td style="padding:0 0 14px 0;color:${c.textSecondary};font-size:15px;line-height:1.7;">
                    Thank you for your interest in sponsoring Jinnah League. We have received your inquiry and our partnerships team will reach out within 24 hours.
                </td>
            </tr>
            <tr>
                <td style="padding:6px 0 18px 0;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#0E1520" style="border-collapse:collapse;background:#0E1520;border:1px solid ${c.border};">
                        <tr>
                            <td style="padding:12px 16px 8px 16px;color:${c.gold};font-size:11px;line-height:14px;letter-spacing:2px;text-transform:uppercase;font-weight:bold;">
                                Your Submission
                            </td>
                        </tr>
                        <tr>
                            <td style="padding:0 16px 14px 16px;color:${c.textPrimary};font-size:14px;line-height:1.75;">
                                <strong>Company:</strong> ${esc(payload.company)}<br />
                                <strong>Email:</strong> ${esc(payload.email)}<br />
                                <strong>Sector:</strong> ${esc(payload.sector || 'Not specified')}<br />
                                <strong>Tier:</strong> ${esc(payload.tier || 'Not specified')}
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td style="color:${c.textSecondary};font-size:15px;line-height:1.7;">
                    For urgent assistance, contact us at
                    <a href="mailto:${esc(site.supportEmail)}" style="color:${c.gold};text-decoration:underline;"> ${esc(site.supportEmail)}</a>.
                </td>
            </tr>
        </table>
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
    const config = getEmailConfig();

    if (!config.resendApiKey) {
        throw new Error('Missing RESEND_API_KEY environment variable.');
    }

    if (!config.fromEmail) {
        throw new Error('Missing RESEND_FROM_EMAIL environment variable.');
    }

    const resend = new Resend(config.resendApiKey);

    const [inquiry, confirmation] = await Promise.all([
        resend.emails.send({
            from: config.fromEmail,
            to: [config.toEmail],
            replyTo: payload.email,
            subject: `New Sponsorship Inquiry - ${payload.company}`,
            text: toPlainText(payload),
            html: inquiryHtmlTemplate(payload),
        }),
        resend.emails.send({
            from: config.fromEmail,
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
