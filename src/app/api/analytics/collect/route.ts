
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'
import { z } from 'zod'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

// CORS Headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Request-Id',
}

// Event Schema
const EventSchema = z.object({
    projectId: z.string().uuid(),
    event: z.enum(['page_view', 'lead']), // Future: click, scroll, etc.
    metadata: z.object({
        url: z.string().optional(),
        referrer: z.string().optional(),
        path: z.string().optional(),
        title: z.string().optional(),
        device: z.string().optional(), // mobile, desktop etc
    }).optional(),
})

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST(req: NextRequest) {
    try {
        // 1. Rate Limiting
        const ip = await getClientIp()
        const limit = await checkRateLimit(`analytics:${ip}`, { limit: 60, windowSeconds: 60 }) // 60 requests per minute per IP

        if (!limit.success) {
            return NextResponse.json(
                { error: 'Too Many Requests' },
                { status: 429, headers: corsHeaders }
            )
        }

        // 2. Parse Body
        const body = await req.json()
        const validation = EventSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Invalid Payload', details: validation.error.format() },
                { status: 400, headers: corsHeaders }
            )
        }

        const { projectId, event, metadata } = validation.data

        // 3. Verify Project Exists & is LIVE (Optional cache this)
        // For performance we might assume valid ID if we trust the source, but checking DB is safer.
        // We can do a fast check or just attempt update and catch error.
        // Upserting stats relies on projectId being valid FK in most schemas.

        // Let's just go straight to upsert. If FK constraint fails, we catch it.
        // But for `SiteAnalytics` update, we need to know it exists.

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        // 4. Update Stats (Atomic)
        if (event === 'page_view') {
            await prisma.$transaction([
                // Update Daily Stats
                prisma.dailyStats.upsert({
                    where: {
                        projectId_date: {
                            projectId,
                            date: today
                        }
                    },
                    create: {
                        projectId,
                        date: today,
                        pageViews: 1,
                        visitors: 1, // Simple approximation
                        uniqueVisitors: 1, // Simple approximation
                    },
                    update: {
                        pageViews: { increment: 1 },
                        visitors: { increment: 1 }, // Logic for unique needed (fingerprint/cookie)? For now simple increment.
                    }
                }),
                // Update Total Summary
                prisma.siteAnalytics.update({
                    where: { projectId },
                    data: {
                        pageViews: { increment: 1 },
                        totalVisitors: { increment: 1 },
                        lastUpdated: new Date()
                    }
                })
            ])
        } else if (event === 'lead') {
            await prisma.$transaction([
                prisma.dailyStats.upsert({
                    where: { projectId_date: { projectId, date: today } },
                    create: { projectId, date: today, leads: 1 },
                    update: { leads: { increment: 1 } }
                }),
                // Capture Lead Detail
                prisma.leadCapture.create({
                    data: {
                        projectId,
                        type: 'CONTACT_FORM',
                        source: metadata?.url,
                        ipAddress: ip,
                        metadata: metadata as any
                    }
                })
            ])
        }

        return NextResponse.json({ success: true }, { headers: corsHeaders })

    } catch (error) {
        console.error('Analytics Ingestion Error:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500, headers: corsHeaders }
        )
    }
}
