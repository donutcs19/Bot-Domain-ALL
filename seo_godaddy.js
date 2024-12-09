const date = new Date();
const UrlAPI = "http://localhost:3000";
let errorCount = 0;
const StartDate =
  date.getFullYear() +
  "-" +
  String(date.getMonth() + 1).padStart(2, "0") +
  "-" +
  String(date.getDate()).padStart(2, "0");

function EDate(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const formattedDate =
    date.getFullYear() +
    "-" +
    String(date.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(date.getDate()).padStart(2, "0");
  return formattedDate;
}

const EndDate = EDate(1);

const fetchDomainsAndInsert = async () => {
  try {
    
    const response = await fetch(
      // "https://auctions.godaddy.com/beta/findApiProxy/v4/aftermarket/find/auction/recommend?endTimeAfter=2024-11-02T09%3A20%3A45.599Z&endTimeBefore=2024-11-03T09%3A20%3A45.000Z&minAge=10&paginationSize=1000&paginationStart=0&tldIncludeList=com%2Cinfo%2Corg%2Cnet&typeIncludeList=16%2C38&useSemanticSearch=true"
      `https://auctions.godaddy.com/beta/findApiProxy/v4/aftermarket/find/auction/recommend?endTimeAfter=${StartDate}T13%3A53%3A52.139Z&endTimeBefore=${EndDate}T13%3A53%3A52.000Z&minAge=10&paginationSize=1000&paginationStart=0&tldIncludeList=com%2Corg%2Cnet&typeIncludeList=16%2C38&useSemanticSearch=true`
    );
    const json = await response.json();

    const dataJson =
      json.results?.map((result) => result).filter(Boolean) || [];

    for (const data of dataJson) {
      const domain = data.fqdn_from_feed;
      const price = data.valuation_price_usd;

      const results = await checkDomainInDB(domain, price);
      if (results.length > 0) {
        const Wait = Math.floor(Math.random() * 6000) + 4000;
        await new Promise((resolve) => setTimeout(resolve, Wait));
        console.log(`${domain} -> Exists in DB`);
      } else {
        const Wait = Math.floor(Math.random() * 6000) + 4000;
        await new Promise((resolve) => setTimeout(resolve, Wait));
        console.log(`${domain} -> Waiting insert to DB...`);
        await InsertDB(domain, price);
      }
    }
  } catch (error) {
    console.error("[Fetch Error] -> ", error);
    errorCount++;

    if (errorCount >= 3) {
      try {
        const errorBot = error.message;
        SendLogs(errorBot);

        console.log("DNF 3 times");
      } catch (error) {
        console.error("Error sending error report:", error);
      }

      errorCount = 0;
    }
  } finally {
    setTimeout(fetchDomainsAndInsert, 600000);
  }
};

fetchDomainsAndInsert();

//Check same domain in db
const checkDomainInDB = async (domain) => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch(
        `${UrlAPI}/go/list/${encodeURIComponent(domain)}`,
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

//API, Insert data to db 
const InsertDB = async (domain, price) => {
  const URL = `${UrlAPI}/go/create`;

  const payload = {
    domain: domain.toLowerCase(),
    highBid: price,
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
      console.log(domain, data);
    })
    .catch((error) => {
      console.log("[Error] -> ", error);
    });
};

//Send logs error to db
const SendLogs = async (errorBot) => {
  const URL = `${UrlAPI}/go/logs`;

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
