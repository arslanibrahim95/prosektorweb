import { prisma } from '@/lib/prisma'
import { sendRenewalReminder } from '@/lib/email'
import { logger } from '@/lib/logger'
import { safeApi } from '@/lib/safe-api'

export const GET = safeApi(async (request, { requestId }) => {
    // Verify cron secret (Mandatory security)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
        throw new Error('Unauthorized')
    }

    // Find services expiring within 30 days that haven't been reminded yet
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

    const services = await prisma.service.findMany({
        where: {
            status: 'ACTIVE',
            isReminderSent: false,
            renewDate: {
                lte: thirtyDaysFromNow,
                gte: new Date()
            }
        },
        include: {
            company: true
        }
    })

    let sent = 0
    let failed = 0
    const results: { serviceName: string; success: boolean; error?: string }[] = []

    for (const service of services) {
        if (!service.company.email) {
            results.push({ serviceName: service.name, success: false, error: 'No email' })
            failed++
            continue
        }

        const daysLeft = Math.ceil(
            (service.renewDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        )

        const emailResult = await sendRenewalReminder({
            to: service.company.email,
            companyName: service.company.name,
            serviceName: service.name,
            renewDate: service.renewDate.toLocaleDateString('tr-TR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            }),
            daysLeft
        })

        if (emailResult.success) {
            await prisma.service.update({
                where: { id: service.id },
                data: { isReminderSent: true }
            })
            sent++
            results.push({ serviceName: service.name, success: true })
        } else {
            failed++
            logger.error({ requestId, serviceId: service.id, error: emailResult.error }, 'Failed to send reminder email')
            results.push({ serviceName: service.name, success: false, error: emailResult.error })
        }
    }

    const stats = {
        total: services.length,
        sent,
        failed
    }

    return {
        data: results,
        stats, // success envelope will put this in root if we adjust it, or just use nested
    }
})
