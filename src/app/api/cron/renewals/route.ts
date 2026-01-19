import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendRenewalReminder } from '@/lib/email'

/**
 * Cron Job: Send renewal reminders for services expiring within 30 days
 * 
 * This endpoint should be called daily via:
 * - Vercel Cron (vercel.json)
 * - External cron service (cron-job.org, etc.)
 * - Manual trigger
 * 
 * Add to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/renewals",
 *     "schedule": "0 9 * * *"
 *   }]
 * }
 */
export async function GET(request: Request) {
    // Verify cron secret (optional security)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        // Find services expiring within 30 days that haven't been reminded yet
        const thirtyDaysFromNow = new Date()
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

        const services = await prisma.service.findMany({
            where: {
                status: 'ACTIVE',
                isReminderSent: false,
                renewDate: {
                    lte: thirtyDaysFromNow,
                    gte: new Date() // Not already expired
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
            // Skip if company has no email
            if (!service.company.email) {
                results.push({ serviceName: service.name, success: false, error: 'No email' })
                failed++
                continue
            }

            // Calculate days left
            const daysLeft = Math.ceil(
                (service.renewDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            )

            // Send reminder email
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
                // Mark as reminded
                await prisma.service.update({
                    where: { id: service.id },
                    data: { isReminderSent: true }
                })
                sent++
                results.push({ serviceName: service.name, success: true })
            } else {
                failed++
                results.push({ serviceName: service.name, success: false, error: emailResult.error })
            }
        }

        return NextResponse.json({
            success: true,
            message: `Renewal reminders processed`,
            stats: {
                total: services.length,
                sent,
                failed
            },
            results
        })
    } catch (error) {
        console.error('Cron renewals error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}
