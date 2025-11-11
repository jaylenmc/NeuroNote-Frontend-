import React, { useState, useEffect } from 'react';
import { Trophy, Star, BookOpen, Users, Calendar, Filter, ChevronDown, Target, ArrowLeft } from 'lucide-react';
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

  const getAchievementAccent = (badgeClass) => {
    switch (badgeClass) {
      case 'streak':
        return { accent: '#f87171', soft: 'rgba(248, 113, 113, 0.16)' };
      case 'flashcards':
        return { accent: '#a78bfa', soft: 'rgba(167, 139, 250, 0.18)' };
      case 'quiz':
        return { accent: '#fbbf24', soft: 'rgba(251, 191, 36, 0.16)' };
      case 'study-groups':
        return { accent: '#60a5fa', soft: 'rgba(96, 165, 250, 0.18)' };
      case 'general':
        return { accent: '#34d399', soft: 'rgba(52, 211, 153, 0.14)' };
      default:
        return { accent: '#a855f7', soft: 'rgba(168, 85, 247, 0.18)' };
    }
  };

  const unlockedPercent = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

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

        {/* Summary Section */}
        <div className="achievements-summary-grid">
          <div className="summary-panel">
            <div className="summary-heading">
              <span className="summary-icon">🏆</span>
              <div>
                <h1 className="summary-title">Your Achievements</h1>
                <p className="summary-subtitle">Track your mastery journey across study sessions.</p>
              </div>
            </div>

            <div className="summary-stat-grid">
              <div className="summary-stat">
                <span className="summary-stat-label">Achievements Unlocked</span>
                <span className="summary-stat-value">{unlockedCount}</span>
                <span className="summary-stat-meta">
                  {totalCount > 0 ? `${unlockedPercent}% complete (${unlockedCount}/${totalCount})` : 'Unlock your first badge to begin.'}
                </span>
              </div>

              <div className="summary-stat">
                <span className="summary-stat-label">Current Level</span>
                <span className="summary-stat-value">Level 3</span>
                <span className="summary-stat-meta">Memory Architect 🧠</span>
              </div>

              <div className="summary-stat">
                <span className="summary-stat-label">Latest Unlock</span>
                <span className="summary-stat-value">{filteredAchievements[0]?.name || '––'}</span>
                <span className="summary-stat-meta">{filteredAchievements[0]?.family || 'Keep streaking to unlock more.'}</span>
              </div>
            </div>
          </div>

          <div className="level-panel">
            <div className="level-ring">
              <svg viewBox="0 0 100 100">
                <circle className="level-ring-bg" cx="50" cy="50" r="45" />
                <circle
                  className="level-ring-progress"
                  cx="50"
                  cy="50"
                  r="45"
                  style={{
                    strokeDasharray: `${xpProgress} 283`
                  }}
                />
              </svg>
              <div className="level-ring-center">
                <span className="summary-stat-value" style={{ fontSize: '1.35rem' }}>{currentLevelXP}</span>
                <span className="summary-stat-meta">/ 100 XP</span>
              </div>
            </div>

            <div className="level-details">
              <span className="level-chip">Level 3</span>
              <h2 className="level-title">Memory Architect</h2>
              <p className="level-subtitle">
                {totalCount > 0 ? `${100 - currentLevelXP} XP until your next mastery badge.` : 'Start unlocking achievements to climb the ranks.'}
              </p>
            </div>
          </div>
        </div>

        {/* Filter & Sort Bar */}
        <div className="filters-bar">
          <div className="filter-pill-group">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`filter-pill ${selectedCategory === category ? 'active' : ''}`}
              >
                {getCategoryIcon(category)}
                {category}
              </button>
            ))}
          </div>

          <button className="sort-pill">
            <Filter size={16} />
            Sort by: {selectedSort}
            <ChevronDown size={16} />
          </button>
        </div>

      {/* Achievement Grid */}
      <div className="achievement-grid">
        {loading && <div>Loading achievements...</div>}
        {error && <div style={{color: 'red'}}>Error: {error}</div>}
        {!loading && !error && filteredAchievements.map(achievement => {
          const { icon, badgeClass } = getAchievementIcon(achievement);
          const tierClass = getTierClass(achievement.tier);
          const isLevelUp = levelUpAchievement === achievement.name;
          const categoryClass = badgeClass || 'general';

          const styles = getAchievementAccent(categoryClass);
          const cardStyle = {
            '--achievement-accent': styles.accent,
            '--achievement-accent-soft': styles.soft
          };

          return (
            <div
              key={achievement.name}
              className={`achievement-card unlocked ${isLevelUp ? 'level-up' : ''}`}
              style={cardStyle}
              onClick={() => triggerLevelUpAnimation(achievement)}
            >
              <div className="achievement-card-header">
                <div className={`achievement-badge ${categoryClass} ${tierClass}`}>
                  {icon}
                </div>
                <div className="achievement-card-body">
                  <h3 className="achievement-card-title">{achievement.name}</h3>
                  <p className="achievement-card-description">{achievement.description}</p>
                </div>
              </div>

              <div className="achievement-card-footer">
                <span className="achievement-xp-chip">+{achievement.xp_value || 10} XP</span>
                <span className={`achievement-category-chip ${categoryClass}`}>
                  {achievement.family || 'General'}
                </span>
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