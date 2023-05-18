const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function crawl(url, rootUrl, visited) {
  // 이미 방문한 페이지는 무시
  if (visited[url]) {
    return;
  }

  try {
    const response = await axios.get(url);
    visited[url] = true;

    const $ = cheerio.load(response.data);
    let links = [];

    $('a').each((index, element) => {
      let href = $(element).attr('href');
      if (href.startsWith('/')) {
        links.push(rootUrl + href);
      }
    });

    console.log(`Found ${links.length} links at ${url}`);

    // 모든 링크에 대해 동시에 crawl을 호출 (DFS)
    await Promise.all(links.map(link => crawl(link, rootUrl, visited)));

  } catch (error) {
    console.log(`Error in accessing ${url}: `, error.message);
  }
}

async function startCrawling(rootUrl) {
  const visited = {};
  await crawl(rootUrl, rootUrl, visited);

  // Save site tree to file
  const siteTree = JSON.stringify(visited, null, 2);
  fs.writeFile('site_tree.txt', siteTree, (err) => {
    if (err) {
      console.error('Error in saving site tree:', err);
    } else {
      console.log('Site tree saved successfully.');
    }
  });
}

module.exports = startCrawling;