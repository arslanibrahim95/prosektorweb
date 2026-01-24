
const { PrismaClient } = require('@prisma/client')
require('dotenv').config()
const prisma = new PrismaClient()

async function main() {
    try {
        const total = await prisma.blogPost.count()
        const published = await prisma.blogPost.count({ where: { published: true } })
        const posts = await prisma.blogPost.findMany({
            take: 5,
            select: { title: true, published: true, slug: true, content: true }
        })

        console.log(`Total Posts: ${total}`)
        console.log(`Published Posts: ${published}`)
        console.log('Sample Posts:')
        posts.forEach(p => {
            console.log(`- [${p.published ? 'X' : ' '}] ${p.title} (${p.slug}) Length: ${p.content?.length || 0}`)
        })
    } catch (e) {
        console.error(e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
