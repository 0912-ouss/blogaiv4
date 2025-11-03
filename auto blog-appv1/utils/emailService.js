const nodemailer = require('nodemailer');
let sgMail = null;
let mailgun = null;

// Try to load SendGrid and Mailgun (optional dependencies)
try {
    sgMail = require('@sendgrid/mail');
} catch (e) {
    // SendGrid not installed
}

try {
    const formData = require('form-data');
    const Mailgun = require('mailgun.js');
    mailgun = new Mailgun(formData);
} catch (e) {
    // Mailgun not installed
}

// Email service configuration
let transporter = null;
let emailServiceType = null;

// Initialize email transporter
const initializeEmailService = () => {
    // Check if email service is configured
    const emailService = process.env.EMAIL_SERVICE || 'smtp'; // 'smtp', 'sendgrid', 'mailgun'
    emailServiceType = emailService;

    if (emailService === 'sendgrid') {
        const sendgridApiKey = process.env.SENDGRID_API_KEY;
        if (!sendgridApiKey) {
            console.warn('⚠️  SendGrid API key not configured. Email notifications will be disabled.');
            return null;
        }
        if (!sgMail) {
            console.warn('⚠️  @sendgrid/mail package not installed. Run: npm install @sendgrid/mail');
            return null;
        }
        sgMail.setApiKey(sendgridApiKey);
        console.log('✅ SendGrid email service initialized');
        return 'sendgrid';
    }

    if (emailService === 'mailgun') {
        const mailgunApiKey = process.env.MAILGUN_API_KEY;
        const mailgunDomain = process.env.MAILGUN_DOMAIN;
        if (!mailgunApiKey || !mailgunDomain) {
            console.warn('⚠️  Mailgun API key or domain not configured. Email notifications will be disabled.');
            return null;
        }
        if (!mailgun) {
            console.warn('⚠️  mailgun.js package not installed. Run: npm install mailgun.js form-data');
            return null;
        }
        transporter = mailgun.client({
            username: 'api',
            key: mailgunApiKey
        });
        console.log('✅ Mailgun email service initialized');
        return transporter;
    }

    // Default: SMTP
    const emailHost = process.env.EMAIL_HOST;
    const emailPort = process.env.EMAIL_PORT || 587;
    const emailUser = process.env.EMAIL_USER;
    const emailPassword = process.env.EMAIL_PASSWORD;

    if (!emailHost || !emailUser || !emailPassword) {
        console.warn('⚠️  Email service not configured. Email notifications will be disabled.');
        return null;
    }

    try {
        transporter = nodemailer.createTransport({
            host: emailHost,
            port: parseInt(emailPort),
            secure: emailPort === 465, // true for 465, false for other ports
            auth: {
                user: emailUser,
                pass: emailPassword,
            },
        });

        console.log('✅ SMTP email service initialized');
        return transporter;
    } catch (error) {
        console.error('❌ Error initializing email service:', error);
        return null;
    }
};

// Send email function (supports SMTP, SendGrid, Mailgun)
const sendEmail = async (options) => {
    if (!transporter && emailServiceType !== 'sendgrid') {
        const initResult = initializeEmailService();
        if (!initResult) {
            console.warn('⚠️  Email service not available. Email not sent.');
            return { success: false, error: 'Email service not configured' };
        }
    }

    const emailFrom = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@example.com';

    try {
        // SendGrid
        if (emailServiceType === 'sendgrid' && sgMail) {
            const msg = {
                to: options.to,
                from: emailFrom,
                subject: options.subject,
                html: options.html,
                text: options.text,
            };

            const [response] = await sgMail.send(msg);
            console.log('✅ Email sent via SendGrid:', response.statusCode);
            return { success: true, messageId: response.headers['x-message-id'], provider: 'sendgrid' };
        }

        // Mailgun
        if (emailServiceType === 'mailgun' && transporter) {
            const messageData = {
                from: emailFrom,
                to: options.to,
                subject: options.subject,
                html: options.html,
                text: options.text,
            };

            const response = await transporter.messages.create(process.env.MAILGUN_DOMAIN, messageData);
            console.log('✅ Email sent via Mailgun:', response.id);
            return { success: true, messageId: response.id, provider: 'mailgun' };
        }

        // SMTP (default)
        if (transporter) {
            const mailOptions = {
                from: emailFrom,
                to: options.to,
                subject: options.subject,
                html: options.html,
                text: options.text,
            };

            const info = await transporter.sendMail(mailOptions);
            console.log('✅ Email sent via SMTP:', info.messageId);
            return { success: true, messageId: info.messageId, provider: 'smtp' };
        }

        return { success: false, error: 'No email service available' };
    } catch (error) {
        console.error('❌ Error sending email:', error);
        return { success: false, error: error.message };
    }
};

// Enhanced Email templates
const emailTemplates = {
    // New comment notification
    newComment: (comment, article) => {
        const siteUrl = process.env.SITE_URL || 'http://localhost:3000';
        return {
            subject: `New Comment on "${article.title}"`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
                        .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                        .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px 20px; text-align: center; }
                        .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
                        .content { padding: 30px 20px; }
                        .content p { margin: 0 0 15px 0; color: #555; }
                        .button { display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; font-weight: 500; }
                        .comment-box { background: #f9fafb; padding: 20px; border-left: 4px solid #3b82f6; margin: 20px 0; border-radius: 4px; }
                        .comment-box p { margin: 0 0 10px 0; }
                        .comment-author { font-weight: 600; color: #1f2937; }
                        .footer { padding: 20px; text-align: center; font-size: 12px; color: #999; background: #f9fafb; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>💬 New Comment Received</h1>
                        </div>
                        <div class="content">
                            <p>Hello,</p>
                            <p>A new comment has been posted on your article <strong>"${article.title}"</strong>.</p>
                            <div class="comment-box">
                                <p class="comment-author">${comment.author_name || 'Anonymous'}</p>
                                <p>${comment.content}</p>
                            </div>
                            <a href="${siteUrl}/article.html?slug=${article.slug}" class="button">View Comment</a>
                        </div>
                        <div class="footer">
                            <p>You're receiving this because you're the author of this article.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `New Comment on "${article.title}"\n\n${comment.author_name || 'Anonymous'} commented: ${comment.content}\n\nView: ${siteUrl}/article.html?slug=${article.slug}`
        };
    },

    // Article published notification
    articlePublished: (article, recipients) => {
        const siteUrl = process.env.SITE_URL || 'http://localhost:3000';
        return {
            subject: `✨ Article Published: "${article.title}"`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
                        .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px 20px; text-align: center; }
                        .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
                        .content { padding: 30px 20px; }
                        .content p { margin: 0 0 15px 0; color: #555; }
                        .button { display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; font-weight: 500; }
                        .excerpt { font-style: italic; color: #666; padding: 15px; background: #f9fafb; border-radius: 4px; margin: 15px 0; }
                        .footer { padding: 20px; text-align: center; font-size: 12px; color: #999; background: #f9fafb; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>✨ Article Published!</h1>
                        </div>
                        <div class="content">
                            <p>Hello,</p>
                            <p>Your article <strong>"${article.title}"</strong> has been published successfully.</p>
                            ${article.excerpt ? `<div class="excerpt">${article.excerpt}</div>` : ''}
                            <a href="${siteUrl}/article.html?slug=${article.slug}" class="button">Read Article</a>
                        </div>
                        <div class="footer">
                            <p>Thank you for contributing to our blog!</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `Article Published: "${article.title}"\n\n${article.excerpt || ''}\n\nRead: ${siteUrl}/article.html?slug=${article.slug}`
        };
    },

    // Comment approved notification
    commentApproved: (comment, article) => {
        const siteUrl = process.env.SITE_URL || 'http://localhost:3000';
        return {
            subject: `✅ Your Comment on "${article.title}" Has Been Approved`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
                        .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px 20px; text-align: center; }
                        .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
                        .content { padding: 30px 20px; }
                        .content p { margin: 0 0 15px 0; color: #555; }
                        .button { display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; font-weight: 500; }
                        .footer { padding: 20px; text-align: center; font-size: 12px; color: #999; background: #f9fafb; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>✅ Comment Approved</h1>
                        </div>
                        <div class="content">
                            <p>Hello ${comment.author_name || 'there'},</p>
                            <p>Great news! Your comment on <strong>"${article.title}"</strong> has been approved and is now visible on the site.</p>
                            <a href="${siteUrl}/article.html?slug=${article.slug}" class="button">View Article</a>
                        </div>
                        <div class="footer">
                            <p>Thank you for your engagement!</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `Your Comment on "${article.title}" Has Been Approved\n\nView: ${siteUrl}/article.html?slug=${article.slug}`
        };
    },

    // Comment rejected notification
    commentRejected: (comment, article) => {
        return {
            subject: `Comment on "${article.title}" Not Approved`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
                        .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                        .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px 20px; text-align: center; }
                        .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
                        .content { padding: 30px 20px; }
                        .content p { margin: 0 0 15px 0; color: #555; }
                        .footer { padding: 20px; text-align: center; font-size: 12px; color: #999; background: #f9fafb; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Comment Not Approved</h1>
                        </div>
                        <div class="content">
                            <p>Hello ${comment.author_name || 'there'},</p>
                            <p>Unfortunately, your comment on <strong>"${article.title}"</strong> did not meet our community guidelines and was not approved.</p>
                            <p>Thank you for your understanding.</p>
                        </div>
                        <div class="footer">
                            <p>If you have questions, please contact our support team.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `Comment on "${article.title}" Not Approved\n\nYour comment did not meet our guidelines and was not approved.`
        };
    },

    // Newsletter welcome template
    newsletterWelcome: (subscriberName, unsubscribeToken) => {
        const siteUrl = process.env.SITE_URL || 'http://localhost:3000';
        return {
            subject: 'Welcome to Our Newsletter! 🎉',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
                        .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                        .header { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 30px 20px; text-align: center; }
                        .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
                        .content { padding: 30px 20px; }
                        .content p { margin: 0 0 15px 0; color: #555; }
                        .footer { padding: 20px; text-align: center; font-size: 12px; color: #999; background: #f9fafb; }
                        .footer a { color: #8b5cf6; text-decoration: none; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🎉 Welcome!</h1>
                        </div>
                        <div class="content">
                            <p>Hello ${subscriberName || 'there'},</p>
                            <p>Thank you for subscribing to our newsletter! You'll now receive the latest updates, articles, and exclusive content delivered straight to your inbox.</p>
                            <p>We're excited to have you as part of our community!</p>
                        </div>
                        <div class="footer">
                            <p>If you no longer wish to receive emails, you can <a href="${siteUrl}/unsubscribe?token=${unsubscribeToken}">unsubscribe here</a>.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `Welcome to Our Newsletter!\n\nThank you for subscribing. You'll receive the latest updates and articles.\n\nUnsubscribe: ${siteUrl}/unsubscribe?token=${unsubscribeToken}`
        };
    },

    // Newsletter template
    newsletter: (campaign, unsubscribeToken) => {
        const siteUrl = process.env.SITE_URL || 'http://localhost:3000';
        return {
            subject: campaign.subject,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
                        .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                        .header { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 30px 20px; text-align: center; }
                        .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
                        .content { padding: 30px 20px; }
                        .content p { margin: 0 0 15px 0; color: #555; }
                        .footer { padding: 20px; text-align: center; font-size: 12px; color: #999; background: #f9fafb; }
                        .footer a { color: #8b5cf6; text-decoration: none; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>${campaign.title || 'Newsletter'}</h1>
                        </div>
                        <div class="content">
                            ${campaign.content.replace(/\[UNSUBSCRIBE_LINK\]/g, `${siteUrl}/unsubscribe?token=${unsubscribeToken}`)}
                        </div>
                        <div class="footer">
                            <p><a href="${siteUrl}/unsubscribe?token=${unsubscribeToken}">Unsubscribe</a> | <a href="${siteUrl}">Visit Website</a></p>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `${campaign.subject}\n\n${campaign.content.replace(/<[^>]*>/g, '').replace(/\[UNSUBSCRIBE_LINK\]/g, `${siteUrl}/unsubscribe?token=${unsubscribeToken}`)}\n\nUnsubscribe: ${siteUrl}/unsubscribe?token=${unsubscribeToken}`
        };
    },
};

// Notification helper functions
const sendNotification = {
    // Send new comment notification to article author
    newComment: async (comment, article, authorEmail) => {
        if (!authorEmail) return { success: false, error: 'No author email provided' };
        
        const template = emailTemplates.newComment(comment, article);
        return await sendEmail({
            to: authorEmail,
            ...template
        });
    },

    // Send article published notification
    articlePublished: async (article, recipients) => {
        if (!recipients || recipients.length === 0) return { success: false, error: 'No recipients provided' };
        
        const template = emailTemplates.articlePublished(article, recipients);
        const results = [];
        
        for (const recipient of recipients) {
            const result = await sendEmail({
                to: recipient,
                ...template
            });
            results.push({ recipient, ...result });
        }
        
        return { success: true, results };
    },

    // Send comment approved notification
    commentApproved: async (comment, article, commenterEmail) => {
        if (!commenterEmail) return { success: false, error: 'No commenter email provided' };
        
        const template = emailTemplates.commentApproved(comment, article);
        return await sendEmail({
            to: commenterEmail,
            ...template
        });
    },

    // Send comment rejected notification
    commentRejected: async (comment, article, commenterEmail) => {
        if (!commenterEmail) return { success: false, error: 'No commenter email provided' };
        
        const template = emailTemplates.commentRejected(comment, article);
        return await sendEmail({
            to: commenterEmail,
            ...template
        });
    },

    // Send newsletter welcome email
    newsletterWelcome: async (subscriberEmail, subscriberName, unsubscribeToken) => {
        if (!subscriberEmail) return { success: false, error: 'No subscriber email provided' };
        
        const template = emailTemplates.newsletterWelcome(subscriberName, unsubscribeToken);
        return await sendEmail({
            to: subscriberEmail,
            ...template
        });
    },

    // Send newsletter campaign
    newsletter: async (campaign, subscriberEmail, unsubscribeToken) => {
        if (!subscriberEmail) return { success: false, error: 'No subscriber email provided' };
        
        const template = emailTemplates.newsletter(campaign, unsubscribeToken);
        return await sendEmail({
            to: subscriberEmail,
            ...template
        });
    },
};

module.exports = {
    initializeEmailService,
    sendEmail,
    emailTemplates,
    sendNotification,
};
