const axios = require('axios');

// YouTube සෙවුම් ෆන්ක්ෂන්
async function youtubeSearch(query) {
    // API URL සහ parameters
    const apiUrl = `https://api.genux.me/api/search/yt-search?query=${encodeURIComponent(query)}&apikey=GENUX-WXSU5DK`;

    try {
        // API වෙත GET ඉල්ලීම යවන්න
        const response = await axios.get(apiUrl);
        const data = response.data;

        // API ප්‍රතිචාරයේ ආකෘතිය අනුව දත්ත ලබා ගන්න
        // උපකල්පනය: API එක 'results' යටතේ වීඩියෝ ලැයිස්තුවක් ලබා දෙනවා
        if (data.results && Array.isArray(data.results)) {
            console.log(`සෙවුම් ප්‍රතිඵල "${query}" සඳහා:\n`);
            data.results.forEach(item => {
                // උපකල්පනය: එක් එක් item හි title, url, thumbnail තිබේ
                const title = item.title || 'මාතෘකාව නැත';
                const url = item.url || '#';
                const thumbnail = item.thumbnail || 'Thumbnail නැත';

                // සිංහලෙන් ප්‍රතිඵල පෙන්වන්න
                console.log(`මාතෘකාව: ${title}`);
                console.log(`URL: ${url}`);
                console.log(`Thumbnail: ${thumbnail}`);
                console.log('------------------------');
            });
        } else {
            console.log('ප්‍රතිඵල හමු වුණේ නැත.');
        }
    } catch (error) {
        console.error('API ඉල්ලීමේ දෝෂයක්:', error.message);
    }
}

// උදාහරණ සෙවුමක් ධාවනය කරන්න
youtubeSearch('hirupodawessa');
