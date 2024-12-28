import styles from "./SearchBar.module.css";
import { Link } from 'react-router-dom';
const Navbar = () => {
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
};
export default Navbar;