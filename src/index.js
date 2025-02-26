const { app, BrowserWindow } = require("electron");
const puppeteer = require("puppeteer");
const mapArticleRow = require("./scripts/mapArticleRow.js");
const fs = require("fs");
const browserDo = require("./scripts/browserDo.js");

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    resizable: false,
  });

  win.loadFile("src/views/index.html");
};

const buscarInfo = async (query, filter) => {
  // Inicializamos el navegador y accedemos a cardmarket
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();
  const response = await page.goto("https://www.cardmarket.com/es/Pokemon", {
    waitUntil: "networkidle0",
  });
  await page.setViewport({ width: 1080, height: 1024 });

  if (response.status === 429)
    throw new Error("Página bloqueada por too many request");

  // Busca el nombre del producto en la barra de búsqueda
  await browserDo(async (time) => {
    await page.waitForNetworkIdle({ idleTime: time });
    await page.type("#ProductSearchInput", query);
  }, `buscar ${query} en la barra de busqueda`);

  // Clicamos el primer resultado
  await browserDo(async (time) => {
    await page.waitForNetworkIdle({ idleTime: time });
    await page.click("#AutoCompleteResult > a");
  }, `clicar ${query} en los resultados`);

  if (filter.lang) {
    // Abrimos los filtros
    await browserDo(async (time) => {
      await page.waitForNetworkIdle({ idleTime: time });
      await page.click("a[href='#articleFilterProductLanguage']");
    }, `abrir los filtros para ${query}`);

    // Clicamos los idiomas que queramos filtrar (actualmente hardcoded español)
    await browserDo(async (time) => {
      await page.waitForNetworkIdle({ idleTime: time });
      await page.click(
        "#articleFilterProductLanguage .filter-box input[name='language[4]']"
      );
    }, `seleccionar los idiomas para ${query}`);

    // Clicamos al boton de filtrar para aplicar los filtros
    await browserDo(async (time) => {
      await page.waitForNetworkIdle({ idleTime: time });
      await page.click("input[title='Filtrar']");
    }, `aplicar los filtros para ${query}`);
  }

  // Mostramos todas las ofertas
  await browserDo(async (time) => {
    await page.waitForNetworkIdle({ idleTime: time });
    await page.locator("a ::-p-text(Mostrar ofertas)").click();
  }, `mostrar todas las ofertas de ${query}`);

  let pages = 0;

  let more = await browserDo(async (time) => {
    await page.waitForNetworkIdle({ idleTime: time });
    return Boolean(await page.$("#loadMoreButton"));
  }, `buscar el botón de buscar más en los resultados de ${query}`);

  while (more && pages < 5) {
    pages++;

    await browserDo(async (time) => {
      await page.waitForNetworkIdle({ idleTime: time });
      await page.click("#loadMoreButton");
    }, `clicar el botón de mas resultados en ${query}`);

    more = await browserDo(async (time) => {
      await page.waitForNetworkIdle({ idleTime: time });
      return Boolean(
        await page.$eval(
          "#loadMoreButton",
          (el) => el.getAttribute("disabled") === null
        )
      );
    }, `comprobar que el botón buscar mas de ${query} sigue activo`);
  }

  const filas = await browserDo(async (time) => {
    await page.waitForNetworkIdle({ idleTime: time });
    return await page.$$eval(".article-row", mapArticleRow);
  }, `recibir los datos resultantes de la búsqueda de ${query}`);

  console.log(`\nSe han recibido ${filas.length} filas para ${query}\n\n`);

  browser.close();
  return filas;
};

app.whenReady().then(async () => {
  createWindow();
  const input = fs.readFileSync("input.txt", "utf-8");
  const cards = input
    .split(/\n/)
    .map((x) => {
      const card = x.match(/([0-9])\s(.+)\s(.+)\s([0-9]+)/m);

      if (card)
        return {
          fullname: `${card[2]} ${card[3]} ${card[4]}`,
          name: card[2],
          set: card[3],
          setcode: Number(card[4]),
          quantity: Number(card[1]),
        };
    })
    .filter((x) => x);

  for (const index in cards) {
    const card = cards[index];
    console.log(`Buscando información de ${card.fullname}...`);
    const cardOffers = await browserDo(
      async () => await buscarInfo(card.fullname, { lang: 4 }),
      `buscando información de ${card.fullname}`
    );

    cards[index].offers = cardOffers;
  }

  //buscarInfo("Relicanth TEF 84", { lang: 4 });
  fs.writeFileSync("output.json", JSON.stringify(cards), "UTF-8");
});
