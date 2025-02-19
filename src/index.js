const { app, BrowserWindow } = require("electron");
const puppeteer = require("puppeteer");

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    resizable: false,
  });

  win.loadFile("src/views/index.html");
};

const buscarInfo = async (query, filter) => {
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
  await page.waitForNetworkIdle({ idleTime: 1000 });

  await page.click("#AutoCompleteResult > a");

  if (filter.lang) {
    await page.click("a[href='#articleFilterProductLanguage']");
    await page.waitForNetworkIdle({ idleTime: 1000 });

    await page.click(
      "#articleFilterProductLanguage .filter-box input[name='language[4]']"
    );
    await page.waitForNetworkIdle({ idleTime: 1000 });

    await page.click("input[title='Filtrar']");
    await page.waitForNetworkIdle({ idleTime: 1000 });
  }

  await page.locator("a ::-p-text(Mostrar ofertas)").click();
  await page.waitForNetworkIdle({ idleTime: 1000 });

  let more = await page.$eval("#loadMoreButton", () => true).catch(() => false);

  while (more) {
    try {
      await page.click("#loadMoreButton");
      await page.waitForNetworkIdle({ idleTime: 1000 });
    } catch (error) {
      more = false;
    }
  }
};

app.whenReady().then(() => {
  createWindow();

  buscarInfo("Bibarel BRS 121", { lang: 4 });
});
