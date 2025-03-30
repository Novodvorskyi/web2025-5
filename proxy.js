const http = require("http");
const { program } = require("commander");
const fs = require("fs").promises;
const path = require("path");

program
  .requiredOption("-h, --host <host>", "адреса сервера")
  .requiredOption("-p, --port <port>", "порт сервера")
  .requiredOption("-c, --cache <path>", "шлях до кешу");

program.parse(process.argv);
const options = program.opts();
const cacheDir = options.cache;

const server = http.createServer(async (req, res) => {
  if (req.method === "PUT") {
    const code = req.url.slice(1); // Видаляємо "/"
    const filePath = path.join(cacheDir, `${code}.jpg`);

    let data = [];
    req.on("data", (chunk) => data.push(chunk));
    req.on("end", async () => {
      try {
        await fs.writeFile(filePath, Buffer.concat(data));
        res.writeHead(201, { "Content-Type": "text/plain" });
        res.end("Файл збережено!");
      } catch (error) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Помилка збереження файлу!");
      }
    });
  } else {
    res.writeHead(405, { "Content-Type": "text/plain" });
    res.end("Метод не дозволено!");
  }
});

server.listen(options.port, options.host, () => {
  console.log(`Сервер запущено на http://${options.host}:${options.port}`);
});
