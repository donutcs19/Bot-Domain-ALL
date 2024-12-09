const puppeteer = require("puppeteer");
const UrlAPI = "http://localhost:3000";
let errorCount = 0;

const fetchDomainDropCatch = async () => {
  try {
    const browser = await puppeteer.launch({
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
    const page = await browser.newPage();

    await page.goto("https://www.dropcatch.com/");
    await page.waitForSelector(
      "body > app-root > div > div > app-search > main > section > app-table-search-results > app-table > article > section:nth-child(1) > div"
    );
    const Wait = Math.floor(Math.random() * 3000) + 2000;
    await new Promise((resolve) => setTimeout(resolve, Wait));
    await page.click(
      "body > app-root > div > div > app-search > main > section > app-table-search-results > app-table > article > section:nth-child(1) > div"
    );
    const Wait2 = Math.floor(Math.random() * 3000) + 2000;
    await new Promise((resolve) => setTimeout(resolve, Wait2));
    await page.click(
      "body > app-root > div > div > app-search > main > section > section > app-filters > article > app-filter-group:nth-child(2) > app-filters-checkbox-items > fieldset > label:nth-child(1) > input[type=checkbox]"
    );
    await page.waitForSelector(
      "body > app-root > div > div > app-search > main > section > app-table-search-results > app-table > article > section:nth-child(1) > div"
    );
    const Wait3 = Math.floor(Math.random() * 3000) + 2000;
    await new Promise((resolve) => setTimeout(resolve, Wait3));
    await page.click(
      "body > app-root > div > div > app-search > main > section > section > app-filters > article > app-filter-group:nth-child(2) > app-filters-checkbox-items > fieldset > label:nth-child(2) > input[type=checkbox]"
    );
    await page.waitForSelector(
      "body > app-root > div > div > app-search > main > section > app-table-search-results > app-table > article > section:nth-child(1) > div"
    );
    const Wait4 = Math.floor(Math.random() * 3000) + 2000;
    await new Promise((resolve) => setTimeout(resolve, Wait4));
    await page.click(
      "body > app-root > div > div > app-search > main > section > section > app-filters > article > app-filter-group:nth-child(2) > app-filters-checkbox-items > fieldset > label:nth-child(3) > input[type=checkbox]"
    );
    await page.waitForSelector(
      "body > app-root > div > div > app-search > main > section > app-table-search-results > app-table > article > section:nth-child(1) > div"
    );
    const Wait5 = Math.floor(Math.random() * 3000) + 2000;
    await new Promise((resolve) => setTimeout(resolve, Wait5));
    await page.click(
      "body > app-root > div > div > app-search > main > section > app-table-search-results > app-table > section > mat-paginator > div > div > div.mat-paginator-page-size.ng-star-inserted > mat-form-field"
    );
    const Wait6 = Math.floor(Math.random() * 3000) + 2000;
    await new Promise((resolve) => setTimeout(resolve, Wait6));
    await page.click("#mat-option-3");
    await page.waitForSelector(
      "body > app-root > div > div > app-search > main > section > app-table-search-results > app-table > article > section:nth-child(250) > div"
    );

    for (let i = 1; i <= 250; i++) {
      const data = await page.evaluate((index) => {
        const getInnerText = (selector) => {
          const element = document.querySelector(selector);
          return element ? element.innerText : "N/A";
        };

        const Domain = getInnerText(
          `body > app-root > div > div > app-search > main > section > app-table-search-results > app-table > article > section:nth-child(${index}) > div > div.dc-table__domain-row.small-font.ng-tns-c224-6`
        );
        const HighBid = getInnerText(
          `body > app-root > div > div > app-search > main > section > app-table-search-results > app-table > article > section:nth-child(${index}) > div > div.dc-table__info-row.ng-tns-c224-6 > div.dc-table__info-row-col2.ng-tns-c224-6 > span#domainPrice`
        );
        // const ofBids = getInnerText(`body > app-root > div > div > app-search > main > section > app-table-search-results > app-table > article > section:nth-child(${index}) > div > div.dc-table__info-row.ng-tns-c222-6 > div.dc-table__info-row-col2.ng-tns-c222-6 > span#bidCount`);
        // const Time = getInnerText(`body > app-root > div > div > app-search > main > section > app-table-search-results > app-table > article > section:nth-child(${index}) > div > div.dc-table__info-row.ng-tns-c222-6 > div.dc-table__info-row-col1.ng-tns-c222-6 > span.dc-table-search-results__time.ng-tns-c222-6 > app-time-remaining > span > #time-remaining`);
        // const Type = getInnerText(`body > app-root > div > div > app-search > main > section > app-table-search-results > app-table > article > section:nth-child(${index}) > div > div.dc-table__info-row.ng-tns-c222-6 > div.dc-table__info-row-col1.ng-tns-c222-6 > span.dc-table-search-results__type.ng-tns-c222-6.ng-star-inserted`);
        return { Domain, HighBid }; //, Time, Type, ofBids
      }, i);

      // // Part DropDate

      // await page.click(`body > app-root > div > div > app-search > main > section > app-table-search-results > app-table > article > section:nth-child(${i}) > div > div.dc-table__domain-row.small-font.ng-tns-c222-6 > #domainName`);
      // await page.waitForSelector("body > app-root > div > div > app-domain-detail > main > app-domain-detail-active-auction > header > article > app-quick-facts");

      // const data2 = await page.evaluate(() => {
      //   const getInnerText2 = (selector) => {
      //     const element = document.querySelector(selector);
      //     return element ? element.innerText : 'N/A';
      //   };
      //   const DropDate = getInnerText2("body > app-root > div > div > app-domain-detail > main > app-domain-detail-active-auction > header > article > app-quick-facts > section > small");
      //   return { DropDate };
      // });

      // // Part DropDate

      const Domain = data.Domain;
      const HighBid = data.HighBid;

      const results = await checkDomainInDB(Domain);
      if (results.length > 0) {
        const Wait = Math.floor(Math.random() * 6000) + 4000;
        await new Promise((resolve) => setTimeout(resolve, Wait));
        console.log(`${Domain} -> Exists in DB`);
      } else {
        const Wait = Math.floor(Math.random() * 6000) + 4000;
        await new Promise((resolve) => setTimeout(resolve, Wait));
        console.log(`${Domain} -> Waiting insert to DB...`);
        await insertDB(Domain, HighBid);
      }
    }

    await browser.close();
  } catch (error) {
    console.error("[Fetch Error] -> ", error);

    errorCount++;

    if (errorCount >= 3) {
      
      try {
        const errorBot = error.message;
        SendLogs(errorBot)
       
        console.log("DNF 3 times");
      } catch (error) {
        console.error("Error sending error report:", error);
      }

      errorCount = 0;
    }
  } finally {
    setTimeout(fetchDomainDropCatch, 60000);
  }
};

fetchDomainDropCatch();

//check same domain in db
const checkDomainInDB = async (Domain) => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch(
        `${UrlAPI}/dr/list/${encodeURIComponent(Domain)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        console.error("[API Error] -> ", error);
        return reject(error);
      }

      const results = await response.json();
      resolve(results);
    } catch (err) {
      console.error("[Error] -> ", err);
      reject(err);
    }
  });
};

//API, insert data to db
const insertDB = async (Domain, HighBid) => {
  const URL = `${UrlAPI}/dr/create`;

  const payload = {
    domain: Domain.toLowerCase(),
    highBid: HighBid,
  };

  const payloads = JSON.stringify(payload);

  fetch(URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: payloads,
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(Domain, data);
    })
    .catch((error) => {
      console.log("[Error] -> ", error);
    });
};

//Send logs error to db
const SendLogs = async (errorBot) => {

  const URL = `${UrlAPI}/dr/logs`;

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
