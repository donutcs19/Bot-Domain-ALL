const puppeteer = require("puppeteer");
const UrlAPI = "http://localhost:3000";
let errorCount = 0;
let last3Domains = [];

const fetchData = async () => {
  let domainId = null;
  try {
    console.log("Wait to Process");
    const response = await fetch(`${UrlAPI}/index/list`);
    const json = await response.json();
    const dataJson = json?.map((result) => result).filter(Boolean) || [];

    for (const data of dataJson) {
      domainId = data.id;
      const domain = data.domain;
      const nameDomain = data.name;

      try {
        await SendDataToDB(domainId, domain, nameDomain);
      } catch (err) {
        throw err;
      }
    }
  } catch (err) {
    console.error("[Fetch Error] -> ", err);

    errorCount++;

    if (errorCount >= 3) {
      try {
        const errorBot = err.message;
        SendLogs(errorBot);
        SendDNF(domainId);

        console.log("Urls DNF 3 times");
      } catch (error) {
        console.error("Error sending error report:", error);
      }

      errorCount = 0;
    }
  } finally {
    setTimeout(fetchData, 10000);
  }
};
fetchData();

const SendDataToDB = async (id, domain, NameDomain) => {
  let browser;
  try {
    await new Promise((resolve) => setTimeout(resolve, 3000));

    browser = await puppeteer.launch({
      headless: false,
      slowMo: 0,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-infobars",
        "--window-position=0,0",
        "--ignore-certifcate-errors",
        "--ignore-certifcate-errors-spki-list",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
        "--window-size=1920,1080",
      ],
      defaultViewport: null,
    });

    const page = await browser.newPage();
    console.log("\n");
    console.log("Search Full_Index_URL");

    await page.goto("https://www.google.com");
    await page.waitForSelector("#APjFqb");

    const WaitInput = Math.floor(Math.random() * 5000) + 2000;
    await new Promise((resolve) => setTimeout(resolve, WaitInput));

    const delayInput = Math.floor(Math.random() * 300) + 200;
    await page.type("#APjFqb", domain, { delay: delayInput });

    const WaitClick = Math.floor(Math.random() * 4000) + 2000;
    await new Promise((resolve) => setTimeout(resolve, WaitClick));
    await page.keyboard.press("Enter");
    await page.waitForSelector("cite");

    const data = await page.evaluate(() => {
      const index_url = document.querySelector("cite").innerText;
      return { index_url };
    });

    await new Promise((resolve) => setTimeout(resolve, 4000));

    console.log("Search Full_Index_Name");

    await page.waitForSelector("#APjFqb");
    await page.focus("#APjFqb");
    const WaitCtrlA = Math.floor(Math.random() * 3000) + 2000;
    await new Promise((resolve) => setTimeout(resolve, WaitCtrlA));
    await page.keyboard.down("Control");
    await page.keyboard.press("KeyA");
    await page.keyboard.up("Control");
    const WaitDel = Math.floor(Math.random() * 3000) + 2000;
    await new Promise((resolve) => setTimeout(resolve, WaitDel));
    await page.keyboard.press("Backspace");

    const WaitInput2 = Math.floor(Math.random() * 4000) + 2000;
    await new Promise((resolve) => setTimeout(resolve, WaitInput2));
    const delayInput2 = Math.floor(Math.random() * 300) + 200;
    await page.type("#APjFqb", NameDomain, { delay: delayInput2 });

    const WaitEnter = Math.floor(Math.random() * 4000) + 2000;
    await new Promise((resolve) => setTimeout(resolve, WaitEnter));
    await page.keyboard.press("Enter");
    await page.waitForSelector("cite");

    const data2 = await page.evaluate(() => {
      const index_name = document.querySelector("cite").innerText;
      return { index_name };
    });

    const full_url = data.index_url;
    const full_name = data2.index_name;

    function extractDomain(full_name) {
      return full_name.split(" ")[0];
    }
    const url_split = extractDomain(full_name);

    if (full_url.includes(domain.toLowerCase())) {
      index_domain = "true";
    } else {
      index_domain = "false";
    }

    if (url_split.includes(NameDomain)) {
      index_name = "true";
    } else {
      index_name = "false";
    }

    console.log("url : " + domain);
    console.log("index is : " + full_url);
    console.log(index_domain);
    console.log("name : " + NameDomain);
    console.log("index is : " + full_name);
    console.log(index_name);

    const URL = `${UrlAPI}/index/update`;
    const payload = {
      id: id,
      index_domain: index_domain,
      index_name: index_name,
      full_url: full_url,
      full_name: full_name,
    };

    const payloads = JSON.stringify(payload);
    await fetch(URL, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: payloads,
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(domain, data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });

    await new Promise((resolve) => setTimeout(resolve, 4000));
    await browser.close();

    await browser.close();
  } catch (err) {
    console.error("[SendDataToDB Error] -> ", err);
    if (browser) {
      await browser.close();
    }
    throw err;
  }
};

const SendLogs = async (errorBot) => {
  const URL_logs = `${UrlAPI}/index/error`;

  await fetch(URL_logs, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ errorBot: errorBot }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
    })
    .catch((error) => {
      console.error("ErrorBOT:", error);
    });
};

const SendDNF = async (id) => {
  const URL_DNF = `${UrlAPI}/index/DNF`;

  await fetch(URL_DNF, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: id }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
    })
    .catch((error) => {
      console.error("ErrorDNF:", error);
    });
};
