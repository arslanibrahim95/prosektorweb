import { writeFile, unlink, mkdir } from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

interface UploadResult {
    path: string
    url: string
    filename: string
}

export function validateFile(file: File): string | null {
    if (!ALLOWED_TYPES.includes(file.type)) {
        return 'Desteklenmeyen dosya türü. Sadece JPEG, PNG, WebP ve SVG kabul edilir.'
    }
    if (file.size > MAX_SIZE) {
        return 'Dosya boyutu 5MB\'ı aşamaz.'
    }
    return null
}

export async function uploadFile(buffer: Buffer, originalName: string, mimeType: string, companyId: string): Promise<UploadResult> {
    const ext = path.extname(originalName) || mimeTypeToExt(mimeType)
    const filename = `${crypto.randomUUID()}${ext}`
    const dir = path.join(process.cwd(), 'public', 'uploads', companyId)

    await mkdir(dir, { recursive: true })

    const filePath = path.join(dir, filename)
    await writeFile(filePath, buffer)

    const storagePath = `uploads/${companyId}/${filename}`
    const url = `/${storagePath}`

    return { path: storagePath, url, filename }
}

export async function deleteFile(storagePath: string): Promise<void> {
    const filePath = path.join(process.cwd(), 'public', storagePath)
    try {
        await unlink(filePath)
    } catch {
        // File may already be deleted
    }
}

function mimeTypeToExt(mimeType: string): string {
    const map: Record<string, string> = {
        'image/jpeg': '.jpg',
        'image/png': '.png',
        'image/webp': '.webp',
        'image/svg+xml': '.svg',
    }
    return map[mimeType] || '.bin'
}
