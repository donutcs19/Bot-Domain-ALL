const puppeteer = require("puppeteer");
const UrlAPI = "http://localhost:3000";
let errorCount = 0;

const fetchDomainsAndInsert = async () => {
  try {
    const response = await fetch(`${UrlAPI}/who/list`);
    const json = await response.json();

    const dataJson = json?.map((result) => result).filter(Boolean) || [];

    for (const data of dataJson) {
      const domain = data.domain;
      const id = data.id;

      const Wait = Math.floor(Math.random() * 3000) + 1000;
      await new Promise((resolve) => setTimeout(resolve, Wait));
      console.log(`${domain} -> Waiting insert to DB...`);
      await scrapeDomainData(domain, id);
    }
  } catch (error) {
    console.error("[Fetch Error] -> ", error);
    errorCount++;

    if (errorCount >= 3) {
      
      try {
        const errorBot = error.message;
        SendLogs(errorBot)
       
        console.log("Domain DNF 3 times");
      } catch (error) {
        console.error("Error sending error report:", error);
      }

      errorCount = 0;
    }
  } finally {
    setTimeout(fetchDomainsAndInsert, 5000);
  }
};

fetchDomainsAndInsert();

//Start to scraper
const scrapeDomainData = async (domain, id) => {
  const browserSeo = await puppeteer.launch({ headless: false,
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
    defaultViewport: null, });
    const pageSeo = await browserSeo.newPage();

  await pageSeo.goto("https://who.is");
  await pageSeo.waitForSelector(
    "#domainSearchForm > div > div.col-12.col-md-6.col-lg-4.pe-md-0 > input.2222222"
  );

  const delayDomain = Math.floor(Math.random() * 200) + 150;
  await pageSeo.type(
    "#domainSearchForm > div > div.col-12.col-md-6.col-lg-4.pe-md-0 > input",
    `${domain}`, {delay: delayDomain}
  );

  const WaitClick = Math.floor(Math.random() * 4000) + 2000;
  await new Promise((resolve) => setTimeout(resolve, WaitClick));
  await pageSeo.click(
    `#domainSearchForm > div > div.col-auto.ps-md-1 > button`
  );
  await pageSeo.waitForSelector(
    "body > div:nth-child(7) > div.container-lg > div:nth-child(5) > div.col-md-8.queryResponseContainer > div:nth-child(4) > div > div:nth-child(1) > div.col-8.queryResponseBodyValue"
  );

  const Who = await pageSeo.evaluate(() => {
    const getInnerTextWho = (selector) => {
      const element = document.querySelector(selector);
      return element ? element.innerText : "N/A";
    };
    const Expires_On = getInnerTextWho(
      "body > div:nth-child(7) > div.container-lg > div:nth-child(5) > div.col-md-8.queryResponseContainer > div:nth-child(4) > div > div:nth-child(1) > div.col-8.queryResponseBodyValue"
    );
    const Registered_On = getInnerTextWho(
      "body > div:nth-child(7) > div.container-lg > div:nth-child(5) > div.col-md-8.queryResponseContainer > div:nth-child(4) > div > div:nth-child(2) > div.col-8.queryResponseBodyValue"
    );
    const Updated_On = getInnerTextWho(
      "body > div:nth-child(7) > div.container-lg > div:nth-child(5) > div.col-md-8.queryResponseContainer > div:nth-child(4) > div > div:nth-child(3) > div.col-8.queryResponseBodyValue"
    );
    return { Expires_On, Registered_On, Updated_On };
  });

  const Id = id;
  const Domain = domain;
  const ExpiresOn = Who.Expires_On;
  const RegisteredOn = Who.Registered_On;
  const UpdatedOn = Who.Updated_On;

  const URL = `${UrlAPI}/who/update"`;
  const payload = {
    id: Id,
    expiresOn: ExpiresOn,
    registeredOn: RegisteredOn,
    updatedOn: UpdatedOn,
  };

  const payloads = JSON.stringify(payload);
  fetch(URL, {
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

  await browserSeo.close();
};

//API, Send logs error to db
const SendLogs = async (errorBot) => {

  const URL = `${UrlAPI}/who/logs`;

  fetch(URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ errorLogs: errorBot }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
    })
    .catch((error) => {
      console.error("ErrorBOT:", error);
    });

}
