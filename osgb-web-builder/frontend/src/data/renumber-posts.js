const fs = require('fs');
const path = require('path');

const blogDir = path.join(__dirname, 'blog');
const files = fs.readdirSync(blogDir)
    .filter(f => f.endsWith('.json') && !f.startsWith('_') && !f.startsWith('AGENT'))
    .sort();

console.log('📁 Mevcut dosyalar:');
files.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));

console.log('\n🔄 ID\'leri yeniden numaralandırılıyor...\n');

files.forEach((file, index) => {
    const newId = (index + 1).toString();
    const filePath = path.join(blogDir, file);

    // JSON'u oku
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const oldId = content.id;

    // ID'yi güncelle
    content.id = newId;

    // Yeni dosya adı
    const slug = content.slug;
    const newFileName = `${newId.padStart(2, '0')}-${slug}.json`;
    const newFilePath = path.join(blogDir, newFileName);

    // Eski dosyayı sil
    fs.unlinkSync(filePath);

    // Yeni dosyayı yaz
    fs.writeFileSync(newFilePath, JSON.stringify(content, null, 2));

    console.log(`✅ ID ${oldId} → ${newId}: ${newFileName}`);
});

console.log('\n📊 Toplam:', files.length, 'yazı yeniden numaralandırıldı');
