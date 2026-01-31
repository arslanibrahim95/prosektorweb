import { auth } from '@/auth'
import { prisma } from '@/server/db'
import { safeApi } from '@/shared/lib/safe-api'
import { uploadFile, validateFile } from '@/server/lib/storage'
import { MediaCategory } from '@prisma/client'

export const POST = safeApi(async (request) => {
    const session = await auth()
    if (!session?.user?.id) throw new Error('Unauthorized')

    const formData = await request.formData()

    // Admin can specify companyId; clients use their own
    let companyId: string
    if (session.user.role === 'ADMIN') {
        const cid = formData.get('companyId') as string
        if (!cid) throw new Error('companyId is required for admin')
        companyId = cid
    } else {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { companyId: true }
        })
        if (!user?.companyId) throw new Error('No company found')
        companyId = user.companyId
    }

    const file = formData.get('file') as File | null
    if (!file) throw new Error('Dosya bulunamadı.')

    const validationError = validateFile(file)
    if (validationError) throw new Error(validationError)

    const categoryStr = (formData.get('category') as string) || 'GENERAL'
    const validCategories: MediaCategory[] = ['LOGO', 'GALLERY', 'TEAM', 'BLOG', 'GENERAL']
    const category = validCategories.includes(categoryStr as MediaCategory)
        ? (categoryStr as MediaCategory)
        : 'GENERAL'

    const alt = (formData.get('alt') as string) || null

    const buffer = Buffer.from(await file.arrayBuffer())
    const result = await uploadFile(buffer, file.name, file.type, companyId)

    const asset = await prisma.mediaAsset.create({
        data: {
            companyId,
            filename: result.filename,
            originalName: file.name,
            mimeType: file.type,
            size: file.size,
            path: result.path,
            url: result.url,
            alt,
            category,
        }
    })

    return asset
}, { checkCsrf: true })
