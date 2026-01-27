import { Resend } from 'resend'

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY)

// Default sender - you can customize this per organization later
const DEFAULT_FROM = process.env.EMAIL_FROM || 'AceCPAs <noreply@acecpas.com>'

interface SendMagicLinkEmailParams {
    to: string
    clientName?: string
    dealName: string
    firmName: string
    portalUrl: string
    expiresAt: string
    itemCount: number
}

export async function sendMagicLinkEmail({
    to,
    clientName,
    dealName,
    firmName,
    portalUrl,
    expiresAt,
    itemCount
}: SendMagicLinkEmailParams) {
    const expiryDate = new Date(expiresAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    })

    const greeting = clientName ? `Hi ${clientName},` : 'Hello,'

    const { data, error } = await resend.emails.send({
        from: DEFAULT_FROM,
        to: [to],
        subject: `${firmName}: ${itemCount} item${itemCount > 1 ? 's' : ''} need${itemCount === 1 ? 's' : ''} your response - ${dealName}`,
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Open Items - ${firmName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td style="padding: 40px 20px;">
                <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); padding: 32px 40px;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                                ${firmName}
                            </h1>
                            <p style="margin: 8px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">
                                Secure Document Portal
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <p style="margin: 0 0 24px 0; font-size: 16px; color: #18181b; line-height: 1.6;">
                                ${greeting}
                            </p>
                            
                            <p style="margin: 0 0 24px 0; font-size: 16px; color: #18181b; line-height: 1.6;">
                                Your CPA team requires your input on <strong>${itemCount} item${itemCount > 1 ? 's' : ''}</strong> related to:
                            </p>
                            
                            <!-- Deal Info Box -->
                            <table role="presentation" style="width: 100%; margin-bottom: 24px;">
                                <tr>
                                    <td style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px 20px; border-radius: 0 8px 8px 0;">
                                        <p style="margin: 0; font-size: 18px; font-weight: 600; color: #1e40af;">
                                            ${dealName}
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 0 0 32px 0; font-size: 16px; color: #52525b; line-height: 1.6;">
                                Please click the button below to securely view and respond to these items. You can also upload any supporting documents directly through the portal.
                            </p>
                            
                            <!-- CTA Button -->
                            <table role="presentation" style="width: 100%; margin-bottom: 32px;">
                                <tr>
                                    <td style="text-align: center;">
                                        <a href="${portalUrl}" 
                                           style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4);">
                                            View & Respond to Items
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Expiry Notice -->
                            <table role="presentation" style="width: 100%; margin-bottom: 24px;">
                                <tr>
                                    <td style="background-color: #fef3c7; border-radius: 8px; padding: 16px 20px;">
                                        <p style="margin: 0; font-size: 14px; color: #92400e;">
                                            ⏰ <strong>This link expires on ${expiryDate}.</strong> Please complete your responses before then.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Alternative Link -->
                            <p style="margin: 0; font-size: 14px; color: #71717a; line-height: 1.6;">
                                If the button doesn't work, copy and paste this link into your browser:
                            </p>
                            <p style="margin: 8px 0 0 0; font-size: 12px; color: #3b82f6; word-break: break-all;">
                                ${portalUrl}
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f4f4f5; padding: 24px 40px; border-top: 1px solid #e4e4e7;">
                            <table role="presentation" style="width: 100%;">
                                <tr>
                                    <td>
                                        <p style="margin: 0 0 8px 0; font-size: 12px; color: #71717a;">
                                            🔒 This is a secure, encrypted link intended only for the recipient.
                                        </p>
                                        <p style="margin: 0; font-size: 12px; color: #71717a;">
                                            If you did not expect this email, please contact ${firmName} directly.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `,
        text: `
${greeting}

Your CPA team at ${firmName} requires your input on ${itemCount} item${itemCount > 1 ? 's' : ''} related to: ${dealName}

Please visit the following link to view and respond to these items:
${portalUrl}

⏰ This link expires on ${expiryDate}. Please complete your responses before then.

This is a secure, encrypted link intended only for the recipient.
If you did not expect this email, please contact ${firmName} directly.
        `.trim()
    })

    if (error) {
        console.error('Email send error:', error)
        throw new Error(`Failed to send email: ${error.message}`)
    }

    return { id: data?.id, success: true }
}

interface SendResponseNotificationParams {
    to: string
    dealName: string
    firmName: string
    itemQuestion: string
    clientResponse: string
    dashboardUrl: string
}

export async function sendResponseNotification({
    to,
    dealName,
    firmName,
    itemQuestion,
    clientResponse,
    dashboardUrl
}: SendResponseNotificationParams) {
    const { data, error } = await resend.emails.send({
        from: DEFAULT_FROM,
        to: [to],
        subject: `Client responded: ${dealName}`,
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td style="padding: 40px 20px;">
                <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    
                    <tr>
                        <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 24px 40px;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 600;">
                                ✅ Client Responded
                            </h1>
                        </td>
                    </tr>
                    
                    <tr>
                        <td style="padding: 32px 40px;">
                            <p style="margin: 0 0 16px 0; font-size: 16px; color: #18181b;">
                                A client has responded to an open item for <strong>${dealName}</strong>.
                            </p>
                            
                            <div style="background-color: #f4f4f5; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
                                <p style="margin: 0 0 8px 0; font-size: 12px; color: #71717a; text-transform: uppercase; font-weight: 600;">
                                    Question
                                </p>
                                <p style="margin: 0; font-size: 14px; color: #18181b;">
                                    ${itemQuestion}
                                </p>
                            </div>
                            
                            <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; border-radius: 0 8px 8px 0; padding: 16px; margin-bottom: 24px;">
                                <p style="margin: 0 0 8px 0; font-size: 12px; color: #065f46; text-transform: uppercase; font-weight: 600;">
                                    Client Response
                                </p>
                                <p style="margin: 0; font-size: 14px; color: #18181b;">
                                    ${clientResponse}
                                </p>
                            </div>
                            
                            <a href="${dashboardUrl}" 
                               style="display: inline-block; background-color: #18181b; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 14px; font-weight: 500;">
                                View in Dashboard →
                            </a>
                        </td>
                    </tr>
                    
                    <tr>
                        <td style="background-color: #f4f4f5; padding: 16px 40px; border-top: 1px solid #e4e4e7;">
                            <p style="margin: 0; font-size: 12px; color: #71717a;">
                                ${firmName} • Open Items Notification
                            </p>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `,
        text: `
Client Responded - ${dealName}

Question:
${itemQuestion}

Client Response:
${clientResponse}

View in dashboard: ${dashboardUrl}
        `.trim()
    })

    if (error) {
        console.error('Notification email error:', error)
        throw new Error(`Failed to send notification: ${error.message}`)
    }

    return { id: data?.id, success: true }
}
