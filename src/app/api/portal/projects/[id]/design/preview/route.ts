import { prisma } from '@/server/db'
import { safeApi } from '@/shared/lib/safe-api'
import { NextRequest } from 'next/server'
import { getApiCompanyId, validateProjectAccess } from '@/server/lib/api-auth'

export const GET = safeApi<string, { id: string }>(async (_request: NextRequest, { params }) => {
    const { companyId, isAdmin } = await getApiCompanyId()
    const { id } = params
    await validateProjectAccess(id, companyId, isAdmin)

    const designContent = await prisma.generatedContent.findFirst({
        where: { webProjectId: id, contentType: 'DESIGN' }
    })

    let vars: Record<string, string> = {
        '--site-primary': '#2563eb',
        '--site-secondary': '#1e40af',
        '--site-accent': '#f59e0b',
        '--site-bg': '#ffffff',
        '--site-font-heading': 'Inter',
        '--site-font-body': 'Inter',
    }

    if (designContent) {
        try {
            const data = JSON.parse(designContent.content)
            vars = {
                '--site-primary': data.primaryColor || vars['--site-primary'],
                '--site-secondary': data.secondaryColor || vars['--site-secondary'],
                '--site-accent': data.accentColor || vars['--site-accent'],
                '--site-bg': data.bgColor || vars['--site-bg'],
                '--site-font-heading': data.fontHeading || vars['--site-font-heading'],
                '--site-font-body': data.fontBody || vars['--site-font-body'],
            }
        } catch {}
    }

    const css = `:root {\n${Object.entries(vars).map(([k, v]) => `  ${k}: ${v};`).join('\n')}\n}`
    return css
})
