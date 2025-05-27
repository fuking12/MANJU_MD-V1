cmd(
  {
    pattern: "gss",
    react: "🍟",
    dontAddCommandList: true,
    filename: __filename,
}, async (conn, mek, m, { from, q, prefix, reply }) => {
    try {
      const ismvban = await getban(from);
        if (ismvban) {
          return m.reply("➟ *This Chat Has Been banned from using Movie Commands.....*\n\n*_Please contact ot Owner to UnBan_* 👨‍🔧\n");
        }
      if (!q) return reply("Need a keyword");
      const link = q.split("±")[0];
      const namee = q.split("±")[1] || link;
      const image = q.split("±")[2] || `https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/i/74d2a00a-b5c0-42d4-b131-fafcca22e4cf/d7ay4tw-1fa7c44d-2500-43ef-8d40-c16d939ca024.png`
      const name = namee.replace(/\s+/g, "_");
      const url = link
      const response = await fetch(url)
      const success = await response.text()
      const $p = cheerio.load(success);
      const lastLink = $p("#link").attr("href");
      let dllink;
      if (lastLink.includes("https://pixeldrain.com/")) {
        dllink = lastLink.replace("/u/", "/api/file/");
      } else {
        dllink = lastLink;
      }

      const photo = image || "https://picsum.photos/1080?aesthetic"
      const ima = await resize(photo)
      const resp = await axios.get(dllink.trim(), { responseType: "arraybuffer" });
      const mediaBuffer = Buffer.from(resp.data, "binary");
      let exname = 'Pink-Venom-MD🌸' + Date.now();  
      await conn.sendMessage(from, {
        document: mediaBuffer,
        mimetype: "video/mp4",
        jpegThumbnail: ima,
        caption: `${name}\n\n${config.MOVIE_FOOTER}`,
        fileName: `${name || exname}.mp4`,
      }, { quoted: mek });

      await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
    } catch (e) {
      reply("Unable to generate");
      console.log(e);
    }
  }
);
