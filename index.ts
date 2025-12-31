import { env } from "node:process";
import { join, sep } from "node:path";
import { STATUS_CODES } from "node:http";
import { access, constants, glob } from "node:fs/promises";

import express from "express";

const app = express();

const port = env.PORT || 3001;

const pagesPath = join(import.meta.dirname, "public", "pages");

app.get("/pages", async (_, res) => {
  const available: string[] = [];

  for await (const entry of glob(join(pagesPath, "*.html"))) {
    const fileName = entry.substring(
      entry.lastIndexOf(sep) + 1,
      entry.lastIndexOf("."),
    );
    available.push(fileName);
  }

  res.status(200).send(`<html>
<body>
<h1>Available pages</h1>
<ul>
${available
  .map((page) => {
    return `<li><a href="/pages/${page}">${page}</a></li>`;
  })
  .join("\n")}
</ul>
</body>
</html>`);
});

app.get("/pages/:page", async (req, res) => {
  const page = req.params.page;
  const filePath = join(pagesPath, `${page}.html`);

  try {
    await access(filePath, constants.R_OK);
    res.sendFile(filePath);
  } catch (error) {
    res.status(404).send(`File not found: ${page}.html`);
  }
});

app.get("/http", (_, res) => {
  const available = Object.entries(STATUS_CODES).filter(
    ([code]) =>
      (code >= "200" && code <= "299") ||
      (code >= "400" && code <= "499") ||
      (code >= "500" && code <= "599"),
  );

  res.status(200).send(`<html>
<body>
<h1>Available HTTP statuses</h1>
<ul>
${available
  .map(([code, description]) => {
    return `<li><a href="/http/${code}">${description}</a></li>`;
  })
  .join("\n")}
</ul>
</body>
</html>`);
});

app.get("/http/:status", (req, res) => {
  const statusCode = parseInt(req.params.status);
  const statusDescription = STATUS_CODES[statusCode];
  res
    .status(statusCode)
    .send(
      `<html><body><h1>HTTP status: ${statusCode}</h1><p>${statusDescription}</p></body></html>`,
    );
});

app.listen(port, () => {
  console.log("server is listening on port", port);
});
