import React from 'react';
import Form from './components/search';
import Top from './components/top_home';
import Students from './components/students';
import About from './components/vhod';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import styles from "./components/SearchBar.module.css";

const App = () => {
  return (
    
    <Router>
     
      
     <div   className={styles.container}>
        <Routes>  
        <Route path="/about" element={<About />}/>  
            <Route path="/students" element={<Students />}/>
            <Route path="/search" element={<Form />}/>
            <Route path="/" element={<Top />}/>
            
        </Routes> 
        </div>
    </Router>
    
  );
};

export default App;
