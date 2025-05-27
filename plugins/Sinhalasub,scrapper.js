cmd(
  {
    pattern: "sinhalasub",
    alias: ["movie", "film", "cine", "cs", "ss", "cinesubz"],
    use: ".movie *<movie name>*",
    react: "🍟",
    desc: "Search and DOWNLOAD VIDEOS from sinhala sub.",
    category: "movie",
    filename: __filename,
  },

  async (
    conn,
    mek,
    m,
    {
      from,
      l,
      prefix,
      quoted,
      body,
      isCmd,
      command,
      args,
      q,
      isGroup,
      sender,
      senderNumber,
      botNumber2,
      botNumber,
      pushname,
      isMe,
      isOwner,
      groupMetadata,
      groupName,
      participants,
      groupAdmins,
      isBotAdmins,
      isAdmins,
      reply,
    }
  ) => {
    try {
      const ismvban = await getban(from);
        if (ismvban) {
          return m.reply("➟ *This Chat Has Been banned from using Movie Commands.....*\n\n*_Please contact ot Owner to UnBan_* 👨‍🔧\n");
      }
      let x = await getcinep(sender);
      let y = await getcinefree()
      if (!x && !y) {
        return await reply("🚩 You are not a premium user\nbuy via message to owner!!\nwa.me/94759874797");
      }
      if (!q) return reply("🚩 *Please give me words to search*");
      var ress = await fetchJson(`https://apicinex.vercel.app/api/sinhalasub/movie/search?q=${q}`)
      let wm = config.MOVIE_FOOTER;
      const msg = `乂 *M O V I E - S E A R C H*`;
      if (ress.length < 1 )
        return await conn.sendMessage(
          from,
          { text: "🚩 *I couldn't find anything :(*" },
          { quoted: mek }
        );
var rows = ress.map((v) => ({
    title: `${v.title} - ${v.year}`,
    rowId: `${prefix}ssmdl ${v.link}`
}));
      

const listMessage = {
    text: msg, // Message text
    image: "https://i.ibb.co/0q34kPZ/image.png",
    footer: config.MOVIE_FOOTER,
    title: 'Select a Movie', // Title for the list
    buttonText: '*🔢 Reply below number*', // Button text
    sections: [{
        title: "*sinhalasub.lk*",
        rows: 
    }]
};

await conn.listMessage(from, listMessage, mek);
    } catch (e) {
      console.log(e);
      await conn.sendMessage(from, { text: "🚩 *Error !!*" }, { quoted: mek });
    }
  }
);

cmd(
  {
    pattern: "ssmdl",
    dontAddCommandList: true,
    react: "🍟",
    filename: __filename,
  },
  async (conn, mek, m, { from, prefix, q }) => {
    try {
      const ismvban = await getban(from);
        if (ismvban) {
          return m.reply("➟ *This Chat Has Been banned from using Movie Commands.....*\n\n*_Please contact ot Owner to UnBan_* 👨‍🔧\n");
        }
      // if (!isMe) return await reply('🚩 You are not a premium user\nbuy via message to owner!!')
      if (!q) return reply("🚩 *Please give me a url*");

      let wm = config.MOVIE_FOOTER;

      var result = await fetchJson(`https://apicinex.vercel.app/api/sinhalasub/movie/details?url=${q}`)

      const msg = `乂 *S I N H A L A S U B - D L*
        
 *◦ Title :* ${result.title}
 *◦ Date :* ${result.releaseDate}
 *◦ Mean :* ${result.tagline}
 *◦ Duration :* ${result.duration}
 *◦ Imdb rating :* ${result.imdbRating}
 *◦ Genres :* ${result.genres.join(", ")}
 *◦ Rating :* ${result.ratingCount}
 `;

      let raw = [];
      raw.push({
        title: `Send Detail Card`,
        rowId: `${prefix}ssde ${q}`,
      });

      result.downloadLinks.map((v) => {
        raw.push({
          title: `${v.server} - ${v.quality} - ${v.size}`,
          rowId: `${prefix}gss ${v.link}±${result.title}±${result.image}`,
        });
      });

      const sections = [
        {
          title: "sinhalasub.lk",
          rows: raw,
        },
      ];

      const listMessage = {
        image: result.image,
        text: msg,
        footer: config.MOVIE_FOOTER,
        title: "sended details",
        buttonText: "Select a number",
        sections,
      };
      await conn.listMessage(from, listMessage, mek);
    } catch (e) {
      console.log(e);
      await reply(`${e}`);
      await conn.sendMessage(from, { text: "🚩 *Error !!*" }, { quoted: mek });
    }
  }
);;

cmd(
  {
    pattern: "ssde",
    dontAddCommandList: true,
    react: "🍎",
    filename: __filename,
  },
  async (
    conn,
    mek,
    m,
    {
      from,
      l,
      quoted,
      body,
      isCmd,
      command,
      args,
      q,
      isGroup,
      sender,
      senderNumber,
      botNumber2,
      botNumber,
      pushname,
      isMe,
      isOwner,
      groupMetadata,
      groupName,
      participants,
      groupAdmins,
      isBotAdmins,
      isAdmins,
      reply,
    }
  ) => {
    try {
      const ismvban = await getban(from);
        if (ismvban) {
          return m.reply("➟ *This Chat Has Been banned from using Movie Commands.....*\n\n*_Please contact ot Owner to UnBan_* 👨‍🔧\n");
        }
      var result = await fetchJson(`https://apicinex.vercel.app/api/sinhalasub/movie/details?url=${q}`)
      let info = await minimize(`乂 *M O V I E - I N F O*
        
 *◦ Title :* ${result.title}
 *◦ Date :* ${result.releaseDate}
 *◦ Mean :* ${result.tagline}
 *◦ Duration :* ${result.duration}
 *◦ Imdb rating :* ${result.imdbRating}
 *◦ Genres :* ${result.genres.join(", ")}
 *◦ Rating :* ${result.ratingCount}

 ${config.MOVIE_FOOTER}`)
      return await conn.sendMessage(
        from,
        { image: { url: result.image }, caption: info },
        { quoted: mek }
      );
    } catch (e) {
      console.log(e);
    }
  }
);

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
