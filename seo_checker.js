const puppeteer = require("puppeteer");
const UrlAPI = "http://localhost:3000";
const Username = "seraph.lab2@gmail.com";
const Password = "abcxyz123";
let errorCount = 0;

const fetchDomainsAndInsert = async () => {
  try {
    const response = await fetch(`${UrlAPI}/seoChecker/list`);
    const json = await response.json();

    const dataJson = json?.map((result) => result).filter(Boolean) || [];

    for (const data of dataJson) {
      const domain = data.domain;
      const id = data.id;

      console.log(`${domain} -> Waiting insert to DB...`);
      await scrapeDomainData(domain, id);
    }
  } catch (error) {
    console.error("[Fetch Error] -> ", error);

    errorCount++;

    if (errorCount >= 3) {
      try {
        const errorBot = error.message;
        SendLogs(errorBot);

        console.log("Domain DNF 3 times");
      } catch (error) {
        console.error("Error sending error report:", error);
      }

      errorCount = 0;
    }
  } finally {
    setTimeout(fetchDomainsAndInsert, 3000); // 5 minutes   Settime to loop
  }
};

fetchDomainsAndInsert();

const scrapeDomainData = async (domain, id) => {
  let browserSeo = await puppeteer.launch({
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
  let pageSeo = await browserSeo.newPage();

  await pageSeo.goto("https://websiteseochecker.com/login");
  await pageSeo.waitForSelector(
    "#primary > form > div > div:nth-child(1) > input[type=text]"
  );
  const url = pageSeo.url();
  if (url == "https://websiteseochecker.com/login/") {
    const WaitInput = Math.floor(Math.random() * 4000) + 2000;
    await new Promise((resolve) => setTimeout(resolve, WaitInput));
    console.log("Input User/Pass");
    const delayUsername = Math.floor(Math.random() * 200) + 150;
    await pageSeo.waitForSelector(
      "#primary > form > div:nth-child(1) > input[type=text]:nth-child(1)"
    );
    await pageSeo.type(
      "#primary > form > div:nth-child(1) > input[type=text]:nth-child(1)",
      `${Username}`,
      { delay: delayUsername }
    );
    const delayPassword = Math.floor(Math.random() * 200) + 150;
    await pageSeo.waitForSelector(
      "#primary > form > div:nth-child(1) > input[type=password]:nth-child(3)"
    );
    await pageSeo.type(
      "#primary > form > div:nth-child(1) > input[type=password]:nth-child(3)",
      `${Password}`,
      { delay: delayPassword }
    );
    const Login = Math.floor(Math.random() * 3000) + 2000;
    await new Promise((resolve) => setTimeout(resolve, Login));
    await pageSeo.click("#bigbutton");

    console.log("Input Textarea");
    const delayTextarea = Math.floor(Math.random() * 200) + 150;
    await pageSeo.waitForSelector("#form > div.neo > div > textarea");
    await pageSeo.type("#form > div.neo > div > textarea", `${domain}`, {
      delay: delayTextarea,
    });

    const WaitClick = Math.floor(Math.random() * 4000) + 2000;
    await new Promise((resolve) => setTimeout(resolve, WaitClick));
    await pageSeo.click("#bigbutton");
    console.log("Click");

    await pageSeo.waitForSelector(
      "#tg-iox9t > tbody > tr:nth-child(2) > td:nth-child(1) > p > a"
    );

    const seoChecker = await pageSeo.evaluate(() => {
      const getInnerText = (selector) => {
        const element = document.querySelector(selector);
        return element ? element.innerText : "N/A";
      };

      const URL = getInnerText(
        "#tg-iox9t > tbody > tr:nth-child(2) > td:nth-child(1) > p > a"
      );
      const title = getInnerText(
        "#tg-iox9t > tbody > tr:nth-child(2) > td:nth-child(2) > abbr > p"
      );
      const DA = getInnerText(
        "#tg-iox9t > tbody > tr:nth-child(2) > td:nth-child(3) > b"
      );
      const PA = getInnerText(
        "#tg-iox9t > tbody > tr:nth-child(2) > td:nth-child(4) > b"
      );
      const TBL = getInnerText(
        "#tg-iox9t > tbody > tr:nth-child(2) > td:nth-child(5)"
      );
      const QBL = getInnerText(
        "#tg-iox9t > tbody > tr:nth-child(2) > td:nth-child(6)"
      );
      const QT = getInnerText(
        "#tg-iox9t > tbody > tr:nth-child(2) > td:nth-child(7)"
      );
      const OS = getInnerText(
        "#tg-iox9t > tbody > tr:nth-child(2) > td:nth-child(8)"
      );
      const MT = getInnerText(
        "#tg-iox9t > tbody > tr:nth-child(2) > td:nth-child(9)"
      );
      const SS = getInnerText(
        "#tg-iox9t > tbody > tr:nth-child(2) > td:nth-child(10) > font"
      );

      return { URL, title, DA, PA, TBL, QBL, QT, OS, MT, SS };
    });
    const Id = id;
    const Domain = seoChecker.URL;
    const Title = seoChecker.title;
    const Domain_Authority = seoChecker.DA;
    const Page_Authority = seoChecker.PA;
    const Total_Backlink = seoChecker.TBL;
    const Quality_Backlinks = seoChecker.QBL;
    const Percentage_of_QT = seoChecker.QT;
    const Off_Page_SEO_Score = seoChecker.OS;
    const MozTrust = seoChecker.MT;
    const Moz_SpamScore = seoChecker.SS === "N/A" ? "1%" : seoChecker.SS;

    const URL = `${UrlAPI}/seoChecker/update"`;
    const payload = {
      id: Id,
      title: Title,
      DA: Domain_Authority,
      PA: Page_Authority,
      TBL: Total_Backlink,
      QBL: Quality_Backlinks,
      QT: Percentage_of_QT,
      OS: Off_Page_SEO_Score,
      MT: MozTrust,
      SS: Moz_SpamScore,
    };

    console.log("send API");
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
        console.log(Domain, data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });

    await browserSeo.close();
  } else {
    const WaitInput = Math.floor(Math.random() * 4000) + 2000;
    await new Promise((resolve) => setTimeout(resolve, WaitInput));
    await pageSeo.waitForSelector("#form > div.neo > div > textarea");

    const delayTextarea = Math.floor(Math.random() * 200) + 150;
    await pageSeo.type("#form > div.neo > div > textarea", `${domain}`, {
      delay: delayTextarea,
    });

    const WaitClick = Math.floor(Math.random() * 3000) + 1000;
    await new Promise((resolve) => setTimeout(resolve, WaitClick));
    await pageSeo.click("#bigbutton");

    await pageSeo.waitForSelector(
      "#tg-iox9t > tbody > tr:nth-child(2) > td:nth-child(1) > p > a"
    );

    const seoChecker = await pageSeo.evaluate(() => {
      const getInnerText = (selector) => {
        const element = document.querySelector(selector);
        return element ? element.innerText : "N/A";
      };

      const URL = getInnerText(
        "#tg-iox9t > tbody > tr:nth-child(2) > td:nth-child(1) > p > a"
      );
      const title = getInnerText(
        "#tg-iox9t > tbody > tr:nth-child(2) > td:nth-child(2) > abbr > p"
      );
      const DA = getInnerText(
        "#tg-iox9t > tbody > tr:nth-child(2) > td:nth-child(3) > b"
      );
      const PA = getInnerText(
        "#tg-iox9t > tbody > tr:nth-child(2) > td:nth-child(4) > b"
      );
      const TBL = getInnerText(
        "#tg-iox9t > tbody > tr:nth-child(2) > td:nth-child(5)"
      );
      const QBL = getInnerText(
        "#tg-iox9t > tbody > tr:nth-child(2) > td:nth-child(6)"
      );
      const QT = getInnerText(
        "#tg-iox9t > tbody > tr:nth-child(2) > td:nth-child(7)"
      );
      const OS = getInnerText(
        "#tg-iox9t > tbody > tr:nth-child(2) > td:nth-child(8)"
      );
      const MT = getInnerText(
        "#tg-iox9t > tbody > tr:nth-child(2) > td:nth-child(9)"
      );
      const SS = getInnerText(
        "#tg-iox9t > tbody > tr:nth-child(2) > td:nth-child(10) > font"
      );

      return { URL, title, DA, PA, TBL, QBL, QT, OS, MT, SS };
    });

    const Id = id;
    const Domain = seoChecker.URL;
    const Title = seoChecker.title;
    const Domain_Authority = seoChecker.DA;
    const Page_Authority = seoChecker.PA;
    const Total_Backlink = seoChecker.TBL;
    const Quality_Backlinks = seoChecker.QBL;
    const Percentage_of_QT = seoChecker.QT;
    const Off_Page_SEO_Score = seoChecker.OS;
    const MozTrust = seoChecker.MT;
    const Moz_SpamScore = seoChecker.SS === "N/A" ? "1%" : seoChecker.SS;

    const URL = `${UrlAPI}/seoChecker/update`;
    const payload = {
      id: Id,
      title: Title,
      DA: Domain_Authority,
      PA: Page_Authority,
      TBL: Total_Backlink,
      QBL: Quality_Backlinks,
      QT: Percentage_of_QT,
      OS: Off_Page_SEO_Score,
      MT: MozTrust,
      SS: Moz_SpamScore,
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
        console.log(Domain, data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });

    await browserSeo.close();
  }
};

//API, send logs error to db
const SendLogs = async (errorBot) => {
  const URL = `${UrlAPI}/seoChecker/logs`;

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
};
