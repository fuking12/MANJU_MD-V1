const config = require("../config");
const { cmd, commands } = require("../command");
const {
  getBuffer,
  getGroupAdmins,
  getxxxp,
  getRandom,
  h2k,
  isUrl,
  Json,
  runtime,
  sleep,
  fetchJson,
} = require("../lib/functions");
const axios = require("axios");
const cheerio = require("cheerio");
const fetch = require("node-fetch");
const ufs = require("../lib/ufs");
let newsize = config.MAX_SIZE * 1024 * 1024;

cmd(
  {
    pattern: "xhamster",
    alias: ["xham"],
    use: ".xhamster *<query>*",
    desc: "Search and DOWNLOAD VIDEOS from pornhub.",
    category: "nsfw",
    filename: __filename,
  },

  async (
    conn,
    mek,
    m,
    {
      from,
      prefix,
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
      isPreUser,
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
      /*let x = await getxxxp(sender);
      if (!x)
        return await reply(
          "🚩 You are not a premium user\nbuy via message to owner!!"
        );*/
      if (!q) return reply("🚩 *Please give me words to search*")
      let res = await fetchJson(`https://xham.vercel.app/api/search?query=${encodeURIComponent(q)}`)
      if (res.length < 1)
        return await conn.sendMessage(from, { text: N_FOUND }, { quoted: mek });
var rows = res.map((v) => ({
    title: `${v.title} - ${v.duration}`,
    rowId: prefix + `xhdl ${v.url}±${v.thumbnail}`
}));

const listMessage = {
    text: `乂 *X H A M S T E R - S E A R C H*`, // Main message text
    image: `https://cdn.1min30.com/wp-content/uploads/2018/12/xHamster.jpg`, // Image URL
    footer: config.FOOTER, // Footer text
    title: 'Xhamster Search Results', // Title for the list
    buttonText: '*🔢 Reply below number*', // Button text
    sections: [{
        title: "Available Links",
        rows: rows // Assign the rows created above
    }]
};

await conn.listMessage(from, listMessage, mek);

    } catch (e) {
      reply(`${e}`);
      console.log(e);
    }
  }
);

cmd(
  {
    pattern: "xhdl",
    dontAddCommandList: true,
    filename: __filename,
  },
  async (
    conn,
    mek,
    m,
    {
      from,
      prefix,
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
      isPreUser,
      groupMetadata,
      groupName,
      participants,
      groupAdmins,
      isBotAdmins,
      isAdmins,
      reply,
      ok,
  ) => {
    try {
      /*let x = await getxxxp(sender);
      if (!x)
        return await reply(
          "🚩 You are not a premium user\nbuy via message to owner!!"
        );*/
      if (!q) return reply("*Please give me instagram url !!*");
      const [link, thumb] = q.split("±");
      let res = await fetchJson(`https://xham.vercel.app/api/detail?url=${encodeURIComponent(link)}`)
      let caption = `乂 *X H A M S T E R - D L*\n\n`;
      caption += `	◦  *Title* : ${res.title}\n`;
      caption += `	◦  *Views* : ${res.viewCount}\n`;
      caption += `  ◦  *Tags* : ${res.tags.join(", ")}\n`; 
      caption += `	◦  *Link* : ${link}\n`;
      caption += `	◦  *Likes* : ${res.likePercentage}\n`;
      caption += `	◦  *Uploaded* : ${res.uploader}`;
      if (res.videoLinks.length < 1)
        return await conn.sendMessage(
          from,
          { text: "🚩 *I couldn't find anything :(*" },
          { quoted: mek }
        );
  var rows = res.videoLinks.map((v) => ({
    title: `${v.file_quality}`,
    rowId:  prefix + `fetchmp4 ${v.link_url}±${v.file_name}±${thumb}`,
}));

const listMessage = {
    text: caption,
    image: thumb, // Image URL
    footer: config.FOOTER, // Footer text
    title: 'Xhamster DL Qualities Results', // Title for the list
    buttonText: '*🔢 Reply below number*', // Button text
    sections: [{
        title: "Available Qualities",
        rows: rows // Assign the rows created above
    }]
};

await conn.listMessage(from, listMessage, mek);
    } catch (e) {
      reply(`${e}`);
      console.log(e);
    }
  }
)

cmd(
  {
    pattern: "eporner",
    alias: ["ep"],
    use: ".eporner *<query>*",
    desc: "Search and DOWNLOAD VIDEOS from pornhub.",
    category: "nsfw",
    filename: __filename,
  },

  async (
    conn,
    mek,
    m,
    {
      from,
      prefix,
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
      isPreUser,
      isOwner,
      groupMetadata,
      groupName,
      participants,
      grouspAdmins,
      isBotAdmins,
      isAdmins,
      reply,
    }
  ) => {
    try {
      /*let x = await getxxxp(sender);
      if (!x)
        return await reply(
          "🚩 You are not a premium user\nbuy via message to owner!!"
        );*/
      if (!q) return reply("🚩 *Please give me words to search*")
      let res = await fetchJson(`https://hidden-movies.vercel.app/eps?q=${encodeURIComponent(q)}`)
      if (res.length < 1)
        return await conn.sendMessage(from, { text: N_FOUND }, { quoted: mek });
var rows = res.map((v) => ({
    title: `${v.title} - ${v.duration}`,
    rowId: prefix + `epdl ${v.videoUrl}`
}));

const listMessage = {
    text: `乂 *E P O R N E R - S E A R C H*`, // Main message text
    image: `https://flixpal.us/uploads/images/16595988854073122-eporner-logo.jpg`, // Image URL
    footer: config.FOOTER, // Footer text
    title: 'Eporner Search Results', // Title for the list
    buttonText: '*🔢 Reply below number*', // Button text
    sections: [{
        title: "Available Links",
        rows: rows // Assign the rows created above
    }]
};

await conn.listMessage(from, listMessage, mek);

    } catch (e) {
      reply(`${e}`);
      console.log(e);
    }
  }
);
cmd(
  {
    pattern: "epdl",
    dontAddCommandList: true,
    filename: __filename,
  },
  async (
    conn,
    mek,
    m,
    {
      from,
      prefix,
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
      isPreUser,
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
      /*let x = await getxxxp(sender);
      if (!x)
        return await reply(
          "🚩 You are not a premium user\nbuy via message to owner!!"
        );*/
      if (!q) return reply("*Please give me instagram url !!*");
      let res = await fetchJson(`https://hidden-movies.vercel.app/epdl?url=${encodeURIComponent(q)}`)
      let caption = `乂  *E P O R N E R - D L*\n\n`;
      caption += `	◦  *Title* : ${res.title}\n`;
      caption += `	◦  *Description* : ${res.description}\n`;
      caption += `	◦  *Link* : ${q}\n`;
      caption += `	◦  *Runtime* : ${res.duration}\n`;
      caption += `	◦  *Uploaded* : ${res.uploader}`;
      if (res.download.length < 1)
        return await conn.sendMessage(
          from,
          { text: "🚩 *I couldn't find anything :(*" },
          { quoted: mek }
        );
  var rows = res.download.map((v) => ({
    title: `${v.quality}`,
    rowId:  prefix + `fetchmp4 ${v.url}±${res.title}±${res.thumbnail}`,
}));

const listMessage = {
    text: `乂 *E P O R N E R - D L*`, // Main message text
    image: res.thumbnail, // Image URL
    footer: config.FOOTER, // Footer text
    title: 'Eporner DL Qualities Results', // Title for the list
    buttonText: '*🔢 Reply below number*', // Button text
    sections: [{
        title: "Available Qualities",
        rows: rows // Assign the rows created above
    }]
};

await conn.listMessage(from, listMessage, mek);
    } catch (e) {
      reply(`${e}`);
      console.log(e);
    }
  }
)
cmd(
  {
    pattern: "pornhub",
    alias: ["ph"],
    use: ".pornhub *<query>*",
    desc: "Search and DOWNLOAD VIDEOS from pornhub.",
    category: "nsfw",
    filename: __filename,
  },

  async (
    conn,
    mek,
    m,
    {
      from,
      prefix,
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
      isPreUser,
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
      /*let x = await getxxxp(sender);
      if (!x)
        return await reply(
          "🚩 You are not a premium user\nbuy via message to owner!!"
        );/*/
      if (!q) return reply("🚩 *Please give me words to search*")
      let res = await fetchJson(`https://xham.vercel.app/api/phs?q=${encodeURIComponent(q)}`)
      if (res.length < 1)
        return await conn.sendMessage(from, { text: N_FOUND }, { quoted: mek });
var rows = res.map((v) => ({
    title: `${v.title} - by ${v.uploader}  ${v.duration} `,
    rowId: prefix + `phubdl ${v.url}`
}));

const listMessage = {
    text: `乂 *P O R N H U B - S E A R C H*`, // Main message text
    image: `https://www.1min30.com/wp-content/uploads/2018/12/Symbole-Pornhub.jpg`, // Image URL
    footer: config.FOOTER, // Footer text
    title: 'Pornhub Search Results', // Title for the list
    buttonText: '*🔢 Reply below number*', // Button text
    sections: [{
        title: "*p0rnhub search results*",
        rows: rows // Assign the rows created above
    }]
};

await conn.listMessage(from, listMessage, mek);

    } catch (e) {
      reply(`${e}`);
      console.log(e);
    }
  }
);

cmd(
  {
    pattern: "phubdl",
    dontAddCommandList: true,
    filename: __filename,
  },
  async (
    conn,
    mek,
    m,
    {
      from,
      prefix,
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
      isPreUser,
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
      /*let x = await getxxxp(sender);
      if (!x)
        return await reply(
          "🚩 You are not a premium user\nbuy via message to owner!!"
        );/*/
      if (!q) return reply("*Please give me instagram url !!*");
      let res = await fetchJson(`https://xham.vercel.app/api/phdl?url=${encodeURIComponent(q)}`)
      let caption = `乂  *P O R N H U B - D L*\n\n`;
      caption += `	◦  *Title* : ${res.video_title}\n`;
      caption += `	◦  *Link* : ${res.original_url}\n`;
      caption += `	◦  *Runtime* : ${res.analyze_time}\n`;
      caption += `	◦  *Uploaded* : ${res.video_upload_date}`;
      if (res.format.length < 1)
        return await conn.sendMessage(
          from,
          { text: "🚩 *I couldn't find anything :(*" },
          { quoted: mek }
        );
      var rows = [];
      res.format.map((v) => {
        rows.push({
          buttonId: prefix + `fetchmp4 ${v.download_url}±${res.video_title}±${res.video_cover}`,
          buttonText: { displayText: `${v.resolution} - ${v.file_type}` },
          type: 1,
        });
      });

      const buttonMessage = {
        image: res.video_cover,
        caption: caption,
        footer: config.FOOTER,
        buttons: rows,
        headerType: 4,
      };
      return await conn.buttonMessage(from, buttonMessage, mek);
    } catch (e) {
      reply(`${e}`);
      console.log(e);
    }
  }
);


async function xvideosSearch(url) {
  return new Promise(async (resolve) => {
    await axios
      .request(
        `https://www.xvideos.com/?k=${url}&p=${
          Math.floor(Math.random() * 9) + 1
        }`,
        { method: "get" }
      )
      .then(async (result) => {
        let $ = cheerio.load(result.data, { xmlMod3: false });
        let title = [];
        let duration = [];
        let quality = [];
        let url = [];
        let thumb = [];
        let hasil = [];

        $("div.mozaique > div > div.thumb-under > p.title").each(function (
          a,
          b
        ) {
          title.push($(this).find("a").attr("title"));
          duration.push($(this).find("span.duration").text());
          url.push("https://www.xvideos.com" + $(this).find("a").attr("href"));
        });
        $("div.mozaique > div > div.thumb-under").each(function (a, b) {
          quality.push($(this).find("span.video-hd-mark").text());
        });
        $("div.mozaique > div > div > div.thumb > a").each(function (a, b) {
          thumb.push($(this).find("img").attr("data-src"));
        });
        for (let i = 0; i < title.length; i++) {
          hasil.push({
            title: title[i],
            duration: duration[i],
            quality: quality[i],
            thumb: thumb[i],
            url: url[i],
          });
        }
        resolve(hasil);
      });
  });
}

cmd(
  {
    pattern: "xvideo",
    alias: ["xv","xvid"],
    use: ".xvideo *<query>*",
    desc: "Search and DOWNLOAD VIDEOS from xvideos.",
    category: "nsfw",
    filename: __filename,
  },

  async (
    conn,
    mek,
    m,
    {
      from,
      prefix,
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
      isPreUser,
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
      /*let x = await getxxxp(sender);
      if (!x)
        return await reply(
          "🚩 You are not a premium user\nbuy via message to owner!!"
        );*/
      if (!q) return reply("🚩 *Please give me words to search*");
      let res = await xvideosSearch(q);
      if (res.length < 1)
        return await conn.sendMessage(from, { text: N_FOUND }, { quoted: mek });
var rows = res.map((v) => ({
    title: `${v.title} - ${v.duration}`,
    rowId: prefix + `xviddl ${v.url}`
}));

const listMessage = {
    text: `乂 *X V I D - S E A R C H*`, // Main message text
    image: `https://logohistory.net/wp-content/uploads/2023/06/XVideos-Logo-2007-1024x576.png`, // Image URL
    footer: config.FOOTER, // Footer text
    title: 'Xvideos Search Results', // Title for the list
    buttonText: '*🔢 Reply below number*', // Button text
    sections: [{
        title: "Available Links",
        rows: rows // Assign the rows created above
    }]
};

await conn.listMessage(from, listMessage, mek)
    } catch (e) {
      reply(`${e}`);
      console.log(e);
    }
  }
);

//------------------------dl---------------
async function xvideosdl(url) {
  return new Promise((resolve, reject) => {
    fetch(`${url}`, { method: "get" })
      .then((res) => res.text())
      .then((res) => {
        let $ = cheerio.load(res, { xmlMode: false });
        const title = $("meta[property='og:title']").attr("content");
        const keyword = $("meta[name='keywords']").attr("content");
        const views =
          $(
            "div#video-tabs > div > div > div > div > strong.mobile-hide"
          ).text() + " views";
        const vote = $("div.rate-infos > span.rating-total-txt").text();
        const likes = $("span.rating-good-nbr").text();
        const deslikes = $("span.rating-bad-nbr").text();
        const thumb = $("meta[property='og:image']").attr("content");
        const url = $("#html5video > #html5video_base > div > a").attr("href");
        resolve({
          status: 200,
          result: { title, url, keyword, views, vote, likes, deslikes, thumb },
        });
      });
  });
}

cmd(
  {
    pattern: "xvideodown",
    alias: ["xviddl", "xvideodl"],
    dontAddCommandList: true,
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
      isPreUser,
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
      /*let x = await getxxxp(sender);
      if (!x)
        return await reply(
          "🚩 You are not a premium user\nbuy via message to owner!!"
        );*/
      if (!q) return reply("*Please give me pake url !!*");
      let mala = await xvideosdl(q);
      let res = mala.result;
      let sizeb = await ufs(res.url);
      let fileSize = sizeb / (1024 * 1024);
      let wm = config.FOOTER;
      let caption = `乂  *X V I D E O S - D L*\n`;
      caption += `	◦  *Title* : ${res.title}\n`;
      caption += `	◦  *Keywords* : ${res.keyword}\n`;
      caption += `	◦  *Views* : ${res.views}\n`;
      caption += `	◦  *Votes* : ${res.vote}\n`;
      caption += `	◦  *Likes* : ${res.likes}\n`;
      caption += `	◦  *Dislikes* : ${res.deslikes}\n`;
      caption += `	◦  *File size* : ${fileSize} MB\n`;
      caption += ` © pink venom-md v${
        require("../package.json").version
      } (Test)\nsɪᴍᴘʟᴇ ᴡᴀʙᴏᴛ ᴍᴀᴅᴇ ʙʏ ᴀʏᴏᴅʜʏᴀ ッ`;
      await conn.sendMessage(
        from,
        { image: { url: res.thumb }, caption: caption },
        { quoted: mek }
      );
      if (sizeb > newsize)
        return await conn.sendMessage(
          from,
          { text: "*File size is too big...*" },
          { quoted: mek }
        );
      //let title = res.result.title
      await conn.sendMessage(
        from,
        {
          document: { url: res.url },
          mimetype: "video/mp4",
          fileName: `${res.title}.mp4`,
          jpegThumbnail: await (await fetch(res.thumb)).buffer(),
          caption: wm,
        },
        { quoted: mek }
      );
    } catch (e) {
      reply(`${e}`);
      console.log(e);
    }
  }
);

var N_FOUND = "*I couldn't find anything :(*";
async function xnxxs(query) {
  return new Promise((resolve, reject) => {
    const baseurl = "https://www.xnxx.com";
    fetch(`${baseurl}/search/${query}/${Math.floor(Math.random() * 3) + 1}`, {
      method: "get",
    })
      .then((res) => res.text())
      .then((res) => {
        const $ = cheerio.load(res, { xmlMode: false });
        const title = [];
        const url = [];
        const desc = [];
        const results = [];
        $("div.mozaique").each(function (a, b) {
          $(b)
            .find("div.thumb")
            .each(function (c, d) {
              url.push(
                baseurl + $(d).find("a").attr("href").replace("/THUMBNUM/", "/")
              );
            });
        });
        $("div.mozaique").each(function (a, b) {
          $(b)
            .find("div.thumb-under")
            .each(function (c, d) {
              desc.push($(d).find("p.metadata").text());
              $(d)
                .find("a")
                .each(function (e, f) {
                  title.push($(f).attr("title"));
                });
            });
        });
        for (let i = 0; i < title.length; i++) {
          results.push({ title: title[i], info: desc[i], link: url[i] });
        }
        resolve({ status: true, result: results });
      })
      .catch((err) => reject({ status: false, result: err }));
  });
}

cmd(
  {
    pattern: "xnxx",
    alias: ["xnxxs"],
    use: ".xnxx *<query>*",
    desc: "Search and DOWNLOAD VIDEOS from xnxx.",
    category: "nsfw",
    filename: __filename,
  },

  async (
    conn,
    mek,
    m,
    {
      from,
      prefix,
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
      isPreUser,
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
      //if (!isMe) return await reply('🚩 You are not a premium user\nbuy via message to owner!!')
      if (!q) return reply("🚩 *Please give me words to search*");
      let res = await xnxxs(q);
      let data = res.result;
      if (data.length < 1)
        return await conn.sendMessage(from, { text: N_FOUND }, { quoted: mek });
var rows = res.result.map((v) => ({
    title: `${v.title}`,
    rowId: prefix + `xnxxdl ${v.link}`
}));

const listMessage = {
    text: `乂 *X N X X - S E A R C H*`, // Main message text
    image: `https://1000logos.net/wp-content/uploads/2021/04/XNXX-logo.png`, // Image URL
    footer: config.FOOTER, // Footer text
    title: 'XNXX Search Results', // Title for the list
    buttonText: '*🔢 Reply below number*', // Button text
    sections: [{
        title: "Available Links",
        rows: rows // Assign the rows created above
    }]
};

await conn.listMessage(from, listMessage, mek);
    } catch (e) {
      reply(errt);
      console.log(e);
    }
  }
);

//------------------------dl---------------

async function xdl(URL) {
  return new Promise((resolve, reject) => {
    fetch(`${URL}`, { method: "get" })
      .then((res) => res.text())
      .then((res) => {
        const $ = cheerio.load(res, { xmlMode: false });
        const title = $('meta[property="og:title"]').attr("content");
        const duration = $('meta[property="og:duration"]').attr("content");
        const image = $('meta[property="og:image"]').attr("content");
        const videoType = $('meta[property="og:video:type"]').attr("content");
        const videoWidth = $('meta[property="og:video:width"]').attr("content");
        const videoHeight = $('meta[property="og:video:height"]').attr(
          "content"
        );
        const info = $("span.metadata").text();
        const videoScript = $("#video-player-bg > script:nth-child(6)").html();
        const files = {
          low: (videoScript.match("html5player.setVideoUrlLow\\('(.*?)'\\);") ||
            [])[1],
          high: videoScript.match(
            "html5player.setVideoUrlHigh\\('(.*?)'\\);" || []
          )[1],
          HLS: videoScript.match(
            "html5player.setVideoHLS\\('(.*?)'\\);" || []
          )[1],
          thumb: videoScript.match(
            "html5player.setThumbUrl\\('(.*?)'\\);" || []
          )[1],
          thumb69: videoScript.match(
            "html5player.setThumbUrl169\\('(.*?)'\\);" || []
          )[1],
          thumbSlide: videoScript.match(
            "html5player.setThumbSlide\\('(.*?)'\\);" || []
          )[1],
          thumbSlideBig: videoScript.match(
            "html5player.setThumbSlideBig\\('(.*?)'\\);" || []
          )[1],
        };
        resolve({
          status: true,
          result: {
            title,
            URL,
            duration,
            image,
            videoType,
            videoWidth,
            videoHeight,
            info,
            files,
          },
        });
      })
      .catch((err) => reject({ status: false, result: err }));
  });
}

cmd(
  {
    pattern: "xnxxdown",
    alias: ["dlxnxx", "xnxxdl"],
    dontAddCommandList: true,
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
      isPreUser,
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
      //if (!isMe) return await reply('🚩 You are not a premium user\nbuy via message to owner!!')
      if (!q) return reply("*Please give me xnxx url !!*");
      let res = await xdl(q);
      let sizeb = await ufs(res.result.files.high);
      let fileSize = sizeb / (1024 * 1024);
      if (sizeb > newsize)
        return await conn.sendMessage(
          from,
          { text: "*File size is too big...*" },
          { quoted: mek }
        );
      let caption = `乂  *X N X X - D L*\n`;
      caption += `	◦  *Title* : ${res.result.title}\n`;
      caption += `	◦  *Info* : ${res.result.info}\n`;
      caption += `	◦  *Duration* : ${res.result.duration}\n`;
      caption += ` © pink venom-md v${
        require("../package.json").version
      } (Test)\nsɪᴍᴘʟᴇ ᴡᴀʙᴏᴛ ᴍᴀᴅᴇ ʙʏ ᴀʏᴏᴅʜʏᴀ ッ`;
      let title = res.result.title;
      await conn.sendMessage(
        from,
        {
          document: { url: res.result.files.high },
          mimetype: "video/mp4",
          fileName: `${title}.mp4`,
          jpegThumbnail: await (await fetch(res.result.image)).buffer(),
          caption: caption,
        },
        { quoted: mek }
      );
    } catch (e) {
      reply("*Error !!*");
      console.log(e);
    }
  }
);
