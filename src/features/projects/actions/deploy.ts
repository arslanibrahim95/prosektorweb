'use server';

/**
 * Site Deploy Server Actions
 * Statik site oluşturma ve deploy işlemleri
 */

import { prisma } from '@/server/db';
import { generateStaticSite } from '@/features/projects/lib/deploy/static-generator';
import { SiteExporter } from '@/features/projects/lib/deploy/exporter';
import { getCloudflareService, getDefaultServerIp } from '@/server/integrations/cloudflare';
import { revalidatePath } from 'next/cache';
import fs from 'fs/promises';
import path from 'path';
import { auth } from '@/auth';

// ================================
// TYPES
// ================================

interface DeployResult {
    success: boolean;
    previewUrl?: string;
    siteUrl?: string;
    pagesGenerated?: number;
    error?: string;
}

interface ExportResult {
    success: boolean;
    outputPath?: string;
    files?: string[];
    error?: string;
}

// ================================
// CONSTANTS
// ================================

const OUTPUT_DIR = process.env.SITE_OUTPUT_DIR || '/tmp/generated_sites';
const PREVIEW_DOMAIN = process.env.PREVIEW_DOMAIN || 'preview.prosektorweb.com';

// ================================
// HELPERS
// ================================
async function requireAdmin() {
    const session = await auth();
    if (!session || session.user?.role !== 'ADMIN') {
        throw new Error('Unauthorized: Admin access required');
    }
}

// ================================
// SERVER ACTIONS
// ================================

/**
 * Statik siteyi oluştur ve dosya sistemine kaydet
 */
export async function exportSite(projectId: string): Promise<ExportResult> {
    try {
        await requireAdmin();

        // 1. Site içeriklerini oluştur
        const result = await generateStaticSite(projectId);

        if (!result.success || !result.pages) {
            return { success: false, error: result.error || 'Site oluşturulamadı' };
        }

        // 2. Proje bilgilerini al
        const project = await prisma.webProject.findUnique({
            where: { id: projectId },
            include: { company: true, domain: true },
        });

        if (!project) {
            return { success: false, error: 'Proje bulunamadı' };
        }

        const domain = project.domain?.name || `${project.id}.preview`;

        // Sanitize path components to prevent traversal
        const safeDomain = path.basename(domain);
        const siteDir = path.join(OUTPUT_DIR, safeDomain);

        // 3. Klasör oluştur
        await fs.mkdir(siteDir, { recursive: true });

        // 4. Dosyaları yaz
        const files: string[] = [];
        for (const page of result.pages) {
            // Path normalization security fix
            const safeFilename = path.basename(page.filename);
            const filePath = path.join(siteDir, safeFilename);
            await fs.writeFile(filePath, page.content, 'utf-8');
            files.push(safeFilename);
        }

        // 5. Manifest oluştur
        await SiteExporter.createManifest({
            domain: safeDomain,
            companyName: project.company.name,
            companyId: project.company.id,
            outputDir: OUTPUT_DIR,
        });

        // 6. Proje durumunu güncelle
        await prisma.webProject.update({
            where: { id: projectId },
            data: {
                status: 'REVIEW',
                previewUrl: `https://${project.id}.${PREVIEW_DOMAIN}`,
            },
        });

        revalidatePath(`/admin/projects/${projectId}`);

        return {
            success: true,
            outputPath: siteDir,
            files,
        };
    } catch (error) {
        console.error('exportSite error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Export hatası',
        };
    }
}

/**
 * Preview subdomain oluştur (Cloudflare)
 */
export async function createPreview(projectId: string): Promise<DeployResult> {
    try {
        await requireAdmin();

        // 1. Önce siteyi export et
        const exportResult = await exportSite(projectId);

        if (!exportResult.success) {
            return { success: false, error: exportResult.error };
        }

        // 2. Cloudflare servisini al
        const cf = await getCloudflareService();
        if (!cf) {
            // Cloudflare yoksa sadece local export yap
            return {
                success: true,
                pagesGenerated: exportResult.files?.length || 0,
                previewUrl: `file://${exportResult.outputPath}/index.html`,
            };
        }

        // 3. Preview subdomain oluştur
        const serverIp = getDefaultServerIp();
        if (!serverIp) {
            return {
                success: true,
                pagesGenerated: exportResult.files?.length || 0,
                previewUrl: `file://${exportResult.outputPath}/index.html`,
            };
        }

        const result = await cf.createPreviewSubdomain(
            PREVIEW_DOMAIN,
            projectId.slice(0, 8),
            serverIp
        );

        if (result.success) {
            await prisma.webProject.update({
                where: { id: projectId },
                data: { previewUrl: result.url },
            });
        }

        revalidatePath(`/admin/projects/${projectId}`);

        return {
            success: true,
            pagesGenerated: exportResult.files?.length || 0,
            previewUrl: result.url || `file://${exportResult.outputPath}/index.html`,
        };
    } catch (error) {
        console.error('createPreview error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Preview oluşturulamadı',
        };
    }
}

/**
 * Siteyi canlıya al (Production deploy)
 */
export async function deploySite(projectId: string): Promise<DeployResult> {
    try {
        await requireAdmin();

        const project = await prisma.webProject.findUnique({
            where: { id: projectId },
            include: { domain: true, company: true },
        });

        if (!project) {
            return { success: false, error: 'Proje bulunamadı' };
        }

        if (!project.domain) {
            return { success: false, error: 'Domain atanmamış' };
        }

        // 1. Siteyi export et (henüz yoksa)
        const exportResult = await exportSite(projectId);
        if (!exportResult.success) {
            return { success: false, error: exportResult.error };
        }

        // 2. Cloudflare DNS kayıtları
        const cf = await getCloudflareService();
        if (cf) {
            const serverIp = getDefaultServerIp();
            if (serverIp) {
                const zone = await cf.getZoneByName(project.domain.name);
                if (zone) {
                    await cf.createStandardWebsiteDns(zone.id, project.domain.name, serverIp);
                }
            }
        }

        // 3. Proje durumunu güncelle
        await prisma.webProject.update({
            where: { id: projectId },
            data: {
                status: 'LIVE',
                siteUrl: `https://${project.domain.name}`,
                completedAt: new Date(),
            },
        });

        // 4. Domain durumunu güncelle
        await prisma.domain.update({
            where: { id: project.domain.id },
            data: { status: 'ACTIVE' },
        });

        revalidatePath(`/admin/projects/${projectId}`);

        return {
            success: true,
            siteUrl: `https://${project.domain.name}`,
            pagesGenerated: exportResult.files?.length || 0,
        };
    } catch (error) {
        console.error('deploySite error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Deploy hatası',
        };
    }
}

/**
 * Proje için site durumunu kontrol et
 */
export async function getSiteStatus(projectId: string) {
    try {
        const session = await auth();
        if (!session) return null;

        // Get project
        const project = await prisma.webProject.findUnique({
            where: { id: projectId },
            include: {
                domain: true,
                generatedContents: {
                    select: {
                        contentType: true,
                        status: true,
                    },
                },
                company: {
                    select: { id: true }
                }
            },
        });

        if (!project) return null;

        // Tenant Check (Eğer admin değilse sadece kendi şirketinin projesini görebilir)
        if (session.user?.role !== 'ADMIN') {
            const user = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { companyId: true }
            });
            if (!user?.companyId || user.companyId !== project.company.id) {
                return null;
            }
        }

        const approvedCount = project.generatedContents.filter(
            (c) => c.status === 'APPROVED'
        ).length;

        const totalCount = project.generatedContents.length;

        return {
            projectId,
            status: project.status,
            domain: project.domain?.name,
            previewUrl: project.previewUrl,
            siteUrl: project.siteUrl,
            contentStats: {
                total: totalCount,
                approved: approvedCount,
                ready: approvedCount >= 3, // En az 3 sayfa onaylı olmalı
            },
        };

    } catch (error) {
        return null;
    }
}
