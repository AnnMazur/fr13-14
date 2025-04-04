let token = null; //переменная для токена

//регистрация
document.getElementById('registerForm').addEventListener('submit', async (e)=> {
 e.preventDefault(); //prevent отменяет перезагрузку страницы

 const username = document.getElementById('registerUsername').value; 
 const password = document.getElementById('registerPassword').value;

 const response = await fetch('http://localhost:3000/register', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ username, password })
 }); //отправляем пост запрос в json

 //обработка регистрации
 const result = await response.json();  
 document.getElementById('registerMessage').textContent = result.message ||
'Неудачная регистрация';
});

//вход
document.getElementById('loginForm').addEventListener('submit', async (e) => {
 e.preventDefault();
 const username = document.getElementById('loginUsername').value;
 const password = document.getElementById('loginPassword').value;
 const response = await fetch('http://localhost:3000/login', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ username, password })
 });
 const result = await response.json();
 if (response.ok) {
 token = result.token;
 document.getElementById('loginMessage').textContent = 'Успешная авторизация!';
 } else {
 document.getElementById('loginMessage').textContent = result.message
|| 'Авторизация не пройдена';
 }
});

//запрос защищенных данных
//проверяем наличие токена
document.getElementById('fetchProtectedData').addEventListener('click', async() => {if (!token) {
 document.getElementById('protectedData').textContent = 'Пожалуйста зарегистрируйся для получения секретной информации';
 return;
 }
 const response = await fetch('http://localhost:3000/protected', {
 headers: { 'Authorization': `Bearer ${token}` }
 });
 const result = await response.json();
 if (response.ok) {  //если ок - сервер возвращает защищенные данные
    document.getElementById('protectedData').textContent =
JSON.stringify(result);
 } else { //если нет - отказ в доступе
 document.getElementById('protectedData').textContent = 'Ты не достоин секретной информации';
 }
});

/*
Как работают JWT?
1. Генерация токена:
После успешной аутентификации сервер создает JWT, подписывает его с использованием
секретного ключа и отправляет клиенту.
2. Использование токена:
Клиент сохраняет JWT (например, в localStorage или куках) и отправляет его с каждым
запросом к защищенным ресурсам.
3. Проверка токена:
Сервер проверяет подпись JWT и, если она верна, извлекает данные из полезной нагрузки.
Это позволяет серверу идентифицировать пользователя без необходимости хранения
состояния.
*/
