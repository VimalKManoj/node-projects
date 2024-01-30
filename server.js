const http = require("http");
const fs = require("fs");
const url = require("url");
const tempReplace = require("./modules/tempReplace");

const tempOverview = fs.readFileSync(
  `${__dirname}/templates/overview.html`,
  "utf-8"
);
const tempProduct = fs.readFileSync(
  `${__dirname}/templates/product-template.html`,
  "utf-8"
);
const tempCard = fs.readFileSync(
  `${__dirname}/templates/template-card.html`,
  "utf-8"
);

const data = fs.readFileSync(`${__dirname}/data/data.json`, "utf-8");
const dataObj = JSON.parse(data);

const server = http.createServer((req, res) => {
  const { query, pathname } = url.parse(req.url, true);
  //   const pathname = req.url;

  //   OVERVIEW PAGE
  if (pathname === "/" || pathname === "/overview") {
    res.writeHead(200, { "content-type": "text/html" });

    const HTMLpage = dataObj
      .map((element) => tempReplace(tempCard, element))
      .join("");
    const output = tempOverview.replace(/{%PRODUCT_CARDS%}/g, HTMLpage);
    res.end(output);

    //   PRODUCT PAGE
  } else if (pathname === "/product") {
    // console.log(query);
    res.writeHead(200, { "content-type": "text/html" });
    prodDetail = dataObj[query.id];

    if (prodDetail !== undefined) {
      const prodHTML = tempReplace(tempProduct, prodDetail);

      res.end(prodHTML);
    } else {
      res.end("<h1>Product not found<h1/>");
    }
    //   res.writeHead(404, { "content-type": "text/html" });

    //   API PAGE
  } else if (pathname === "/api") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(data);

    //   NOT FOUND PAGE
  } else {
    res.writeHead(404, { "content-type": "text/html" });
    res.end("<h1>page not found<h1/>");
  }
});

server.listen(8000, "localhost", () => {
  console.log("listening to port 8000");
});
