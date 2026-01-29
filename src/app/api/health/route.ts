/**
 * @file src/app/api/health/route.ts
 * @description Health check endpoint for monitoring and load balancers
 * @usage Used by Docker healthcheck, load balancers, and monitoring systems
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/server/db'
import { redis, logger } from '@/shared/lib'

interface HealthStatus {
    status: 'healthy' | 'unhealthy' | 'degraded'
    timestamp: string
    version: string
    checks: {
        database: {
            status: 'up' | 'down'
            responseTime: number
            message?: string
        }
        cache: {
            status: 'up' | 'down'
            responseTime: number
            message?: string
        }
        memory: {
            status: 'up' | 'down'
            used: number
            total: number
            percentage: number
        }
    }
    uptime: number
}

const START_TIME = Date.now()

/**
 * Basic health check - lightweight endpoint for load balancers
 * Returns 200 if application is running
 */
export async function GET(request: Request) {
    const url = new URL(request.url)
    const checkType = url.searchParams.get('type') || 'basic'

    // Basic health check - just verify app is running
    if (checkType === 'basic') {
        return NextResponse.json(
            {
                status: 'healthy',
                timestamp: new Date().toISOString(),
                uptime: Math.floor((Date.now() - START_TIME) / 1000),
            },
            {
                status: 200,
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                },
            }
        )
    }

    // Comprehensive health check - verify all dependencies
    const health: HealthStatus = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
        checks: {
            database: {
                status: 'down',
                responseTime: 0,
            },
            cache: {
                status: 'down',
                responseTime: 0,
            },
            memory: {
                status: 'up',
                used: 0,
                total: 0,
                percentage: 0,
            },
        },
        uptime: Math.floor((Date.now() - START_TIME) / 1000),
    }

    // Check database connection
    const dbStart = Date.now()
    try {
        await prisma.$queryRaw`SELECT 1`
        health.checks.database = {
            status: 'up',
            responseTime: Date.now() - dbStart,
        }
    } catch (error) {
        health.checks.database = {
            status: 'down',
            responseTime: Date.now() - dbStart,
            message: error instanceof Error ? error.message : 'Unknown error',
        }
        health.status = 'unhealthy'
        logger.error({ error }, 'Health check: Database connection failed')
    }

    // Check Redis connection
    const cacheStart = Date.now()
    try {
        await redis.ping()
        health.checks.cache = {
            status: 'up',
            responseTime: Date.now() - cacheStart,
        }
    } catch (error) {
        health.checks.cache = {
            status: 'down',
            responseTime: Date.now() - cacheStart,
            message: error instanceof Error ? error.message : 'Unknown error',
        }
        // Cache is not critical, mark as degraded instead of unhealthy
        if (health.status === 'healthy') {
            health.status = 'degraded'
        }
        logger.warn({ error }, 'Health check: Cache connection failed')
    }

    // Check memory usage
    const memUsage = process.memoryUsage()
    const maxMemory = 1024 * 1024 * 1024 // 1GB default
    const usedPercentage = (memUsage.heapUsed / maxMemory) * 100

    health.checks.memory = {
        status: usedPercentage > 90 ? 'down' : 'up',
        used: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
        total: Math.round(maxMemory / 1024 / 1024), // MB
        percentage: Math.round(usedPercentage),
    }

    if (usedPercentage > 90) {
        health.status = 'unhealthy'
        logger.error({ memory: health.checks.memory }, 'Health check: Memory usage critical')
    } else if (usedPercentage > 75 && health.status === 'healthy') {
        health.status = 'degraded'
        logger.warn({ memory: health.checks.memory }, 'Health check: Memory usage high')
    }

    // Determine HTTP status code
    const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503

    return NextResponse.json(health, {
        status: statusCode,
        headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
        },
    })
}

/**
 * Readiness check - verifies application is ready to accept traffic
 */
export async function HEAD() {
    try {
        // Quick database check
        await prisma.$queryRaw`SELECT 1`

        return new NextResponse(null, {
            status: 200,
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
            },
        })
    } catch {
        return new NextResponse(null, {
            status: 503,
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
            },
        })
    }
}
