import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { FaSearch } from "react-icons/fa"; // Иконка поиска
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import styles from "./SearchBar.module.css";
import styles2 from "./TopSchoolsPage.module.css";
import { Link } from 'react-router-dom';

ChartJS.register(ArcElement, Tooltip, Legend);

const SearchBar = () => {
  const [query, setQuery] = useState(""); // Текст запроса
  const [filteredSchools, setFilteredSchools] = useState([]); // Результаты поиска
  const [loading, setLoading] = useState(false); // Индикатор загрузки
  const [selectedSchool, setSelectedSchool] = useState(null); // Выбранная школа
  const [schoolDetails, setSchoolDetails] = useState(null); // Детали школы
  const [schoolMetrics, setSchoolMetrics] = useState(null); // Метрики школы
  const [isSuggestionsVisible, setIsSuggestionsVisible] = useState(false); // Видимость списка предложений
  const [filter,  setFilter] = useState("name"); // Выбранный фильтр
  
  const navigate = useNavigate();

  const [error, setError] = useState("");

  const [showMetrics, setShowMetrics] = useState(false);
  const [students, setStudents] = useState([]);
    const [studentData, setSelectedStudent] = useState(null);
    const [directionsData, setDirections] = useState([]);
    const [isStudentListVisible, setStudentListVisible] = useState(false);

  const suggestionsRef = useRef(null); // Для отслеживания кликов вне списка предложений

  // Обработка клика вне списка предложений
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setIsSuggestionsVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Поиск по названию школы
  const handleSearchByName = async (searchQuery) => {
    setQuery(searchQuery);

    if (searchQuery.trim().length === 0) {
      setFilteredSchools([]);
      setIsSuggestionsVisible(false);
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
      setIsSuggestionsVisible(true);
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
      setIsSuggestionsVisible(false);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `https://tyuiu-schools-metrics-service-production.up.railway.app/api/v1/schools/${searchQuery}`
      );
      setFilteredSchools([response.data.data.school]); // Одна школа по ID
      setIsSuggestionsVisible(true);
    } catch (error) {
      console.error("Ошибка при поиске школы по ID:", error);
      setFilteredSchools([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchQuery) => {
    if (filter === "name") {
      handleSearchByName(searchQuery);
    } else if (filter === "id") {
      handleSearchById(searchQuery);
    }
  };

  const handleShowStudents = async (school) => {
    if (!school?.id) {
      console.error("Некорректный school.id");
      return;
    }
    try {
      const response = await axios.get(
        `https://tyuiu-schools-metrics-service-production.up.railway.app/api/v1/applicants/schools/${school.id}/`
      );
      setStudents(response.data.data.applicants || []);
      navigate('/students', { state: { students: response.data.data.applicants } });
    } catch (error) {
      console.error("Ошибка загрузки списка студентов:", error);
    }
  };
  

  const handleSelectStudent = async (studentId) => {
    
    
    

    try {
      // Запрос данных студента
      const studentResponse = await axios.get(
        `https://tyuiu-schools-metrics-service-production.up.railway.app/api/v1/applicants/${studentId}/`
      );
      
      const studentData = studentResponse.data.data.applicant;
      
      setSelectedStudent(studentData);
  
      // Запрос направлений студента
      const directionsResponse = await axios.get(
        `https://tyuiu-schools-metrics-service-production.up.railway.app/api/v1/applicants/${studentId}/directions/`
      );
      
        
        const directionsData = directionsResponse.data.data.directions || [];
        setDirections(directionsData);
        navigate('/students', {
            state: { student: studentData, directions: directionsData }
          });
      
    } catch (error) {
      console.error("Ошибка загрузки данных студента:", error);
      setSelectedStudent();
      setDirections([]);
    }
    console.log("Данные студента:", studentData);
    console.log("Направления студента:", directionsData);
    
    
  };

  // Выбор школы из списка
  const handleSuggestionClick = async (suggestion) => {
    setSelectedSchool(suggestion.name);
    setQuery("");
    setIsSuggestionsVisible(false);

    try {
      const schoolResponse = await axios.get(
        `https://tyuiu-schools-metrics-service-production.up.railway.app/api/v1/schools/${suggestion.id}`
      );
      setSchoolDetails(schoolResponse.data.data.school);

      const metricsResponse = await axios.get(
        `https://tyuiu-schools-metrics-service-production.up.railway.app/api/v1/metrics/schools/${suggestion.id}`
      );
      setSchoolMetrics(metricsResponse.data.data.metrics);
    } catch (error) {
      console.error("Ошибка загрузки данных о школе или метриках:", error);
      setSchoolDetails(null);
      setSchoolMetrics(null);
    }
  };

  const toggleSearchMode = () => {
    setFilter((prevMode) => (prevMode === "name" ? "id" : "name" ));

  };

  return (
    <div className={styles.container}>

      

      {/* Навигационная панель */}
      
        <nav className={styles.navbar}>
        <h1 className={styles.title}>ТИУ МЕТРИКА</h1>
        <ul className={styles.navList}>
        <li className={styles.navItem}>
            
            <Link to="/about" className={styles.navLink}>О нас</Link>
          </li>
          <li className={styles.navItem}>
            <Link to="/search" className={styles.navLink}>Поиск</Link>
          </li>
          <li className={styles.navItem}>
            <Link to="/" className={styles.navLink}>Главная</Link>
          </li>
          <li className={styles.navItem}>
            <Link to="/support" className={styles.navLink}>Поддержка</Link>
          </li>
        </ul>
      </nav>
      

      


      <div className={styles.searchBox}>
        <div className={styles.searchContainer}>
          {/* Поле ввода для поиска */}
          <FaSearch className={styles.searchIcon} />
          <input
            className={styles.input}
            type="text"
            placeholder={
              filter === "name"
                ? "Поиск "
                : "Поиск "

            }
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
          />

          {/* Селектор фильтрации */}
          
          <select
            
            className={styles.filter}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            title="Фильтрация"
          >
              
            <option value="name" onClick={toggleSearchMode} >Название</option>
            <option value="id" onClick={toggleSearchMode}>ID</option>

            {/* Будущие фильтры можно легко добавить сюда */}
          </select>
          
        
        </div>
        
        {isSuggestionsVisible && (
          <ul ref={suggestionsRef} className={styles.suggestions}>
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


      {selectedSchool && schoolDetails && (
          <div className={styles2.metricsContainer}>
          
          <h3 className={styles2.schoolName}>
            {schoolDetails?.name || "Школа"}
          </h3>
          <p className={styles2.schoolInfo}>ID: {schoolDetails?.id || "—"}</p>
          {schoolMetrics ? (
            <div className={styles2.metricsBlock}>
              <div className={styles2.metricsGrid}>
                <div className={styles2.metricCard}>
                  <h4>Количество абитуриентов</h4>
                  <p>{schoolMetrics.applicants_count || "—"}</p>
                </div>
                <div className={styles2.metricCard}>
                  <h4>Количество поступивших</h4>
                  <p>{schoolMetrics.students_count || "—"}</p>
                </div>
                <div className={styles2.metricCard}>
                  <h4>Средний балл аттестата</h4>
                  <p>{schoolMetrics.avg_gpa || "—"}</p>
                </div>
                <div className={styles2.metricCard}>
                  <h4>Средний балл ЕГЭ</h4>
                  <p>{schoolMetrics.avg_score || "—"}</p>
                </div>
                <div className={styles2.metricCard}>
                  <h4>Количество олимпиадников</h4>
                  <p>{schoolMetrics.olympiads_count || "—"}</p>
                </div>
              </div>
              <div className={styles2.pieChartSection}>
                <h3>Половой состав абитуриентов</h3>
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
              </div>
              <div className={styles2.listsSection}>
                <div>
                  <h3>Популярные университеты среди выпускников</h3>
                  <ul>
                    {schoolMetrics.top_universities.map(([university, count], index) => (
                      <li key={index}>
                        {university} ({count})
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3>Популярные направления среди выпускников</h3>
                  <ul>
                    {schoolMetrics.top_directions.map(([direction, count], index) => (
                      <li key={index}>
                        {direction} ({count})
                      </li>
                    ))}
                  </ul>

                  
                </div>
                
              </div>
              <button
                  className={styles2.showStudentsButton}
                  onClick={() => handleShowStudents(schoolDetails)}
                  >
                  Показать студентов
                  </button>
            </div>
                    ) : (
                      <p>Загрузка...</p>
                    )}
                  </div>
          )}
        </div>
     
    
  );
};

export default SearchBar;
