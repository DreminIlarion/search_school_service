import React, { useState, useEffect } from "react";
import axios from "axios";
import Fuse from "fuse.js";
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
  
  const [query, setQuery] = useState("");
  const [allSchools, setAllSchools] = useState([]);
  const [filteredSchools, setFilteredSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [schoolDetails, setSchoolDetails] = useState(null);
  const [schoolMetrics, setSchoolMetrics] = useState(null);
  const [fuse, setFuse] = useState(null);

  
  

  // Загрузка всех школ при монтировании
  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const response = await axios.get(
          "https://tyuiu-schools-metrics-service-production.up.railway.app/api/v1/schools/get/schools/"
        );
        const schools = response.data.data.schools || [];
        setAllSchools(schools);

        const fuseInstance = new Fuse(schools, {
          keys: ["name", "city"],
          threshold: 0.3,
        });
        setFuse(fuseInstance);
      } catch (error) {
        console.error("Ошибка при загрузке списка школ:", error.response?.status, error.response?.data);
      } finally {
        setLoading(false);
      }
    };

    fetchSchools();
  }, []);

  // Обновление списка школ при вводе запроса
  useEffect(() => {
    if (query.trim().length > 0 && fuse) {
      const results = fuse.search(query);
      setFilteredSchools(results.map((result) => result.item));
    } else {
      setFilteredSchools([]);
    }
  }, [query, fuse]);

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
    setSelectedSchool(null);
    setSchoolDetails(null);
    setSchoolMetrics(null);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>ТИУ МЕТРИКА</h1>
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
            placeholder="Введите название школы..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
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
