// Discord Sticker Downloader з вашим токеном
async function downloadDiscordStickers() {
    // Ваш токен (замініть на свій)
    const token = "YOUR_DISCORD_TOKEN_HERE";
    
    // Функція для отримання поточного guild ID
    function getCurrentGuildId() {
        const url = window.location.href;
        const match = url.match(/\/channels\/(\d+)/);
        return match ? match[1] : null;
    }
    
    // Функція для завантаження файлу через fetch
    async function downloadFile(url, filename) {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            // Очищаємо URL після завантаження
            setTimeout(() => window.URL.revokeObjectURL(downloadUrl), 100);
            return true;
        } catch (error) {
            console.error(`❌ Помилка завантаження ${filename}:`, error);
            return false;
        }
    }
    
    // Функція для затримки
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    const guildId = getCurrentGuildId();
    
    if (!guildId) {
        console.error('❌ Не вдалось знайти ID сервера. Переконайтесь, що ви знаходитесь на сторінці сервера Discord.');
        console.log('💡 URL має виглядати так: https://discord.com/channels/GUILD_ID/CHANNEL_ID');
        return;
    }
    
    console.log(`🚀 Починаємо завантаження стікерів з сервера ${guildId}`);
    
    try {
        // Отримуємо список стікерів сервера
        console.log('📡 Запитуємо список стікерів...');
        const response = await fetch(`https://discord.com/api/v9/guilds/${guildId}/stickers`, {
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json',
                'User-Agent': navigator.userAgent,
                'X-Discord-Locale': 'en-US'
            }
        });
        
        console.log(`📊 Статус відповіді: ${response.status} ${response.statusText}`);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Помилка API:', errorText);
            
            if (response.status === 401) {
                console.log('🔑 Проблема з токеном. Можливо він застарів.');
            } else if (response.status === 403) {
                console.log('🚫 Немає доступу до стікерів цього сервера.');
            } else if (response.status === 404) {
                console.log('🔍 Сервер не знайдено або немає стікерів.');
            }
            return;
        }
        
        const stickers = await response.json();
        
        if (!stickers || stickers.length === 0) {
            console.log('ℹ️ На цьому сервері немає стікерів.');
            return;
        }
        
        console.log(`📦 Знайдено ${stickers.length} стікерів:`);
        
        // Показуємо список стікерів
        stickers.forEach((sticker, index) => {
            console.log(`${index + 1}. ${sticker.name} (ID: ${sticker.id}, Format: ${sticker.format_type})`);
        });
        
        console.log('\n⬇️ Починаємо завантаження...\n');
        
        let downloadedCount = 0;
        let failedCount = 0;
        
        for (let i = 0; i < stickers.length; i++) {
            const sticker = stickers[i];
            
            try {
                // Визначаємо формат стікера
                let extension = 'png';
                let formatName = 'PNG';
                
                switch(sticker.format_type) {
                    case 1:
                        extension = 'png';
                        formatName = 'PNG';
                        break;
                    case 2:
                        extension = 'png';
                        formatName = 'APNG';
                        break;
                    case 3:
                        extension = 'json';
                        formatName = 'Lottie';
                        break;
                    case 4:
                        extension = 'gif';
                        formatName = 'GIF';
                        break;
                }
                
                const stickerUrl = `https://media.discordapp.net/stickers/${sticker.id}.${extension}`;
                const safeName = sticker.name.replace(/[^a-zA-Z0-9\-_]/g, '_');
                const filename = `${safeName}_${sticker.id}.${extension}`;
                
                console.log(`⬇️ [${i + 1}/${stickers.length}] Завантажуємо: ${sticker.name} (${formatName})`);
                console.log(`🔗 URL: ${stickerUrl}`);
                
                const success = await downloadFile(stickerUrl, filename);
                
                if (success) {
                    downloadedCount++;
                    console.log(`✅ Успішно завантажено: ${filename}`);
                } else {
                    failedCount++;
                    console.log(`❌ Не вдалося завантажити: ${filename}`);
                }
                
                // Затримка між завантаженнями
                if (i < stickers.length - 1) {
                    console.log('⏳ Чекаємо 1 секунду...\n');
                    await sleep(1000);
                }
                
            } catch (error) {
                failedCount++;
                console.error(`❌ Помилка обробки стікера "${sticker.name}":`, error);
            }
        }
        
        console.log('\n🎉 Завершено!');
        console.log(`✅ Успішно завантажено: ${downloadedCount}`);
        console.log(`❌ Помилок: ${failedCount}`);
        console.log(`📁 Файли збережено в папку Downloads`);
        
    } catch (error) {
        console.error('❌ Загальна помилка:', error);
    }
}

// Інструкція
console.log('🎯 Discord Sticker Downloader');
console.log('📋 Переконайтесь, що ви на сторінці потрібного Discord сервера');
console.log('▶️ Запускаємо...\n');

// Запускаємо
downloadDiscordStickers();
