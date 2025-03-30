const http = require("http");
const fs = require("fs"); // Використовуємо стандартний fs
const path = require("path");
const { program } = require("commander");

program
  .requiredOption("-h, --host <host>", "Server host")
  .requiredOption("-p, --port <port>", "Server port")
  .requiredOption("-c, --cache <cache>", "Cache directory")
  .parse(process.argv);

const { host, port, cache } = program.opts();

// Функція для отримання шляху до файлу
const getCachePath = (statusCode) => path.join(cache, `${statusCode}.jpg`);

const server = http.createServer((req, res) => {
  const statusCode = req.url.substring(1);

  // PUT: записати файл у кеш
  if (req.method === "PUT") {
    const cachePath = getCachePath(statusCode);
    const fileStream = fs.createWriteStream(cachePath); // Тут тепер все правильно
    req.pipe(fileStream);
    fileStream.on("finish", () => {
      res.statusCode = 201;
      res.end("Image saved successfully.");
    });
  }

  // GET: отримати файл із кешу
  else if (req.method === "GET") {
    const cachePath = getCachePath(statusCode);
    fs.readFile(cachePath, (err, data) => {
      if (err) {
        res.statusCode = 404;
        res.end("Image not found.");
      } else {
        res.statusCode = 200;
        res.setHeader("Content-Type", "image/jpeg");
        res.end(data);
      }
    });
  }

  // DELETE: видалити файл із кешу
  else if (req.method === "DELETE") {
    const cachePath = getCachePath(statusCode);
    fs.unlink(cachePath, (err) => {
      if (err) {
        res.statusCode = 404;
        res.end("Image not found.");
      } else {
        res.statusCode = 200;
        res.end("Image deleted successfully.");
      }
    });
  }

  // Інші методи - 405 Method Not Allowed
  else {
    res.statusCode = 405;
    res.end("Method Not Allowed");
  }
});

// Запуск сервера
server.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}`);
});
