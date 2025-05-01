const puppeteer = require('puppeteer');
const axios = require('axios');
const cheerio = require('cheerio');

// List of competitors of Infosys
const competitors = [
    "Accenture",
    "Cognizant Technology Solutions",
    "IBM",
    "TCS",
    "Wipro",
    "Capgemini",
    "Tech Mahindra",
    "HCL Technologies",
    "Deloitte",
    "PwC"
];

// Target company
const targetCompany = "Virgin Media";

// Function to search Bing for a specific query
async function bingSearch(query) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    const url = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Extract search results
    const results = await page.evaluate(() => {
        const items = document.querySelectorAll('.b_algo');
        const results = [];
        items.forEach(item => {
            const titleElement = item.querySelector('h2');
            const linkElement = item.querySelector('a');
            const snippetElement = item.querySelector('p');

            if (titleElement && linkElement && snippetElement) {
                const title = titleElement.innerText;
                const link = linkElement.href;
                const snippet = snippetElement.innerText;
                results.push({ title, link, snippet });
            }
        });
        return results;
    });

    await browser.close();
    return results;
}

// Function to scrape news website (example: Reuters)
async function scrapeNewsWebsite(url, query) {
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        const results = [];

        // Example for Reuters
        $('.story-card__headline').each((index, element) => {
            const title = $(element).text().trim();
            const link = $(element).parent().attr('href');
            const snippet = $(element).next().text().trim();
            if (title.toLowerCase().includes(query.toLowerCase())) {
                results.push({ title, link, snippet });
            }
        });

        return results;
    } catch (error) {
        console.error(`Error fetching ${url}:`, error);
        return [];
    }
}

// Function to check if a result mentions both the competitor and the target company
function isRelevantResult(result, competitor, targetCompany) {
    return result.title.toLowerCase().includes(competitor.toLowerCase()) &&
           result.title.toLowerCase().includes(targetCompany.toLowerCase());
}

// Main function to find relevant collaborations
async function findCollaborations(competitors, targetCompany) {
    const collaborations = [];
    for (const competitor of competitors) {
        const query = `${competitor} ${targetCompany} collaboration`;
        const bingResults = await bingSearch(query);
        const newsResults = await scrapeNewsWebsite(`https://www.reuters.com/search/news?blob=${encodeURIComponent(query)}`, query);

        const combinedResults = [...bingResults, ...newsResults];
        for (const result of combinedResults) {
            if (isRelevantResult(result, competitor, targetCompany)) {
                collaborations.push({ competitor, ...result });
            }
        }
    }
    return collaborations;
}

// Export the function
module.exports = { findCollaborations, competitors, targetCompany };