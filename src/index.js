const { app, BrowserWindow } = require("electron");
const puppeteer = require("puppeteer");
const mapArticleRow = require("./scripts/mapArticleRow");
const fs = require("fs");

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    resizable: false,
  });

  win.loadFile("src/views/index.html");
};

const buscarInfo = async (query, filter) => {
  const timeout = 1000

  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();
  await page.goto("https://www.cardmarket.com/es/Pokemon", {
    waitUntil: "networkidle0",
  });

  // Set screen size
  await page.setViewport({ width: 1080, height: 1024 });

  // Type into search box
  await page.type("#ProductSearchInput", query);
  await page.waitForNetworkIdle({ idleTime: timeout});

  await page.click("#AutoCompleteResult > a");

  if (filter.lang) {
    await page.click("a[href='#articleFilterProductLanguage']");
    await page.waitForNetworkIdle({ idleTime: timeout});

    await page.click(
      "#articleFilterProductLanguage .filter-box input[name='language[4]']"
    );
    await page.waitForNetworkIdle({ idleTime: timeout});

    await page.click("input[title='Filtrar']");
    await page.waitForNetworkIdle({ idleTime: timeout});
  }

  await page.locator("a ::-p-text(Mostrar ofertas)").click();
  await page.waitForNetworkIdle({ idleTime: timeout});

  let pages = 0;

  while (
    (await page.$eval(
      "#loadMoreButton",
      (el) => el.getAttribute("disabled") === null
    )) &&
    pages < 5
  ) {
    pages++;
    await page.click("#loadMoreButton");
    await page.waitForNetworkIdle({ idleTime: timeout});
  }

  const filas = await page.$$eval(".article-row", mapArticleRow);

  browser.close()
  return filas
};

app.whenReady().then(async () => {
  createWindow();
  const input = fs.readFileSync('input.txt', 'utf-8')
  const cards = input.split(/\n/).map(x => {
    const card = x.match(/([0-9])\s(.+)\s(.+)\s([0-9]+)/m)

    if(card)
    return {
      fullname: `${card[2]} ${card[3]} ${card[4]}`,
      name: card[2],
      set: card[3],
      setcode: Number(card[4]),
      quantity: Number(card[1])
    }
  }).filter(x=>x)

  let results = []

  for (const index in cards) {
    const card = cards[index]
    console.log(`Buscando información de ${card.fullname}...`)
    const cardOffers = await buscarInfo(card.fullname, {lang:4})
    results.push(cardOffers)
  }
  
  //buscarInfo("Relicanth TEF 84", { lang: 4 });
  fs.writeFileSync("output.json", JSON.stringify({results, cards}), "UTF-8");
});
