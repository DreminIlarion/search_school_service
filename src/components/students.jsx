import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation,useNavigate  } from "react-router-dom";
import styles from './Students.module.css'; // Импортируем стили CSS

const StudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [directions, setDirections] = useState([]);

  const [showScrollToTop, setShowScrollToTop] = useState(false); // Для отображения кнопки "Наверх"

  const [showDetails, setShowDetails] = useState(false); // Состояние для показа/скрытия данных студента
  const location = useLocation();
  const navigate = useNavigate(); // Инициализируем useNavigate
  useEffect(() => {
    if (location.state) {
      if (location.state.students) {
        setStudents(location.state.students);
      } else {
        console.error("Данные студентов не переданы");
      }

      if (location.state.directions) {
        setDirections(location.state.directions);
      }
    }
  }, [location]);

  const handleScroll = () => {
    if (window.scrollY > 200) {
      setShowScrollToTop(true);
    } else {
      setShowScrollToTop(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };


  const handleSelectStudent = (studentId) => {
    // Запрос данных студента и его направлений
    axios
      .get(`https://tyuiu-schools-metrics-service-production.up.railway.app/api/v1/applicants/${studentId}/`)
      .then((response) => {
        setSelectedStudent(response.data.data.applicant);
        return axios.get(
          `https://tyuiu-schools-metrics-service-production.up.railway.app/api/v1/applicants/${studentId}/directions/`
        );
      })
      .then((directionsResponse) => {
        setDirections(directionsResponse.data.data.directions || []);
        setShowDetails(true); // Открываем блок с данными студента
        setTimeout(() => {
          window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: "smooth",
          });
        }, 500); // Устанавливаем таймаут для прокрутки
      })
      .catch((error) => console.error("Ошибка загрузки данных студента:", error));
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Список студентов</h2>

      <button 
        className={styles.backButton}
        onClick={() => navigate(-1)} // Возвращаемся на предыдущую страницу
      >
        Вернуться назад
      </button>

      {students.length > 0 ? (
        <ul  className={styles.studentList} >
          {students.map((student) => (
            <li
              key={student.id}
              onClick={() => handleSelectStudent(student.id)}
              className={styles.studentItem}
              
            >
              <p>
                {student.full_name} ({student.gender}) - GPA: {student.gpa}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p>Нет данных о студентах</p>
      )}

      {selectedStudent && showDetails && (
        <div className={styles.studentDetails} >
          <h2>Данные студента</h2>
          <div className={styles.studentInfo} >
            <p><strong>ФИО:</strong> {selectedStudent.full_name}</p>
            <p><strong>Пол:</strong> {selectedStudent.gender}</p>
            <p><strong>Дата рождения:</strong> {selectedStudent.bdate}</p>
            <p><strong>Средний балл аттестата:</strong> {selectedStudent.gpa}</p>
            <p><strong>Средний балл ЕГЭ:</strong> {selectedStudent.score}</p>
          </div>

          <h3>Направления:</h3>
          <ul className={styles.directionsList}  >
            {directions.length > 0 ? (
              directions.map((direction, index) => (
                <li key={index} className={styles.directionItem} >
                  <p>{direction.direction} ({direction.university})</p>
                </li>
              ))
            ) : (
              <p>Нет направлений</p>
            )}
          </ul>
        </div>
      )}


{showScrollToTop && (
        <button className={styles.scrollToTopButton} onClick={scrollToTop}>
          ↑ 
        </button>
      )}


    </div>
  );
};

export default StudentsPage;
