const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const path = require('path');
const app = express();

// Мидлвары
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));

// Конфигурация сессии
app.use(session({
  secret: 'your_secret_key_here',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Для разработки на localhost
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 часа
  }
}));

// Папка для кэшированных данных
const cacheDir = path.join(__dirname, 'cache');
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir);
}

// Функция для кэширования данных (например, файловый кэш)
function getCachedData(key, ttlSeconds = 30) {
  const cacheFile = path.join(cacheDir, `${key}.json`);
  if (fs.existsSync(cacheFile)) {
    const stats = fs.statSync(cacheFile);
    const now = new Date().getTime();
    const fileAge = (now - stats.mtimeMs) / 1000;
    if (fileAge < ttlSeconds) {
      const cachedData = fs.readFileSync(cacheFile, 'utf-8');
      return JSON.parse(cachedData);
    }
  }
  const newData = {
    items: [1, 2, 3],  // Пример данных
    timestamp: Date.now(),
    source: 'Файловый кэш',
  };
  fs.writeFileSync(cacheFile, JSON.stringify(newData));
  setTimeout(() => {
    if (fs.existsSync(cacheFile)) {
      fs.unlinkSync(cacheFile);
    }
  }, ttlSeconds * 1000);
  return newData;
}

// Маршрут для получения данных
app.get('/api/data', (req, res) => {
  const data = getCachedData('api_data');
  res.json(data);
});

// Маршрут для логина
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === '12345') {
    req.session.user = { username };
    return res.json({ success: true });
  }
  res.status(401).json({ success: false });
});

// Проверка авторизации
app.get('/check-auth', (req, res) => {
  if (req.session.user) {
    return res.json({ authenticated: true, user: req.session.user });
  }
  res.json({ authenticated: false });
});

// Логаут
app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).send('Ошибка выхода');
    }
    res.clearCookie('connect.sid');
    res.json({ success: true });
  });
});

// Маршрут для смены темы (сохранение в куки)
app.post('/theme', (req, res) => {
  const { theme } = req.body;
  res.cookie('theme', theme, {
    maxAge: 86400000, // 1 день
    httpOnly: true,
    sameSite: 'strict',
  });
  res.sendStatus(200);
});

// Запуск сервера
app.listen(3000, () => {
  console.log('Сервер запущен на http://localhost:3000');
  console.log('Для теста используйте:');
  console.log('Логин: admin');
  console.log('Пароль: 12345');
});

// Логирование запросов
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// Пример кеширования статики
app.use((req, res, next) => {
  if (req.url.endsWith('.js') || req.url.endsWith('.css')) {
    res.set('Cache-Control', 'public, max-age=86400');
  }
  next();
});

process.on('uncaughtException', (err) => {
  console.error('Необработанная ошибка:', err);
});

  
