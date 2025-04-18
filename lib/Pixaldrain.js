const axios = require("axios");

async function PixaldrainDL(url) {
  try {
    const id = url.split("/").pop();
    const apiUrl = `https://pixeldrain.com/api/file/${id}/info`;
    const { data } = await axios.get(apiUrl);
    return {
      file_name: data.name,
      file_size: data.size,
      download_url: `https://pixeldrain.com/api/file/${id}`
    };
  } catch (e) {
    return { error: "Link එක ලබාගැනීමේදී දෝෂයකි." };
  }
}

module.exports = PixaldrainDL;
