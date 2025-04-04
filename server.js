// Создаем базовый сервер
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken'); //библиотека для создания и проверки JWT-токенов
const cors = require('cors'); // middleware для разрешения кросс-доменных запросов 
const dotenv = require('dotenv'); // позволяет использовать .env файл для хранения конфиденциальных данных, например, секретов

dotenv.config();
const app = express();
const PORT = 3000;
app.use(bodyParser.json());
app.use(cors());

let users = []; // "База данных" пользователей

app.listen(PORT, () => {
 console.log(`Server is running on port ${PORT}`);
});

//Регистрация пользователя
//(Принимает username и password.
//сохраняет пользователя в массиве users)
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    if (users.find(u => u.username === username)) {
    return res.status(400).json({ message: 'Такой пользователь уже есть' });
    }
    const newUser = { id: users.length + 1, username, password };
    users.push(newUser); //добавляем в бд(массив)
    res.status(201).json({ message: 'Успешная регистрация' });
   });

   //Аутентификация пользователя (Принимает username и password.
   // Проверяет наличие пользователя в массиве users.
    //Генерирует JWT токен, если данные верны.)
   app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password ===
   password); 
    if (user) {
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
   expiresIn: '1h' }); 
    res.json({ token });
    } else {
    res.status(401).json({ message: 'Авторизация провалена' });
    }
   });

   //Защищенный маршрут (Проверяет JWT токен, Возвращает данные, если токен валиден.)
   const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
    return res.sendStatus(403);
    }
    req.user = user;
    next();
    });
    } else {
    res.sendStatus(401);
    }
   };
   app.get('/protected', authenticateJWT, (req, res) => {
    res.json({ message: 'This is a protected route', user: req.user });
   });

   

   