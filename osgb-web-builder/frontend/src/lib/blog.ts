import fs from 'fs';
import path from 'path';

export interface BlogPost {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    coverImage: string;
    category: {
        name: string;
        slug: string;
    };
    tags: Array<{
        name: string;
        slug: string;
    }>;
    author: {
        name: string;
    };
    publishedAt: string;
    readingTime: number;
    featured: boolean;
}

export interface BlogCategory {
    name: string;
    slug: string;
    count: number;
}

const BLOG_DIR = path.join(process.cwd(), 'src/data/blog');

/**
 * Tüm blog yazılarını oku
 * Her yazı ayrı JSON dosyasında saklanır
 */
export function getAllPosts(): BlogPost[] {
    try {
        const files = fs.readdirSync(BLOG_DIR)
            .filter(f => f.endsWith('.json') && !f.startsWith('_'));

        const posts = files.map(file => {
            const content = fs.readFileSync(path.join(BLOG_DIR, file), 'utf-8');
            return JSON.parse(content) as BlogPost;
        });

        // Tarihe göre sırala (en yeni önce)
        return posts.sort((a, b) =>
            new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        );
    } catch (error) {
        console.error('Blog yazıları okunamadı:', error);
        return [];
    }
}

/**
 * Tek bir blog yazısını slug'a göre getir
 */
export function getPostBySlug(slug: string): BlogPost | null {
    try {
        const files = fs.readdirSync(BLOG_DIR)
            .filter(f => f.endsWith('.json') && !f.startsWith('_'));

        for (const file of files) {
            if (file.includes(slug)) {
                const content = fs.readFileSync(path.join(BLOG_DIR, file), 'utf-8');
                return JSON.parse(content) as BlogPost;
            }
        }
        return null;
    } catch (error) {
        console.error(`Blog yazısı bulunamadı: ${slug}`, error);
        return null;
    }
}

/**
 * Öne çıkan blog yazılarını getir
 */
export function getFeaturedPosts(limit: number = 3): BlogPost[] {
    const posts = getAllPosts();
    return posts.filter(p => p.featured).slice(0, limit);
}

/**
 * Kategoriye göre yazıları getir
 */
export function getPostsByCategory(categorySlug: string): BlogPost[] {
    const posts = getAllPosts();
    return posts.filter(p => p.category.slug === categorySlug);
}

/**
 * Tüm kategorileri getir (hesaplanmış sayılarla)
 */
export function getAllCategories(): BlogCategory[] {
    const posts = getAllPosts();
    const categoryMap = new Map<string, BlogCategory>();

    posts.forEach(post => {
        const existing = categoryMap.get(post.category.slug);
        if (existing) {
            existing.count++;
        } else {
            categoryMap.set(post.category.slug, {
                name: post.category.name,
                slug: post.category.slug,
                count: 1
            });
        }
    });

    return Array.from(categoryMap.values())
        .sort((a, b) => b.count - a.count);
}

/**
 * Tüm slugları getir (static paths için)
 */
export function getAllSlugs(): string[] {
    const posts = getAllPosts();
    return posts.map(p => p.slug);
}

/**
 * İlgili yazıları getir (aynı kategori veya tag)
 */
export function getRelatedPosts(currentSlug: string, limit: number = 3): BlogPost[] {
    const currentPost = getPostBySlug(currentSlug);
    if (!currentPost) return [];

    const posts = getAllPosts().filter(p => p.slug !== currentSlug);

    // Aynı kategorideki yazıları önceliklendir
    const sameCategory = posts.filter(p =>
        p.category.slug === currentPost.category.slug
    );

    if (sameCategory.length >= limit) {
        return sameCategory.slice(0, limit);
    }

    // Yeterli değilse diğerlerinden ekle
    const others = posts.filter(p =>
        p.category.slug !== currentPost.category.slug
    );

    return [...sameCategory, ...others].slice(0, limit);
}
