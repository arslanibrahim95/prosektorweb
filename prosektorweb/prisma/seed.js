const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Seeding database...\n');

    // Load blog data
    const dataPath = path.join(__dirname, 'seed-data.json');
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const data = JSON.parse(rawData);

    const { posts, categories } = data;

    console.log(`📁 ${posts.length} blog posts found`);
    console.log(`📁 ${categories.length} categories found\n`);

    // Create categories
    console.log('Creating categories...');
    for (const cat of categories) {
        await prisma.blogCategory.upsert({
            where: { slug: cat.slug },
            update: { name: cat.name },
            create: {
                name: cat.name,
                slug: cat.slug,
            },
        });
    }
    console.log(`✓ ${categories.length} categories created/updated\n`);

    // Get category map
    const categoryMap = {};
    const dbCategories = await prisma.blogCategory.findMany();
    for (const cat of dbCategories) {
        categoryMap[cat.slug] = cat.id;
    }

    // Create posts
    console.log('Creating blog posts...');
    let created = 0;
    let skipped = 0;

    for (const post of posts) {
        try {
            const existing = await prisma.blogPost.findUnique({
                where: { slug: post.slug },
            });

            if (existing) {
                skipped++;
                continue;
            }

            // Get category ID
            const categorySlug = post.category?.slug || post.categorySlug;
            const categoryId = categoryMap[categorySlug] || null;

            await prisma.blogPost.create({
                data: {
                    title: post.title,
                    slug: post.slug,
                    excerpt: post.excerpt || null,
                    content: post.content || '',
                    coverImage: post.coverImage || null,
                    categoryId: categoryId,
                    tags: JSON.stringify(post.tags || []),
                    authorName: post.author?.name || post.authorName || 'ProSektorWeb',
                    readingTime: post.readingTime || post.readingTimeMinutes || 5,
                    metaTitle: post.metaTitle || post.title,
                    metaDescription: post.metaDescription || post.excerpt || '',
                    published: true,
                    featured: post.featured || false,
                    publishedAt: post.publishedAt ? new Date(post.publishedAt) : new Date(),
                },
            });
            created++;

            if (created % 50 === 0) {
                console.log(`  ... ${created} posts created`);
            }
        } catch (error) {
            console.error(`Error creating post ${post.slug}:`, error.message);
        }
    }

    console.log(`\n✓ ${created} posts created`);
    console.log(`⏭ ${skipped} posts skipped (already exist)`);

    console.log('\n✅ Seeding complete!');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
