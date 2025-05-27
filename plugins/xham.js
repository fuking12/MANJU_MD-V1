class Downloader {
  constructor() {
    this.headers = {
      "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36"
    };
  }

  async search(query) {
    try {
      const link = `https://xhamster.com/search/${encodeURIComponent(query)}?q=${encodeURIComponent(query)}`
      const { data: html } = await axios.get(link);
      console.log(html);
      const $ = cheerio.load(html);
      const results = [];
      $(".thumb-list__item.video-thumb").each((i, el) => {
        const title = $(el).find(".video-thumb-info__name").text().trim() || "Tidak ada judul";
        const url = $(el).find(".video-thumb__image-container").attr("href") || "Tidak ada URL";
        const thumbnail = $(el).find(".thumb-image-container__image").attr("src") || "Tidak ada thumbnail";
        const duration = $(el).find(".thumb-image-container__duration .tiny-8643e").text().trim() || "Durasi tidak diketahui";
        const uploader = $(el).find(".video-uploader-data a").text().trim() || "Anonim";
        if (title && url) results.push({ title, url, thumbnail, duration, uploader });
      });
      return results.length ? results : [{ message: "Tidak ada hasil ditemukan" }];
    } catch (error) {
            console.log(error);
      return [{ error: error }];
    }
  }

  async detail(url) {
    try {
      const { data: html } = await axios.get(url);
      const $ = cheerio.load(html);
      console.log(html);
      const title = $('div[data-role="video-title"] h1.title-f2600').text().trim() || "Tidak ada judul";
      const stats = $('div[data-role="video-title"] p.primary-8643e.icons-a993a span.primary-8643e');
      const viewCount = stats.eq(0).text().trim() || "Tidak diketahui";
      const likePercentage = stats.eq(1).text().trim() || "Tidak diketahui";
      const uploaderAnchor = $('nav#video-tags-list-container a[href*="/creators/"]').first();
      const uploader = uploaderAnchor.length ? {
        name: uploaderAnchor.find("span.body-bold-8643e.label-5984a").text().trim() || "Tidak diketahui",
        url: uploaderAnchor.attr("href") || "Tidak ada URL",
        avatar: uploaderAnchor.find("img.image-9a750").attr("src") || "Tidak ada avatar",
        subscribers: uploaderAnchor.find("span.sub-button__counter").text().trim() || "0"
      } : null;
      const tags = [];
      $("nav#video-tags-list-container a").each((i, el) => {
        const href = $(el).attr("href") || "";
        if (!href.includes("/creators/")) {
          const tag = $(el).find("span.body-8643e.label-5984a.label-96c3e").text().trim() || "Tidak ada tag";
          if (tag && tag !== "Tidak ada tag") tags.push(tag);
        }
      });
      let videoUrl = "";
      const noscriptContent = $("noscript").html() || "";
      const match = noscriptContent.match(/<video[^>]+src=['"]([^'"]+)['"]/);
      videoUrl = match ? match[1] : "";
      if (!videoUrl) {
        videoUrl = $("a.player-container__no-player").attr("href") || "Tidak ada link video";
      }
    const thumbnail = $('video.player-container__no-script-video').attr('poster');

      const apiKey = "174p96828h1m3rcmvdohgdm-lams-xlddogs-hnm-pre-igrn-hCV";
      const response = await axios.post("https://api.easydownloader.app/api-extract/", {
        video_url: url,
        pagination: false,
        key: apiKey,
      }, {
        headers: {
          "Accept": "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      });

      const daaata = response.data;

      if (daaata.final_urls && daaata.final_urls.length > 0 && daaata.final_urls[0].links) {
        const videoLinks = daaata.final_urls[0].links.filter(link => {
          return link.link_type === 0 &&
                 link.file_type === "mp4" &&
                 !link.file_quality.includes("x") &&
                 (link.file_quality.includes("p") || link.file_quality.includes("P"));
        });

        return {
          title,
          viewCount,
          likePercentage,
          uploader,
          tags,
          videoLinks,
          thumbnail
        };
      } else {
        return { error: "Tidak ada video links ditemukan." };
      }
    } catch (error) {
      console.error("Detail error:", error.message);
      return { error: error.message || "Terjadi kesalahan" };
    }
  }
}

const downloader = new Downloader();

app.get('/api/search', async (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).json({ error: "Query parameter is required." });
  }
  const results = await downloader.search(query);
  res.json(results);
});

app.get('/api/detail', async (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: "URL parameter is required." });
  }
  const details = await downloader.detail(url);
  res.json(details);
});
