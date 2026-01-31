import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

const prisma = new PrismaClient()

async function main() {
    console.log('Start seeding from backup...')

    const backupPath = path.join(__dirname, 'blog-backup/all-blogs-consolidated.json')
    if (!fs.existsSync(backupPath)) {
        console.error('Backup file not found at:', backupPath)
        process.exit(1)
    }

    const rawData = fs.readFileSync(backupPath, 'utf-8')
    const data = JSON.parse(rawData)
    const posts = data.posts || []

    console.log(`Found ${posts.length} posts in backup.`)

    for (const post of posts) {
        console.log(`Processing: ${post.title}`)

        // 1. Upsert Category
        // Backup category format: { name: "...", slug: "..." }
        let categoryId = null
        if (post.category && post.category.slug) {
            const category = await prisma.blogCategory.upsert({
                where: { slug: post.category.slug },
                update: {
                    name: post.category.name
                },
                create: {
                    name: post.category.name,
                    slug: post.category.slug
                }
            })
            categoryId = category.id
        }

        // 2. Transform Tags
        // Backup tags format: [ { name: "...", slug: "..." } ]
        // Target format for compatibility: JSON.stringify(['Tag1', 'Tag2']) or just array if Prisma handles it (but strict compatibility with parseTags suggests stringify)
        // Let's look at parseTags again:
        // if (typeof tags === 'string') JSON.parse...
        // We will store it as a stringified array to match previous behavior exactly.

        let tagsFormatted = "[]"
        if (Array.isArray(post.tags)) {
            const tagNames = post.tags.map((t: any) => t.name)
            tagsFormatted = JSON.stringify(tagNames)
        }

        // 3. Upsert Post
        // Note: Backup has 'publishedAt' as string, need to convert to Date
        await prisma.blogPost.upsert({
            where: { slug: post.slug },
            update: {
                title: post.title,
                excerpt: post.excerpt,
                content: post.content,
                coverImage: post.coverImage,
                categoryId: categoryId,
                tags: tagsFormatted,
                authorName: post.author?.name || 'ProSektorWeb Editör',
                readingTime: post.readingTime || 5,
                publishedAt: post.publishedAt ? new Date(post.publishedAt) : new Date(),
                featured: post.featured || false,
                published: true // Ensure visibility
            },
            create: {
                title: post.title,
                slug: post.slug,
                excerpt: post.excerpt,
                content: post.content,
                coverImage: post.coverImage,
                categoryId: categoryId,
                tags: tagsFormatted,
                authorName: post.author?.name || 'ProSektorWeb Editör',
                readingTime: post.readingTime || 5,
                publishedAt: post.publishedAt ? new Date(post.publishedAt) : new Date(),
                featured: post.featured || false,
                published: true
            }
        })
    }

    console.log('Seeding finished successfully.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
