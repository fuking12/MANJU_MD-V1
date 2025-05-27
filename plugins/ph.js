
async function phdl(link, retries = 3) {
    const url = 'https://x01.p2mate.com/analyze';
    const payload = new URLSearchParams({
        url: link
    });

    const headers = {
        'Accept': '*/*',
        'Origin': 'https://p2download.com',
        'Referer': 'https://p2download.com/',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Mobile Safari/537.36',
        'authority': 'x01.p2mate.com',
        'method': 'POST',
    };

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const response = await axios.post(url, payload, { headers });

            return response.data
        } catch (error) {
            console.error('Error:', error.response ? error.response.status : error.message);
            if (attempt === retries) {
                console.error('Max retries reached. Request failed.');
            }
        }

        await new Promise(resolve => setTimeout(resolve, 1000)); 
    }
}

app.get('/api/phdl', async (req, res) => {
    const { url } = req.query;
    if (!url) {
        return res.status(400).send("URL is required");
    }

    try {
        const result = await phdl(url);
        res.json(result);
    } catch (error) {
        console.error("Error fetching video data:", error); // Log the error for debugging
        res.status(500).send(error.message);
    }
});

async function phs(query) {
    try {
        const link = `https://www.pornhub.com/video/search?search=${query}`
    const response = await axios.get(link);
    const html = response.data;
    const $ = cheerio.load(html);
    const allVideos = [];
    
        const videos = $('#videoSearchResult li.pcVideoListItem');

        videos.each((i, el) => {
            const videoId = $(el).data('video-id');
            const videoVkey = $(el).data('video-vkey');
            const title = $(el).find('.vidTitleWrapper .thumbnailTitle').text().trim();
            const views = $(el).find('.videoDetailBlock .views var').text().trim();
            const uploader = $(el).find('.videoUploaderBlock .usernameWrap a').text().trim();
            const duration = $(el).find('.marker-overlays .bgShadeEffect').text().trim();
            const videoUrl = `https://www.pornhub.com/view_video.php?viewkey=${videoVkey}`;

            if (title && videoUrl) {
                allVideos.push({
                    url: videoUrl,
                    title: title,
                    uploader: uploader,
                    views: views,
                    duration: duration
                });
            }
        });

        return allVideos;
    } catch (error) {
        console.error("Error fetching data:", error.response ? error.response.data : error.message);
        throw error;
    }
}

app.get('/api/phs', async (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.status(400).json({ error: 'Query parameter "q" is required.' });
    }
    try {
        const results = await phs(query);
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch videos.' });
    }
})