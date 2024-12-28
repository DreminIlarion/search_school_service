import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { Link } from "react-router-dom";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import styles2 from "./TopSchoolsPage.module.css";
import styles from "./SearchBar.module.css";
import Navbar from "./Navbar.jsx";

ChartJS.register(ArcElement, Tooltip, Legend);

const TopSchoolsPage = () => {
  const [data, setData] = useState({
    byCount: [],
    byScore: [],
    byGpa: [],
    byStudents: [],
  });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [schoolDetails, setSchoolDetails] = useState(null);
  const [schoolMetrics, setSchoolMetrics] = useState(null);
  const [showMetrics, setShowMetrics] = useState(false);
  const [students, setStudents] = useState([]);
    const [studentData, setSelectedStudent] = useState(null);
    const [directionsData, setDirections] = useState([]);
    const [isStudentListVisible, setStudentListVisible] = useState(false);

  const fetchData = async (endpoint) => {
    try {
      const response = await fetch(
        `https://tyuiu-schools-metrics-service-production.up.railway.app/api/v1/schools/top/${endpoint}/5/`
      );
      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
      }
      const result = await response.json();
      return result.data.schools || [];
    } catch (err) {
      console.error(`Ошибка загрузки ${endpoint}:`, err);
      setError(`Не удалось загрузить данные для ${endpoint}`);
      return [];
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
  


  const handleSchoolClick = async (school) => {
    setSelectedSchool(school.name);
    setShowMetrics(true);
    try {
      const schoolResponse = await axios.get(
        `https://tyuiu-schools-metrics-service-production.up.railway.app/api/v1/schools/${school.id}`
      );
      setSchoolDetails(schoolResponse.data.data.school);

      const metricsResponse = await axios.get(
        `https://tyuiu-schools-metrics-service-production.up.railway.app/api/v1/metrics/schools/${school.id}`
      );
      
      setSchoolMetrics(metricsResponse.data.data.metrics);
    } catch (error) {
      console.error("Ошибка загрузки данных о школе или метриках:", error);
      setSchoolDetails(null);
      setSchoolMetrics(null);
    }
  };

  const handleBackClick = () => {
    setShowMetrics(false);
    setSelectedSchool(null);
    setSchoolDetails(null);
    setSchoolMetrics(null);
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [byCount, byScore, byGpa, byStudents] = await Promise.all([
          fetchData("count"),
          fetchData("score"),
          fetchData("gpa"),
          fetchData("students"),
        ]);
        setData({ byCount, byScore, byGpa, byStudents });
      } catch (err) {
        console.error("Ошибка загрузки данных:", err);
        setError("Не удалось загрузить данные.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  return (
    <div className={styles.container}>
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
      
      {error && <p className={styles.error}>{error}</p>}
      {loading && <p className={styles.loading}>Загрузка...</p>}

      {!showMetrics ? (
        <div className={styles2.blocks}>
          <div className={styles2.block}>
            <h2>По абитуриентам</h2>
            <table className={styles2.dataTable}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Название</th>
                  <th>Количество</th>
                </tr>
              </thead>
              <tbody>
                {data.byCount.map((school) => (
                  <tr key={school.id} onClick={() => handleSchoolClick(school)}>
                    <td className={styles2.schoolId}>{school.id}</td>
                    <td className={styles2.schoolName}>{school.name}</td>
                    <td className={styles2.schoolCount}>{school.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles2.block}>
            <h2>По баллам</h2>
            <table className={styles2.dataTable}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Название</th>
                  <th>Баллы</th>
                </tr>
              </thead>
              <tbody>
                {data.byScore.map((school) => (
                  <tr key={school.id} onClick={() => handleSchoolClick(school)}>
                    <td className={styles2.schoolId}>{school.id}</td>
                    <td className={styles2.schoolName}>{school.name}</td>
                    <td className={styles2.schoolScore}>{Math.round(school.score)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles2.block}>
            <h2>По GPA</h2>
            <table className={styles2.dataTable}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Название</th>
                  <th>GPA</th>
                </tr>
              </thead>
              <tbody>
                {data.byGpa.map((school) => (
                  <tr key={school.id} onClick={() => handleSchoolClick(school)}>
                    <td className={styles2.schoolId}>{school.id}</td>
                    <td className={styles2.schoolName}>{school.name}</td>
                    <td className={styles2.schoolGpa}>{(school.gpa).toFixed(3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles2.block}>
            <h2>По студентам</h2>
            <table className={styles2.dataTable}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Название</th>
                  <th>Количество</th>
                </tr>
              </thead>
              <tbody>
                {data.byStudents.map((school) => (
                  <tr key={school.id} onClick={() => handleSchoolClick(school)}>
                    <td className={styles2.schoolId}>{school.id}</td>
                    <td className={styles2.schoolName}>{school.name}</td>
                    <td className={styles2.schoolStudents}>{school.students}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className={styles2.metricsContainer}>
  <button className={styles2.backButton} onClick={handleBackClick}>
    ← Назад
  </button>
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

export default TopSchoolsPage;
