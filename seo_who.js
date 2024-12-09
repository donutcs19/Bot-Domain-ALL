const puppeteer = require("puppeteer");
const UrlAPI = "http://localhost:3000";
let errorCount = 0;
let last3Domains = [];

const fetchDomainsAndInsert = async () => {
  let id_domain = null;
  try {
    const response = await fetch(`${UrlAPI}/who/list`);
    const json = await response.json();

    const dataJson = json?.map((result) => result).filter(Boolean) || [];

    for (const data of dataJson) {
      const domain = data.domain;
      id_domain = data.id;

      const Wait = Math.floor(Math.random() * 3000) + 1000;
      await new Promise((resolve) => setTimeout(resolve, Wait));
      console.log(`${domain} -> Waiting insert to DB...`);
      await scrapeDomainData(domain, id_domain);
    }
  } catch (error) {
    console.error("[Fetch Error] -> ", error);
    last3Domains.push(id_domain);

    if (last3Domains.length > 3) {
      last3Domains.shift();
    }

    const allSameDomain = last3Domains.every(
      (domain) => domain === last3Domains[0]
    );

    if (allSameDomain) {
      errorCount++;
    } else {
      errorCount = 0;
    }

    if (errorCount >= 3) {
      try {
        const errorBot = error.message;
        SendLogs(errorBot);
        SendDNF(id_domain);

        console.log("Domain DNF 3 times");
      } catch (error) {
        console.error("Error sending error report:", error);
      }

      errorCount = 0;
      last3Domains = [];
    }
  } finally {
    setTimeout(fetchDomainsAndInsert, 10000);
  }
};

fetchDomainsAndInsert();

//Start to scraper
const scrapeDomainData = async (domain, id) => {
  const browserSeo = await puppeteer.launch({
    headless: true,
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
  const pageSeo = await browserSeo.newPage();

  await pageSeo.goto("https://who.is");

  await pageSeo.waitForSelector(
    "#domainSearchForm > div > div.col-12.col-md-6.col-lg-4.pe-md-0 > input"
  );
  const WaitInput = Math.floor(Math.random() * 3000) + 1000;
  await new Promise((resolve) => setTimeout(resolve, WaitInput));
  const delayDomain = Math.floor(Math.random() * 200) + 150;
  await pageSeo.type(
    "#domainSearchForm > div > div.col-12.col-md-6.col-lg-4.pe-md-0 > input",
    `${domain}`,
    { delay: delayDomain }
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
      return element
        ? element.innerText.trim() === ""
          ? "dnf"
          : element.innerText
        : "N/A";
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
  const ExpiresOn = Who.Expires_On;
  const RegisteredOn = Who.Registered_On;
  const UpdatedOn = Who.Updated_On;

  const URL = `${UrlAPI}/who/update`;
  const payload = {
    id: Id,
    expiresOn: ExpiresOn,
    registeredOn: RegisteredOn,
    updatedOn: UpdatedOn,
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

  const WaitClose = Math.floor(Math.random() * 4000) + 2000;
  await new Promise((resolve) => setTimeout(resolve, WaitClose));
  await browserSeo.close();
};

//API, Send logs error to db
const SendLogs = async (errorBot) => {
  const URL = `${UrlAPI}/who/logs`;

  await fetch(URL, {
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
};

const SendDNF = async (id) => {
  const URL_DNF = `${UrlAPI}/who/DNF`;

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
