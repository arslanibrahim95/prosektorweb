const fs = require('fs');
const path = require('path');

const QUEUE_DIR = path.join(__dirname, 'blog-queue');
const BLOG_DIR = path.join(__dirname, 'blog');

// Mevcut en yüksek ID'yi bul
function getMaxId() {
    const files = fs.readdirSync(BLOG_DIR)
        .filter(f => f.endsWith('.json') && !f.startsWith('_') && !f.startsWith('AGENT'));

    let maxId = 0;
    files.forEach(file => {
        const match = file.match(/^(\d+)-/);
        if (match) {
            const id = parseInt(match[1]);
            if (id > maxId) maxId = id;
        }
    });
    return maxId;
}

// Queue'daki dosyaları işle
function processQueue() {
    const queueFiles = fs.readdirSync(QUEUE_DIR)
        .filter(f => f.endsWith('.json'));

    if (queueFiles.length === 0) {
        console.log('📭 Kuyrukta dosya yok.');
        return;
    }

    console.log(`📬 ${queueFiles.length} dosya bulundu.\n`);

    let currentId = getMaxId();

    queueFiles.forEach(file => {
        const filePath = path.join(QUEUE_DIR, file);
        const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

        // Yeni ID ata
        currentId++;
        content.id = currentId.toString();

        // Yeni dosya adı
        const newFileName = `${currentId.toString().padStart(2, '0')}-${content.slug}.json`;
        const newFilePath = path.join(BLOG_DIR, newFileName);

        // Dosyayı kaydet
        fs.writeFileSync(newFilePath, JSON.stringify(content, null, 2));

        // Queue'dan sil
        fs.unlinkSync(filePath);

        console.log(`✅ ${file} → ${newFileName} (ID: ${currentId})`);
    });

    console.log(`\n🎉 Toplam ${queueFiles.length} yazı eklendi.`);
    console.log(`📊 Yeni son ID: ${currentId}`);
}

// Çalıştır
processQueue();
