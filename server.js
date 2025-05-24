const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();
const cors = require('cors');
const fs = require('fs');

// Enable CORS
server.use(cors());
server.use(jsonServer.bodyParser);

// Set default middlewares (logger, static, cors and no-cache)
server.use(middlewares);

// Add custom routes before JSON Server router
server.use((req, res, next) => {
  console.log('=== New Request ===');
  console.log(`${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  
  if (req.method === 'POST') {
    try {
      // Проверяем, что db.json существует и доступен для записи
      fs.accessSync('db.json', fs.constants.R_OK | fs.constants.W_OK);
      console.log('db.json доступен для чтения и записи');
      
      req.body.createdAt = Date.now();
      console.log('Добавлен createdAt:', req.body.createdAt);
    } catch (err) {
      console.error('Ошибка доступа к db.json:', err);
      return res.status(500).json({ 
        error: 'Ошибка доступа к базе данных',
        details: err.message 
      });
    }
  }
  next();
});

// Обработка ошибок
server.use((err, req, res, next) => {
  console.error('Ошибка сервера:', err);
  res.status(500).json({ 
    error: 'Внутренняя ошибка сервера',
    details: err.message 
  });
});

// Use default router
server.use(router);

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`JSON Server is running on port ${port}`);
  // Проверяем доступность db.json при запуске
  try {
    const db = JSON.parse(fs.readFileSync('db.json', 'utf8'));
    console.log('Текущее состояние базы данных:', db);
  } catch (err) {
    console.error('Ошибка при чтении db.json:', err);
  }
}); 