const config = require("../config");
const { cmd, commands } = require('../command');
const os = require('os');
const fetch = require("node-fetch");
const axios = require("axios");
const cheerio = require("cheerio");
const { getBuffer, runtime } = require('../lib/functions');

// Command: pastpaper <year>
cmd({
    pattern: "pastpaper",
    desc: "Fetch past papers for a specific year and display subject selection menu.",
    category: "main",
    react: "📚",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, reply }) => {
    try {
        // Extract year from command
        const year = body.split(' ')[1];
        if (!year || isNaN(year) || year < 2010 || year > 2020) {
            await conn.sendMessage(from, { react: { text: '⚠️', key: m.key } });
            return reply("⚠️ Please provide a valid year between 2010 and 2020. Example: .pastpaper 2019");
        }

        // Fetch papers from API
        const apiUrl = `https://chathurapsdl.netlify.app/api/psdl?year=${year}`;
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (!data.success || !data.papers || data.papers.length === 0) {
            await conn.sendMessage(from, { react: { text: '⚠️', key: m.key } });
            return reply(`⚠️ No papers found for ${year}. Try another year.`);
        }

        // Create button menu for subjects
        const subjects = data.papers.map(p => ({
            title: p.subject,
            description: `Download ${p.subject} paper for ${year}`,
            id: `.downloadpaper ${p.downloadLink} ${p.subject} ${year}`
        }));

        await conn.sendMessage(from, {
            text: `📚 *Past Papers for ${year}* 📚\n\nSelect a subject to download the paper:`,
            buttons: [{
                buttonId: 'select_subject',
                buttonText: { displayText: '📖 Select Subject' },
                type: 4,
                nativeFlowInfo: {
                    name: 'single_select',
                    paramsJson: JSON.stringify({
                        title: `📚 Past Papers for ${year} 📚`,
                        sections: [{
                            title: `Available Subjects`,
                            rows: subjects
                        }]
                    })
                }
            }],
            headerType: 1,
            viewOnce: true
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error("Error in pastpaper command:", e);
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
        reply(`⚠️ An error occurred: ${e.message}`);
    }
});

// Command: pp <subject>
cmd({
    pattern: "pp",
    desc: "Fetch past papers for a specific subject across years and display year selection menu.",
    category: "main",
    react: "📚",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, reply }) => {
    try {
        // Extract subject from command
        const subject = body.split(' ').slice(1).join(' ').trim();
        if (!subject) {
            await conn.sendMessage(from, { react: { text: '⚠️', key: m.key } });
            return reply("⚠️ Please provide a subject. Example: .pp Biology");
        }

        // Fetch papers for subject across years 2010-2020
        const years = Array.from({ length: 11 }, (_, i) => 2010 + i);
        const availablePapers = [];

        for (const year of years) {
            const apiUrl = `https://chathurapsdl.netlify.app/api/psdl?year=${year}&search=${encodeURIComponent(subject)}`;
            const response = await fetch(apiUrl);
            const data = await response.json();

            if (data.success && data.papers && data.papers.length > 0) {
                availablePapers.push({
                    year,
                    downloadLink: data.papers[0].downloadLink,
                    subject
                });
            }
        }

        if (availablePapers.length === 0) {
            await conn.sendMessage(from, { react: { text: '⚠️', key: m.key } });
            return reply(`⚠️ No papers found for ${subject} between 2010 and 2020.`);
        }

        // Create button menu for years
        const yearOptions = availablePapers.map(p => ({
            title: `${p.year}`,
            description: `Download ${p.subject} paper for ${p.year}`,
            id: `.downloadpaper ${p.downloadLink} ${p.subject} ${p.year}`
        }));

        await conn.sendMessage(from, {
            text: `📚 *Past Papers for ${subject}* 📚\n\nSelect a year to download the paper:`,
            buttons: [{
                buttonId: 'select_year',
                buttonText: { displayText: '📅 Select Year' },
                type: 4,
                nativeFlowInfo: {
                    name: 'single_select',
                    paramsJson: JSON.stringify({
                        title: `📚 Past Papers for ${subject} 📚`,
                        sections: [{
                            title: `Available Years`,
                            rows: yearOptions
                        }]
                    })
                }
            }],
            headerType: 1,
            viewOnce: true
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error("Error in pp command:", e);
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
        reply(`⚠️ An error occurred: ${e.message}`);
    }
});

// Command: downloadpaper
cmd({
    pattern: "downloadpaper",
    desc: "Download and send the selected past paper as a PDF with instructions to open.",
    category: "main",
    react: "📥",
    filename: __filename,
    hidden: true // Hidden command for internal use
},
async (conn, mek, m, { from, quoted, body, reply }) => {
    try {
        // Extract download link, subject, and year from command
        const args = body.split(' ').slice(1);
        const paperUrl = args[0];
        const subject = args.slice(1, -1).join(' ') || 'Paper';
        const year = args[args.length - 1] || 'Unknown';

        if (!paperUrl || !paperUrl.startsWith("http")) {
            await conn.sendMessage(from, { react: { text: '⚠️', key: m.key } });
            return reply("⚠️ Please provide a valid paper URL (e.g., `.downloadpaper https://govdoc.lk/download/61c2ed43f12d0 Biology 2019`)");
        }

        // Fetch initial cookies from govdoc.lk
        const initialResponse = await axios.get("https://govdoc.lk/", {
            headers: { "User-Agent": "Mozilla/5.0" },
            timeout: 5000 // Faster timeout for initial request
        });
        const cookies = initialResponse.headers["set-cookie"]?.join("; ") || "";

        // Fetch the paper
        const downloadResponse = await axios.get(paperUrl, {
            responseType: "arraybuffer",
            maxRedirects: 5,
            timeout: 10000, // Reasonable timeout for download
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                Cookie: cookies,
                Referer: "https://govdoc.lk/",
                "Accept": "application/pdf,text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            },
        });

        let finalUrl = downloadResponse.request.res.responseUrl;
        let paperBuffer = Buffer.from(downloadResponse.data);
        let contentType = downloadResponse.headers["content-type"] || "application/pdf";

        // Handle HTML redirects or embedded PDF links
        if (contentType.includes("html")) {
            const html = paperBuffer.toString("utf8");
            const $html = cheerio.load(html);

            let fileLink = $html("a[href*='.pdf']").attr("href") ||
                           $html("meta[http-equiv='refresh']").attr("content")?.match(/url=(.+)/)?.[1] ||
                           $html("a[href*='download']").attr("href") ||
                           $html("script").text().match(/location\.href\s*=\s*["'](.*\.pdf)["']/i)?.[1];

            if (!fileLink) {
                await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
                return reply(`⚠️ No PDF link found in the response. Please try another paper or contact support.`);
            }

            const pdfUrl = fileLink.startsWith("http") ? fileLink : "https://govdoc.lk" + (fileLink.startsWith("/") ? "" : "/") + fileLink;

            const pdfResponse = await axios.get(pdfUrl, {
                responseType: "arraybuffer",
                maxRedirects: 5,
                timeout: 10000,
                headers: {
                    "User-Agent": "Mozilla/5.0",
                    Cookie: cookies,
                    Referer: paperUrl,
                    "Accept": "application/pdf",
                },
            });

            finalUrl = pdfResponse.request.res.responseUrl;
            paperBuffer = Buffer.from(pdfResponse.data);
            contentType = pdfResponse.headers["content-type"] || "application/pdf";
        }

        // Validate content type
        if (!contentType.includes("pdf")) {
            const textPreview = paperBuffer.toString("utf8").slice(0, 200);
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply(`⚠️ Received non-PDF content (type: ${contentType}). Preview: ${textPreview}`);
        }

        // Validate PDF (basic check)
        if (!paperBuffer.toString('utf8').startsWith('%PDF')) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply(`⚠️ The downloaded file is not a valid PDF. Please try another paper or contact support.`);
        }

        // Check file size (WhatsApp limit ~100 MB)
        if (paperBuffer.length > 100 * 1024 * 1024) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply(`⚠️ The PDF is too large to send via WhatsApp. Please try another paper.`);
        }

        // Extract filename from content-disposition or use default
        const contentDisposition = downloadResponse.headers["content-disposition"];
        const fileName = contentDisposition?.match(/filename="(.+)"/)?.[1] || `${subject}_${year}_Past_Paper.pdf`;

        // Send the PDF as a document
        await conn.sendMessage(from, {
            document: paperBuffer,
            mimetype: 'application/pdf',
            fileName: fileName,
            caption: `📚 *${subject} ${year} Past Paper* 📚\n\nYour past paper is ready! Tap the file to open it in your PDF viewer.\n\nIf you can't open it, install a PDF viewer (e.g., Adobe Acrobat, Google Drive).\n\n> Powered by Past Paper Bot`
        }, { quoted: mek });

        // Send success reaction
        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error("Error in downloadpaper command:", e);
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
        reply(`⚠️ An error occurred while downloading the paper: ${e.message}`);
    }
});

module.exports = commands; // Export the commands
