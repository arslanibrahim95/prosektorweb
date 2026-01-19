import { Resend } from 'resend'

const getResend = () => {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey && process.env.NODE_ENV === 'production') {
        console.warn('RESEND_API_KEY is missing in production environment.')
    }
    return new Resend(apiKey || 'missing_key')
}

const resend = getResend()

interface SendProposalEmailParams {
    to: string
    companyName: string
    proposalSubject: string
    approvalUrl: string
    total: string
}

export async function sendProposalEmail({
    to,
    companyName,
    proposalSubject,
    approvalUrl,
    total
}: SendProposalEmailParams) {
    try {
        const { data, error } = await resend.emails.send({
            from: 'ProSektorWeb <noreply@prosektorweb.com>',
            to: [to],
            subject: `Teklif: ${proposalSubject}`,
            html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 24px;">ProSektorWeb</h1>
                        <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0 0;">Yeni Teklif</p>
                    </div>
                    
                    <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
                        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                            Sayın <strong>${companyName}</strong>,
                        </p>
                        
                        <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
                            "<strong>${proposalSubject}</strong>" konulu teklifimiz hazırlanmıştır.
                        </p>
                        
                        <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
                            <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px;">Toplam Tutar</p>
                            <p style="color: #dc2626; font-size: 28px; font-weight: bold; margin: 0;">${total} ₺</p>
                        </div>
                        
                        <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
                            Teklifi incelemek ve onaylamak için aşağıdaki butona tıklayın:
                        </p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${approvalUrl}" 
                               style="display: inline-block; background: #dc2626; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
                                Teklifi Onayla
                            </a>
                        </div>
                        
                        <p style="color: #9ca3af; font-size: 12px; text-align: center;">
                            Bu link size özeldir. Lütfen başkalarıyla paylaşmayın.
                        </p>
                    </div>
                    
                    <div style="background: #f9fafb; padding: 20px; border-radius: 0 0 16px 16px; border: 1px solid #e5e7eb; border-top: none; text-align: center;">
                        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                            © 2026 ProSektorWeb. Tüm hakları saklıdır.
                        </p>
                    </div>
                </div>
            `
        })

        if (error) {
            console.error('Resend error:', error)
            return { success: false, error: error.message }
        }

        return { success: true, messageId: data?.id }
    } catch (error) {
        console.error('sendProposalEmail error:', error)
        return { success: false, error: 'E-posta gönderilemedi.' }
    }
}

interface SendRenewalReminderParams {
    to: string
    companyName: string
    serviceName: string
    renewDate: string
    daysLeft: number
}

export async function sendRenewalReminder({
    to,
    companyName,
    serviceName,
    renewDate,
    daysLeft
}: SendRenewalReminderParams) {
    try {
        const { data, error } = await resend.emails.send({
            from: 'ProSektorWeb <noreply@prosektorweb.com>',
            to: [to],
            subject: `Yenileme Hatırlatması: ${serviceName}`,
            html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 24px;">⏰ Yenileme Hatırlatması</h1>
                    </div>
                    
                    <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
                        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                            Sayın <strong>${companyName}</strong>,
                        </p>
                        
                        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0;">
                            <p style="color: #92400e; margin: 0; font-size: 14px;">
                                <strong>${serviceName}</strong> hizmetinizin süresi <strong>${daysLeft} gün</strong> içinde dolacaktır.
                            </p>
                        </div>
                        
                        <p style="color: #6b7280; font-size: 14px;">
                            <strong>Yenileme Tarihi:</strong> ${renewDate}
                        </p>
                        
                        <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
                            Kesintisiz hizmet için lütfen yenileme işleminizi gerçekleştirin.
                        </p>
                    </div>
                    
                    <div style="background: #f9fafb; padding: 20px; border-radius: 0 0 16px 16px; border: 1px solid #e5e7eb; border-top: none; text-align: center;">
                        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                            © 2026 ProSektorWeb. Tüm hakları saklıdır.
                        </p>
                    </div>
                </div>
            `
        })

        if (error) {
            console.error('Resend error:', error)
            return { success: false, error: error.message }
        }

        return { success: true, messageId: data?.id }
    } catch (error) {
        console.error('sendRenewalReminder error:', error)
        return { success: false, error: 'E-posta gönderilemedi.' }
    }
}
