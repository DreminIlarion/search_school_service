import React, { useState } from "react";
import axios from "axios";

import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import styles from "./SearchBar.module.css";

ChartJS.register(ArcElement, Tooltip, Legend);

const SearchBar = () => {

  const [query, setQuery] = useState(""); // Текст запроса
  const [filteredSchools, setFilteredSchools] = useState([]); // Результаты поиска
  const [loading, setLoading] = useState(false); // Индикатор загрузки
  const [selectedSchool, setSelectedSchool] = useState(null); // Выбранная школа
  const [schoolDetails, setSchoolDetails] = useState(null); // Детали школы
  const [schoolMetrics, setSchoolMetrics] = useState(null); // Метрики школы
  const [searchMode, setSearchMode] = useState("name"); // Режим поиска: "name" или "id"






  // Поиск по названию школы
  const handleSearchByName = async (searchQuery) => {
    setQuery(searchQuery);

    if (searchQuery.trim().length === 0) {
      setFilteredSchools([]);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `https://tyuiu-schools-metrics-service-production.up.railway.app/api/v1/schools/search/`,
        {
          params: { q: searchQuery },
        }
      );
      setFilteredSchools(response.data.data.schools || []);
    } catch (error) {
      console.error("Ошибка при поиске школ:", error);
      setFilteredSchools([]);
    } finally {
      setLoading(false);
    }
  };

  // Поиск по ID школы
  const handleSearchById = async (searchQuery) => {
    setQuery(searchQuery);

    if (searchQuery.trim().length === 0) {
      setFilteredSchools([]);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `https://tyuiu-schools-metrics-service-production.up.railway.app/api/v1/schools/get/schools/${searchQuery}`
      );
      setFilteredSchools([response.data.data.school]); // Мы возвращаем только одну школу по ID
    } catch (error) {
      console.error("Ошибка при поиске школы по ID:", error);
      setFilteredSchools([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchQuery) => {
    if (searchMode === "name") {
      handleSearchByName(searchQuery);
    } else if (searchMode === "id") {
      handleSearchById(searchQuery);
    }
  };


  // Выбор школы из списка
  const handleSuggestionClick = async (suggestion) => {
    setSelectedSchool(suggestion.name);
    setQuery("");

    try {
      const schoolResponse = await axios.get(
        `https://tyuiu-schools-metrics-service-production.up.railway.app/api/v1/schools/get/schools/${suggestion.id}`
      );
      setSchoolDetails(schoolResponse.data.data.school);

      const metricsResponse = await axios.get(
        `https://tyuiu-schools-metrics-service-production.up.railway.app/api/v1/metrics/school/${suggestion.id}`
      );
      setSchoolMetrics(metricsResponse.data.data.metrics);
    } catch (error) {
      console.error("Ошибка загрузки данных о школе или метриках:", error);
      setSchoolDetails(null);
      setSchoolMetrics(null);
    }
  };

  const handleBackToSearch = () => {
    setSelectedSchool(null); // Сброс выбранной школы
    setSchoolDetails(null); // Сброс деталей школы
    setSchoolMetrics(null); // Сброс метрик школы
    setFilteredSchools([]); // Очистка списка найденных школ
  };
  const toggleSearchMode = () => {
    setSearchMode((prevMode) => (prevMode === "name" ? "id" : "name"));
  };



  return (
    
    <div className={styles.container}>
      <span><h1 className={styles.title}>ТИУ МЕТРИКА</h1></span>

      {/* Переключатель между режимами поиска */}
      
      <button className={styles.restButton} onClick={toggleSearchMode}>
        Переключить на поиск по {searchMode === "name" ? "ID" : "названию"}
      </button>

      {selectedSchool ? (
        <div className={styles.details}>
          <h2 className={styles.schoolName}>{schoolDetails?.name || "Школа"}</h2>
          <p className={styles.schoolInfo}>ID: {schoolDetails?.id || "—"}</p>
          {schoolMetrics && (
            <div className={styles.metrics}>
              <p>Количество абитуриентов: {schoolMetrics.applicants_count}</p>
              <p>Количество поступивших: {schoolMetrics.students_count}</p>
              <p>Средний балл аттестата: {schoolMetrics.avg_gpa}</p>
              <p>Средний балл ЕГЭ: {schoolMetrics.avg_score}</p>
              <p>Количество олимпиадников: {schoolMetrics.olympiads_count}</p>

              {/* График */}
              <h3>Половой состав абитуриентов:</h3>
              {schoolMetrics?.genders_count ? (
                <Pie
                  data={{
                    labels: schoolMetrics.genders_count.map(([gender]) =>
                      gender === "Ж" ? "Женщины" : "Мужчины"
                    ),
                    datasets: [
                      {
                        data: schoolMetrics.genders_count.map(([_, count]) => count),
                        backgroundColor: ["#FF6384", "#36A2EB"],
                        hoverBackgroundColor: ["#FF6384", "#36A2EB"],
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: "top",
                      },
                    },
                  }}
                />
              ) : (
                <p>Данные о половой структуре отсутствуют.</p>
              )}

              <h3>Популярные университеты среди выпускников:</h3>
              <ul>
                {schoolMetrics.top_universities.map(([university, count], index) => (
                  <li key={index}>
                    {university} ({count})
                  </li>
                ))}
              </ul>
              <h3>Популярные направления среди выпускников:</h3>
              <ul>
                {schoolMetrics.top_directions.map(([direction, count], index) => (
                  <li key={index}>
                    {direction} ({count})
                  </li>
                ))}
              </ul>
            </div>
          )}
          <button className={styles.backButton} onClick={handleBackToSearch}>
            Вернуться к поиску
          </button>
        </div>
      ) : (
        <div className={styles.searchBox}>
          <input
            className={styles.input}
            type="text"
            placeholder={searchMode === "name" ? "Введите название школы..." : "Введите ID школы..."}
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
          />
          {loading && <div className={styles.loader}></div>}
          {filteredSchools.length > 0 && (
            <ul className={styles.suggestions}>
              {filteredSchools.map((suggestion) => (
                <li
                  key={suggestion.id}
                  className={styles.suggestion}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion.name}
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
