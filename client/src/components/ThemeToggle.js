import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import '../App.css';

export default function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useTheme();
  const { language, toggleLanguage } = useLanguage();

  return (
    <div className="theme-controls">
      <button 
        className="theme-toggle-btn"
        onClick={toggleTheme}
        title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {isDarkMode ? '🌙' : '☀️'}
      </button>
      
      <button 
        className="language-toggle-btn"
        onClick={toggleLanguage}
        title={language === 'en' ? 'Switch to Hindi' : 'Switch to English'}
      >
        {language === 'hi' ? 'हिं' : 'EN'}
      </button>
    </div>
  );
}