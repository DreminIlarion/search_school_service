import React, { useState } from "react";
import styles from "./SearchBar.module.css";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState(null);

  // Обработчик изменения ввода
  const handleSearch = (e) => {
    const inputValue = e.target.value;
    setQuery(inputValue);

    if (inputValue.trim().length > 0) {
      setLoading(true);

      // Имитируем запрос на сервер
      setTimeout(() => {
        const fakeResults = [
          "Школа 1",
          "Школа 2",
          "Школа 3",
          "Школа 4",
          "Школа 5",
          "Школа 6",
          "Школа 7",
          "Школа 8",
          "Школа 9",
          "Школа 10",
        ];

        // Фильтруем результаты
        const filteredResults = fakeResults.filter((school) =>
          school.toLowerCase().includes(inputValue.toLowerCase())
        );

        setSuggestions(filteredResults);
        setLoading(false);
      }, 500);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSelectedSchool(suggestion);
    setQuery("");
    setSuggestions([]);
  };

  const handleBackToSearch = () => {
    setSelectedSchool(null);
  };

  return (
    <div className={styles.container}>
      {/* Заголовок */}
      <h1 className={styles.title}>ТИУ МЕТРИКА</h1>

      {/* Логика отображения поиска или деталей */}
      {selectedSchool ? (
        <div className={styles.details}>
          <h2 className={styles.schoolName}>{selectedSchool}</h2>
          <p className={styles.schoolInfo}>
            Здесь будет отображена дополнительная информация о школе.
          </p>
          <button className={styles.backButton} onClick={handleBackToSearch}>
            Вернуться к поиску
          </button>
        </div>
      ) : (
        <div className={styles.searchBox}>
          <input
            className={styles.input}
            type="text"
            placeholder="Введите название школы..."
            value={query}
            onChange={handleSearch}
          />
          {loading && <div className={styles.loader}></div>}
          {suggestions.length > 0 && (
            <ul className={styles.suggestions}>
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className={styles.suggestion}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
