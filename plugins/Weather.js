const { cmd } = require('../command');

cmd({
  pattern: 'weather ?(.*)',
  desc: 'කාලගුණය බලන්න (සිංහල ස්ථානත්)',
  category: 'tools',
  react: '⛅',
  filename: __filename,
}, async (client, message, m, extras) => {
  let location = m[1]?.trim();
  if (!location) location = "Colombo";

  try {
    // Try with original location first
    const res = await fetch(`https://wttr.in/${encodeURIComponent(location)}?format=j1`);
    const data = await res.json();

    if (!data.current_condition || !data.nearest_area) {
      // If empty or error response, try to fallback to English Google Location Search
      const fallbackRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`);
      const fallbackData = await fallbackRes.json();

      if (!fallbackData.length) {
        return await extras.reply("❌ ඔබ ඇතුලත් කළ ස්ථානය සොයාගත නොහැක.");
      }

      const locName = fallbackData[0].display_name;
      const fallbackWeatherRes = await fetch(`https://wttr.in/${encodeURIComponent(locName)}?format=j1`);
      const fallbackWeatherData = await fallbackWeatherRes.json();

      if (!fallbackWeatherData.current_condition || !fallbackWeatherData.nearest_area) {
        return await extras.reply("❌ කාලගුණය ලබාගැනීමේදී දෝෂයක් හටගැණිනි.");
      }

      return await sendWeather(fallbackWeatherData, extras);
    }

    return await sendWeather(data, extras);
  } catch (err) {
    console.error(err);
    return await extras.reply("⚠️ කාලගුණය ලබාගැනීමේදී දෝෂයක් ඇත. නැවත උත්සාහ කරන්න.");
  }
});

async function sendWeather(data, extras) {
  const w = data.current_condition[0];
  const area = data.nearest_area[0];

  const reply = `
╭───『 *කාලගුණ වාර්තාව* 』
│📍 ස්ථානය: ${area.areaName[0].value}, ${area.region[0].value}
│🌡️ උෂ්ණත්වය: ${w.temp_C}°C
│☁️ තත්ත්වය: ${w.weatherDesc[0].value}
│💧 ආර්ද්‍රතාවය: ${w.humidity}%
│💨 සුළං වේගය: ${w.windspeedKmph} km/h
╰───────────────────────`;

  await extras.reply(reply);
}
