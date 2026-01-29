/**
 * @file src/app/api/openapi/route.ts
 * @description OpenAPI/Swagger specification endpoint for API documentation
 * @usage Access at /api/openapi to get the OpenAPI JSON specification
 */

import { NextResponse } from 'next/server'
import { auth } from '@/auth'

const OPENAPI_SPEC = {
    openapi: '3.0.3',
    info: {
        title: 'ProSektorWeb API',
        description: 'OSGB Management Platform API - Complete reference for all endpoints',
        version: '1.0.0',
        contact: {
            name: 'ProSektorWeb Support',
            email: 'support@prosektorweb.com',
        },
        license: {
            name: 'Proprietary',
        },
    },
    servers: [
        {
            url: 'https://prosektorweb.com/api',
            description: 'Production server',
        },
        {
            url: 'http://localhost:3000/api',
            description: 'Development server',
        },
    ],
    security: [
        {
            bearerAuth: [],
        },
    ],
    tags: [
        { name: 'Authentication', description: 'User authentication and session management' },
        { name: 'Companies', description: 'Company/CRM management' },
        { name: 'Finance', description: 'Invoices, payments, and services' },
        { name: 'Projects', description: 'Web project management' },
        { name: 'Support', description: 'Tickets and contact forms' },
        { name: 'System', description: 'Admin and system operations' },
        { name: 'Analytics', description: 'Analytics and reporting' },
        { name: 'Content', description: 'Blog and generated content' },
    ],
    paths: {
        '/health': {
            get: {
                tags: ['System'],
                summary: 'Health Check',
                description: 'Check API and dependency health status',
                parameters: [
                    {
                        name: 'type',
                        in: 'query',
                        description: 'Type of health check',
                        schema: {
                            type: 'string',
                            enum: ['basic', 'comprehensive'],
                            default: 'basic',
                        },
                    },
                ],
                responses: {
                    '200': {
                        description: 'Service is healthy',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        status: { type: 'string', enum: ['healthy', 'degraded'] },
                                        timestamp: { type: 'string', format: 'date-time' },
                                        version: { type: 'string' },
                                        uptime: { type: 'integer' },
                                        checks: {
                                            type: 'object',
                                            properties: {
                                                database: {
                                                    type: 'object',
                                                    properties: {
                                                        status: { type: 'string', enum: ['up', 'down'] },
                                                        responseTime: { type: 'integer' },
                                                    },
                                                },
                                                cache: {
                                                    type: 'object',
                                                    properties: {
                                                        status: { type: 'string', enum: ['up', 'down'] },
                                                        responseTime: { type: 'integer' },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    '503': {
                        description: 'Service is unhealthy',
                    },
                },
            },
        },
        '/auth/[...nextauth]': {
            get: {
                tags: ['Authentication'],
                summary: 'NextAuth Session',
                description: 'Get current user session',
                responses: {
                    '200': {
                        description: 'Session data',
                    },
                },
            },
            post: {
                tags: ['Authentication'],
                summary: 'Authentication Callback',
                description: 'Handle authentication callbacks',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    email: { type: 'string', format: 'email' },
                                    password: { type: 'string', format: 'password' },
                                },
                                required: ['email', 'password'],
                            },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'Authentication successful',
                    },
                    '401': {
                        description: 'Authentication failed',
                    },
                },
            },
        },
        '/contact': {
            post: {
                tags: ['Support'],
                summary: 'Submit Contact Form',
                description: 'Submit a contact form message',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string', minLength: 2 },
                                    email: { type: 'string', format: 'email' },
                                    phone: { type: 'string' },
                                    company: { type: 'string' },
                                    message: { type: 'string', minLength: 10 },
                                },
                                required: ['name', 'email', 'message'],
                            },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'Message sent successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: { type: 'boolean' },
                                        message: { type: 'string' },
                                        meta: {
                                            type: 'object',
                                            properties: {
                                                requestId: { type: 'string' },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    '429': {
                        description: 'Rate limit exceeded',
                    },
                },
            },
        },
        '/blog': {
            get: {
                tags: ['Content'],
                summary: 'List Blog Posts',
                description: 'Get a list of published blog posts',
                parameters: [
                    {
                        name: 'page',
                        in: 'query',
                        schema: { type: 'integer', default: 1 },
                    },
                    {
                        name: 'limit',
                        in: 'query',
                        schema: { type: 'integer', default: 10 },
                    },
                    {
                        name: 'category',
                        in: 'query',
                        schema: { type: 'string' },
                    },
                ],
                responses: {
                    '200': {
                        description: 'List of blog posts',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: {
                                            type: 'array',
                                            items: {
                                                type: 'object',
                                                properties: {
                                                    id: { type: 'string' },
                                                    title: { type: 'string' },
                                                    slug: { type: 'string' },
                                                    excerpt: { type: 'string' },
                                                    coverImage: { type: 'string' },
                                                    publishedAt: { type: 'string', format: 'date-time' },
                                                    readingTime: { type: 'integer' },
                                                },
                                            },
                                        },
                                        pagination: {
                                            type: 'object',
                                            properties: {
                                                page: { type: 'integer' },
                                                limit: { type: 'integer' },
                                                total: { type: 'integer' },
                                                totalPages: { type: 'integer' },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        '/blog/{slug}': {
            get: {
                tags: ['Content'],
                summary: 'Get Blog Post',
                description: 'Get a single blog post by slug',
                parameters: [
                    {
                        name: 'slug',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                    },
                ],
                responses: {
                    '200': {
                        description: 'Blog post details',
                    },
                    '404': {
                        description: 'Blog post not found',
                    },
                },
            },
        },
        '/categories': {
            get: {
                tags: ['Content'],
                summary: 'List Categories',
                description: 'Get all blog categories',
                responses: {
                    '200': {
                        description: 'List of categories',
                    },
                },
            },
        },
        '/analytics/collect': {
            post: {
                tags: ['Analytics'],
                summary: 'Collect Analytics Event',
                description: 'Collect analytics events from client websites',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    projectId: { type: 'string', format: 'uuid' },
                                    event: { type: 'string', enum: ['page_view', 'lead'] },
                                    metadata: {
                                        type: 'object',
                                        properties: {
                                            url: { type: 'string' },
                                            referrer: { type: 'string' },
                                            path: { type: 'string' },
                                            title: { type: 'string' },
                                            device: { type: 'string' },
                                        },
                                    },
                                },
                                required: ['projectId', 'event'],
                            },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'Event collected',
                    },
                    '429': {
                        description: 'Rate limit exceeded',
                    },
                },
            },
        },
        '/cron/renewals': {
            get: {
                tags: ['System'],
                summary: 'Service Renewal Cron',
                description: 'Cron job for service renewal reminders (requires auth)',
                security: [
                    {
                        bearerAuth: [],
                    },
                ],
                responses: {
                    '200': {
                        description: 'Cron job executed',
                    },
                    '401': {
                        description: 'Unauthorized',
                    },
                },
            },
        },
        '/portal/projects/{id}/settings': {
            put: {
                tags: ['Projects'],
                summary: 'Update Project Settings',
                description: 'Update settings for a client project',
                security: [
                    {
                        bearerAuth: [],
                    },
                ],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string' },
                                    description: { type: 'string' },
                                    settings: { type: 'object' },
                                },
                            },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'Settings updated',
                    },
                    '401': {
                        description: 'Unauthorized',
                    },
                    '403': {
                        description: 'Forbidden',
                    },
                },
            },
        },
        '/portal/content/{contentId}/approve': {
            post: {
                tags: ['Content'],
                summary: 'Approve Generated Content',
                description: 'Approve AI-generated content for publishing',
                security: [
                    {
                        bearerAuth: [],
                    },
                ],
                parameters: [
                    {
                        name: 'contentId',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                    },
                ],
                responses: {
                    '200': {
                        description: 'Content approved',
                    },
                },
            },
        },
        '/portal/content/{contentId}/reject': {
            post: {
                tags: ['Content'],
                summary: 'Reject Generated Content',
                description: 'Reject AI-generated content',
                security: [
                    {
                        bearerAuth: [],
                    },
                ],
                parameters: [
                    {
                        name: 'contentId',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                    },
                ],
                responses: {
                    '200': {
                        description: 'Content rejected',
                    },
                },
            },
        },
        '/portal/content/{contentId}/update': {
            put: {
                tags: ['Content'],
                summary: 'Update Generated Content',
                description: 'Update AI-generated content',
                security: [
                    {
                        bearerAuth: [],
                    },
                ],
                parameters: [
                    {
                        name: 'contentId',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    title: { type: 'string' },
                                    content: { type: 'string' },
                                    metaTitle: { type: 'string' },
                                    metaDescription: { type: 'string' },
                                },
                            },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'Content updated',
                    },
                },
            },
        },
    },
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'JWT token obtained from NextAuth session',
            },
        },
        schemas: {
            Error: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: false },
                    error: { type: 'string' },
                    code: { type: 'string' },
                    details: { type: 'object' },
                    meta: {
                        type: 'object',
                        properties: {
                            requestId: { type: 'string' },
                        },
                    },
                },
            },
            Company: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    taxId: { type: 'string' },
                    email: { type: 'string' },
                    phone: { type: 'string' },
                    status: { type: 'string', enum: ['LEAD', 'PROSPECT', 'NEGOTIATION', 'CUSTOMER', 'CHURNED'] },
                    naceCode: { type: 'string' },
                    dangerClass: { type: 'string', enum: ['LESS_DANGEROUS', 'DANGEROUS', 'VERY_DANGEROUS'] },
                    createdAt: { type: 'string', format: 'date-time' },
                },
            },
            Invoice: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    invoiceNo: { type: 'string' },
                    companyId: { type: 'string' },
                    issueDate: { type: 'string', format: 'date-time' },
                    dueDate: { type: 'string', format: 'date-time' },
                    subtotal: { type: 'number' },
                    taxRate: { type: 'number' },
                    taxAmount: { type: 'number' },
                    total: { type: 'number' },
                    status: { type: 'string', enum: ['DRAFT', 'PENDING', 'PAID', 'PARTIAL', 'CANCELLED'] },
                },
            },
            Project: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    description: { type: 'string' },
                    companyId: { type: 'string' },
                    status: { type: 'string', enum: ['DRAFT', 'DESIGNING', 'DEVELOPMENT', 'REVIEW', 'APPROVED', 'DEPLOYING', 'LIVE', 'PAUSED', 'CANCELLED'] },
                    priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] },
                    progress: { type: 'integer', minimum: 0, maximum: 100 },
                    siteUrl: { type: 'string' },
                    previewUrl: { type: 'string' },
                    createdAt: { type: 'string', format: 'date-time' },
                },
            },
        },
    },
}

/**
 * GET /api/openapi
 * Returns the OpenAPI specification
 */
export async function GET() {
    // Optionally check authentication for sensitive details
    const session = await auth()

    // Create a copy of the spec that we can modify
    const spec: any = { ...OPENAPI_SPEC }

    // If not authenticated, remove some sensitive endpoints
    if (!session) {
        // Filter out admin-only endpoints for public spec
        const publicPaths: Record<string, any> = {}
        for (const [path, methods] of Object.entries(spec.paths)) {
            if (!path.includes('admin') && !path.includes('cron')) {
                publicPaths[path] = methods
            }
        }
        spec.paths = publicPaths
    }

    return NextResponse.json(spec, {
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
        },
    })
}

/**
 * OPTIONS /api/openapi
 * Handle CORS preflight requests
 */
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    })
}
