const http = require('http');
const fs = require('fs');
const path = require('path');

const TOKEN = '8927896544:AAEPtPLdDFFev0GeJV0_yyjgZBZy1o-4FYQ';
const CHAT_ID = '5892298817';
const PORT = 8080;
const ROOT = path.resolve(__dirname, '.');

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

http.createServer(async (req, res) => {
  const [urlPath, qs] = req.url.split('?');

  // CORS
  const setCORS = () => { res.setHeader('Access-Control-Allow-Origin', '*'); res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS'); res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); };
  if (req.method === 'OPTIONS') { setCORS(); res.writeHead(204); res.end(); return; }

  if ((urlPath === '/api/send' || urlPath === '/send.php') && req.method === 'POST') {
    setCORS();
    let body = '';
    req.on('data', c => body += c);
    req.on('end', async () => {
      let data;
      try {
        data = JSON.parse(body);
      } catch (e) {
        data = Object.fromEntries(new URLSearchParams(body));
      }
      const isSolo = data.role === 'solo';

      let text = `🔔 <b>Новая заявка</b>\n\n`;
      text += `👤 Имя: ${data.name}\n`;
      text += `📞 Контакт (${data.contactType || 'telegram'}): ${data.contact}\n`;
      if (isSolo) {
        text += `🎯 Роль: Соло — ищу команду\n🎭 Позиция: ${data.soloRole || 'не указана'}\n🏆 Рейтинг: ${data.soloRating || 'не указан'}\n📝 О себе: ${data.about || 'не указано'}\n`;
      } else {
        text += `🏷 Команда: ${data.brand}\n👥 Состав: ${data.roster || 'не указан'}\n🏆 Рейтинг команды: ${data.teamRating || 'не указан'}\n`;
      }
      text += `🕐 Время: ${data.time}`;

      try {
        const tg = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: 'HTML' })
        });
        const ok = tg.ok;
        res.writeHead(ok ? 200 : 500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: ok ? 'ok' : 'error' }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'error', message: e.message }));
      }
    });
    return;
  }

  let filePath = path.resolve(ROOT, urlPath === '/' ? 'index.html' : '.' + urlPath);
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403); res.end('Forbidden');
    return;
  }
  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        fs.readFile(path.join(ROOT, '404.html'), (e2, d2) => {
          res.writeHead(e2 ? 404 : 404, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(e2 ? 'Not found' : d2);
        });
      } else {
        res.writeHead(500); res.end('Internal error');
      }
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(PORT, () => console.log(`Server: http://localhost:${PORT}`));
