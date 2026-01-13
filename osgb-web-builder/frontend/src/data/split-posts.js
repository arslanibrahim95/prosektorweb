const fs = require('fs');
const path = require('path');

// Mevcut blog-posts.json'u oku
const dataPath = path.join(__dirname, 'blog-posts.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

// blog klasörünü oluştur (varsa geç)
const blogDir = path.join(__dirname, 'blog');
if (!fs.existsSync(blogDir)) fs.mkdirSync(blogDir);

// Her postu ayrı dosyaya yaz
data.posts.forEach((post) => {
    // Dosya adı: XX-slug.json formatında
    const paddedId = post.id.padStart(2, '0');
    const fileName = `${paddedId}-${post.slug}.json`;
    const filePath = path.join(blogDir, fileName);

    // Tek post olarak kaydet
    fs.writeFileSync(filePath, JSON.stringify(post, null, 2));
    console.log('✅ ' + fileName);
});

// Kategorileri ayrı dosyaya kaydet
if (data.categories) {
    fs.writeFileSync(path.join(blogDir, '_categories.json'), JSON.stringify(data.categories, null, 2));
    console.log('✅ _categories.json');
}

console.log('\n📁 Toplam:', data.posts.length, 'yazı ayrıldı');
