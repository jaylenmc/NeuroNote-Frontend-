import React, { useState, useEffect } from 'react';
import { Trophy, Star, BookOpen, Users, Calendar, Filter, ChevronDown, Lock, Sparkles, Zap, Target, Medal, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Achievements.css';
import { makeAuthenticatedRequest } from '../utils/api';

const sortOptions = ["Most Recent", "Hardest", "Locked/Unlocked", "Type"];

const Achievements = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSort, setSelectedSort] = useState("Most Recent");
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [levelUpAchievement, setLevelUpAchievement] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Add Night Owl theme class to body
    document.body.classList.add('achievements-root-bg');
    
    const fetchAchievements = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/';
        const response = await makeAuthenticatedRequest(`${apiUrl}achievements/user/?user_achievements=false`);
        if (!response) throw new Error('No response from server');
        if (response.status !== 200) throw new Error(response.data?.message || 'Failed to fetch achievements');
        // Ensure we always set an array
        const achievementsData = Array.isArray(response.data) ? response.data : [];
        setAchievements(achievementsData);
      } catch (err) {
        setError(err.message || 'Failed to fetch achievements');
      } finally {
        setLoading(false);
      }
    };
    fetchAchievements();

    // Cleanup function to remove class when component unmounts
    return () => {
      document.body.classList.remove('achievements-root-bg');
    };
  }, []);

  // Generate categories from achievement families
  const getCategories = () => {
    if (!Array.isArray(achievements)) return ["All", "General"];
    const families = [...new Set(achievements.map(a => a.family).filter(Boolean))];
    return ["All", "General", ...families];
  };

  const categories = getCategories();

  // Filter achievements based on selected category
  const filteredAchievements = !Array.isArray(achievements) ? [] :
    selectedCategory === "All" 
    ? achievements 
    : selectedCategory === "General"
    ? achievements.filter(achievement => !achievement.family || achievement.family === "General")
    : achievements.filter(achievement => achievement.family === selectedCategory);

  const unlockedCount = Array.isArray(achievements) ? achievements.length : 0; // All achievements from backend are considered unlocked for now
  const totalCount = Array.isArray(achievements) ? achievements.length : 0;

  const getCategoryIcon = (category) => {
    switch (category) {
      case "All": return <Trophy size={16} />;
      case "General": return <Star size={16} />;
      case "Flashcards": return <BookOpen size={16} />;
      case "Study Groups": return <Users size={16} />;
      case "Quizzes": return <Target size={16} />;
      case "Consistency": return <Calendar size={16} />;
      default: return <Star size={16} />;
    }
  };

  // Get achievement icon and badge classes
  const getAchievementIcon = (achievement) => {
    const family = achievement.family?.toLowerCase() || '';
    const tier = achievement.tier?.toLowerCase() || '';
    const name = achievement.name?.toLowerCase() || '';
    
    // Map achievement names and families to specific themed icons
    if (name.includes('midnight') || name.includes('night') || name.includes('owl')) {
      return { icon: '🦉', badgeClass: 'general' };
    } else if (name.includes('scholar') || name.includes('study') || name.includes('academic')) {
      return { icon: '🎓', badgeClass: 'general' };
    } else if (name.includes('streak') || name.includes('consistency') || name.includes('daily')) {
      return { icon: '🔥', badgeClass: 'streak' };
    } else if (name.includes('flashcard') || name.includes('deck') || name.includes('card')) {
      return { icon: '📚', badgeClass: 'flashcards' };
    } else if (name.includes('quiz') || name.includes('recall') || name.includes('test')) {
      return { icon: '🎯', badgeClass: 'quiz' };
    } else if (name.includes('group') || name.includes('collaborat') || name.includes('team')) {
      return { icon: '👥', badgeClass: 'study-groups' };
    } else if (name.includes('master') || name.includes('expert') || name.includes('pro')) {
      return { icon: '🏆', badgeClass: 'trophy' };
    } else if (name.includes('speed') || name.includes('fast') || name.includes('quick')) {
      return { icon: '⚡', badgeClass: 'general' };
    } else if (name.includes('memory') || name.includes('remember') || name.includes('retention')) {
      return { icon: '🧠', badgeClass: 'general' };
    } else if (family.includes('streak') || family.includes('consistency')) {
      return { icon: '🔥', badgeClass: 'streak' };
    } else if (family.includes('flashcards') || family.includes('deck')) {
      return { icon: '📚', badgeClass: 'flashcards' };
    } else if (family.includes('quiz') || family.includes('recall')) {
      return { icon: '🎯', badgeClass: 'quiz' };
    } else if (family.includes('study') && family.includes('group')) {
      return { icon: '👥', badgeClass: 'study-groups' };
    } else if (family.includes('general') || !family) {
      return { icon: '⭐', badgeClass: 'general' };
    }
    
    // Default fallback
    return { icon: '🏆', badgeClass: 'trophy' };
  };

  const getTierClass = (tier) => {
    const tierLower = tier?.toLowerCase() || '';
    if (tierLower.includes('bronze')) return 'bronze';
    if (tierLower.includes('silver')) return 'silver';
    if (tierLower.includes('gold')) return 'gold';
    if (tierLower.includes('legend')) return 'legend';
    return '';
  };

  // Level-up animation function
  const triggerLevelUpAnimation = (achievement) => {
    setLevelUpAchievement(achievement.name);
    setShowConfetti(true);
    
    // Remove animation class after animation completes
    setTimeout(() => {
      setLevelUpAchievement(null);
    }, 2000);
    
    // Hide confetti after animation
    setTimeout(() => {
      setShowConfetti(false);
    }, 3000);
  };

  // Create confetti pieces
  const createConfetti = () => {
    if (!showConfetti) return null;
    
    const confettiPieces = [];
    for (let i = 0; i < 50; i++) {
      confettiPieces.push(
        <div
          key={i}
          className="confetti-piece"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${2 + Math.random() * 2}s`
          }}
        />
      );
    }
    
    return (
      <div className="confetti-container">
        {confettiPieces}
      </div>
    );
  };

  // Calculate XP progress for dashboard ring
  const totalXP = 23; // This would come from user data
  const currentLevelXP = totalXP % 100; // Assuming 100 XP per level
  const xpProgress = (currentLevelXP / 100) * 283; // 283 is circumference for radius 45

  return (
    <div className="achievements-page">
      <div className="achievements-content">
        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="back-to-dashboard-btn"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>

        {/* Header Section */}
        <div className="achievements-header">
        <div className="header-gradient-bg" />
        
        <div className="header-title-section">
          <div className="header-icon">🏆</div>
          <div className="header-title-area">
            <h1 className="header-title">Your Achievements</h1>
            <div className="header-subtitle-row">
              <div className="header-subtitle">Memory Architect</div>
              <div className="level-badge">
                <span className="level-badge-icon">⭐</span>
                Level 3
              </div>
            </div>
          </div>
        </div>

        <div className="header-progress-section">
          <div className="progress-section">
            <div className="achievements-progress-ring">
              <svg viewBox="0 0 100 100">
                <circle className="achievements-ring-bg" cx="50" cy="50" r="45" />
                <circle 
                  className="achievements-ring-progress" 
                  cx="50" 
                  cy="50" 
                  r="45"
                  style={{
                    strokeDasharray: `${totalCount ? ((unlockedCount / totalCount) * 283) : 0} 283`
                  }}
                />
              </svg>
              <div className="achievements-ring-center">
                <span className="achievements-progress-value">{unlockedCount}</span>
                <span className="achievements-progress-label">/{totalCount}</span>
              </div>
            </div>
            <div className="progress-label-row">
              <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                <span className="progress-label-icon">🎯</span>
                <div className="progress-label">
                  Achievements Unlocked
                </div>
              </div>
              <div className="progress-subtitle">
                {totalCount > 0 ? `${Math.round((unlockedCount / totalCount) * 100)}% Complete` : 'No achievements yet'}
              </div>
            </div>
          </div>

          <div className="header-stats">
              <div className="dashboard-xp-ring">
                <svg viewBox="0 0 100 100">
                  <circle className="dashboard-xp-ring-bg" cx="50" cy="50" r="45" />
                  <circle 
                    className="dashboard-xp-ring-progress" 
                    cx="50" 
                    cy="50" 
                    r="45"
                    style={{
                      strokeDasharray: `${xpProgress} 283`
                    }}
                  />
                </svg>
                <div className="dashboard-xp-ring-center">
                  <span className="dashboard-xp-level">Level 3</span>
                  <span className="dashboard-xp-points">{totalXP} XP</span>
                </div>
              </div>
          </div>
        </div>
      </div>

      {/* Filter & Sort Bar */}
      <div className="filter-sort-bar">
        <div className="category-filters">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
            >
              {getCategoryIcon(category)}
              {category}
            </button>
          ))}
        </div>
        <div className="sort-menu">
          <button className="sort-btn">
            <Filter size={16} />
            Sort by: {selectedSort}
            <ChevronDown size={16} />
          </button>
        </div>
      </div>

      {/* Achievement Grid */}
      <div className="achievement-grid">
        {loading && <div>Loading achievements...</div>}
        {error && <div style={{color: 'red'}}>Error: {error}</div>}
        {!loading && !error && filteredAchievements.map(achievement => {
          const { icon, badgeClass } = getAchievementIcon(achievement);
          const tierClass = getTierClass(achievement.tier);
          const isLevelUp = levelUpAchievement === achievement.name;
          
          return (
            <div
              key={achievement.name}
              className={`achievement-card unlocked ${isLevelUp ? 'level-up' : ''}`}
              onClick={() => triggerLevelUpAnimation(achievement)}
            >
              <div className="card-bg-glow" />

              <div className="card-content">
                  <div className={`achievement-icon-badge ${badgeClass} ${tierClass}`}>
                    {icon}
                  </div>
                  
                  <div className="card-text-content">
                    <h3 className="card-title">{achievement.name}</h3>
                    <p className="card-description">{achievement.description}</p>
                  </div>

                  <div className="achievement-xp-pill">
                    <Sparkles className="achievement-xp-icon" size={12} />
                    10 XP
                  </div>
              </div>
            </div>
          );
        })}
        </div>
      </div>
      
      {/* Confetti Animation */}
      {createConfetti()}
    </div>
  );
};

export default Achievements; 