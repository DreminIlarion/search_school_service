import React, { useEffect, useState } from "react";
import axios from "axios";

const VKAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Получить ссылку для авторизации ВК
  const getVKLink = async () => {
    try {
      const response = await axios.get("https://registration-fastapi.onrender.com/vk/link");
      if (response.data) {
        window.location.href = response.data; // Перенаправляем пользователя на VK
      } else {
        console.error("Не удалось получить ссылку авторизации.");
      }
    } catch (error) {
      console.error("Ошибка при получении ссылки авторизации:", error);
    }
  };

  // Обработка редиректа после авторизации
  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const fullCode = urlParams.get("code");

      if (fullCode) {
        const code = fullCode.split("&")[0];
        console.log("Извлеченный code:", code);

        try {
          // Пытаемся выполнить вход через ВК
          const loginResponse = await axios.get(
            `https://registration-fastapi.onrender.com/vk/login?code=${code}`,
            { withCredentials: true }
          );

          if (loginResponse.status === 200) {
            console.log("Пользователь успешно вошел:", loginResponse.data);
            setIsLoggedIn(true);

            // Редирект после успешного входа
            window.location.href = "/welcome"; // Измените на нужный путь
            return;
          }
        } catch (error) {
          console.log("Пользователь не найден. Регистрация...");
        }

        try {
          // Если пользователь не найден, выполняем регистрацию
          const registrationResponse = await axios.get(
            `https://registration-fastapi.onrender.com/vk/registration?code=${code}`,
            { withCredentials: true }
          );

          if (registrationResponse.status === 200) {
            console.log("Пользователь успешно зарегистрирован:", registrationResponse.data);
            setIsLoggedIn(true);

            // Редирект после успешной регистрации
            window.location.href = "/welcome"; // Измените на нужный путь
          }
        } catch (error) {
          console.error("Ошибка при регистрации пользователя:", error);
        }
      }
    };

    handleCallback();
  }, []);

  return (
    <div>
      <h1>Авторизация через ВКонтакте</h1>
      {!isLoggedIn ? (
        <button onClick={getVKLink}>Войти через ВКонтакте</button>
      ) : (
        <div>
          <h2>Добро пожаловать!</h2>
          <p>Вы успешно вошли в систему.</p>
        </div>
      )}
    </div>
  );
};

export default VKAuth;
