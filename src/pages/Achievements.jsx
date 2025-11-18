import React, { useState, useEffect, useRef } from 'react';
import { Trophy, Star, BookOpen, Users, Calendar, Filter, ChevronDown, Target, ArrowLeft, Check } from 'lucide-react';
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
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const navigate = useNavigate();
  const sortMenuRef = useRef(null);

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target)) {
        setIsSortMenuOpen(false);
      }
    };

    if (isSortMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSortMenuOpen]);

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
  // Calculate XP progress for dashboard ring
  const totalXP = 23; // This would come from user data
  const currentLevelXP = totalXP % 100; // Assuming 100 XP per level
  const currentLevelPercent = Math.round((currentLevelXP / 100) * 100);
  const xpProgress = (currentLevelXP / 100) * 283; // 283 is circumference for radius 45

  const getAchievementAccent = (badgeClass) => {
    const accent = '#9aa4ff';
    const soft = 'rgba(154, 164, 255, 0.18)';
    return { accent, soft };
  };

  const unlockedPercent = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  const getAchievementProgress = (achievement) => {
    if (!achievement || typeof achievement !== 'object') return null;

    const percentFields = [
      'progress_percentage',
      'progress_percent',
      'percent_complete',
      'completion_percentage'
    ];

    for (const key of percentFields) {
      const rawPercent = achievement[key];
      if (typeof rawPercent === 'number' && !Number.isNaN(rawPercent)) {
        const clamped = Math.max(0, Math.min(100, rawPercent));
        return {
          percent: clamped,
          label: achievement.progress_label || 'Progress',
          value: `${Math.round(clamped)}%`
        };
      }
    }

    const progressObj = achievement.progress ?? {};
    const current =
      achievement.progress_current ??
      achievement.current_progress ??
      progressObj.current ??
      null;
    const total =
      achievement.progress_target ??
      achievement.progress_total ??
      achievement.target_progress ??
      achievement.goal_total ??
      progressObj.total ??
      progressObj.target ??
      null;

    if (
      typeof current === 'number' &&
      typeof total === 'number' &&
      total > 0
    ) {
      const percent = Math.max(0, Math.min(100, (current / total) * 100));
      return {
        percent,
        label: achievement.progress_label || 'Progress',
        value: `${current}/${total}`
      };
    }

    return null;
  };

  const handleSortSelect = (option) => {
    setSelectedSort(option);
    setIsSortMenuOpen(false);
  };

  const rarityLegend = [
    { key: 'rarity-bronze', label: 'Bronze Tier', color: '#B77431', description: 'Entry-level achievements or common milestones.' },
    { key: 'rarity-silver', label: 'Silver Tier', color: '#A6B1C8', description: 'Intermediate achievements that require consistency.' },
    { key: 'rarity-gold', label: 'Gold Tier', color: '#D4A12C', description: 'High-value milestones earned through dedication.' },
    { key: 'rarity-legend', label: 'Legend Tier', color: '#FF5F93', description: 'Rare achievements reserved for exceptional streaks.' }
  ];

  return (
    <div className="achievements-page">
      <button
        onClick={() => navigate('/dashboard')}
        className="back-to-dashboard-btn"
      >
        <ArrowLeft size={20} />
        Back to Dashboard
      </button>
      <div className="achievements-content">
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
                <span className="summary-stat-value">
                  {unlockedCount}
                </span>
                <span className="summary-stat-meta">
                  {totalCount > 0 ? `${unlockedPercent}% complete (${unlockedCount}/${totalCount})` : 'Unlock your first badge to begin.'}
                </span>
              </div>

              <div className="summary-stat">
                <span className="summary-stat-label">Current Level</span>
                <span className="summary-stat-value">
                  Level 3
                  <span className="summary-stat-meta">Memory Architect 🧠</span>
                </span>
              </div>

              <div className="summary-stat">
                <span className="summary-stat-label">Latest Unlock</span>
                <span className="summary-stat-value">
                  {filteredAchievements[0]?.name || '––'}
                  <span className="summary-stat-meta">{filteredAchievements[0]?.family || 'Keep streaking to unlock more.'}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="level-panel">
            <div className="level-ring">
              <div className="level-ring-chart">
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
                <div className="level-ring-percentage">{currentLevelPercent}%</div>
              </div>
              <div className="level-ring-center">
                <span className="summary-stat-meta">{currentLevelXP} / 100 XP</span>
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

          <div
            className="sort-menu-container"
            ref={sortMenuRef}
          >
            <button
              className="sort-pill"
              onClick={() => setIsSortMenuOpen(prev => !prev)}
              aria-haspopup="listbox"
              aria-expanded={isSortMenuOpen}
            >
              <Filter size={16} />
              Sort by: {selectedSort}
              <ChevronDown size={16} />
            </button>
            <div className={`sort-menu ${isSortMenuOpen ? 'open' : ''}`} role="listbox">
              {sortOptions.map(option => (
                <button
                  key={option}
                  role="option"
                  className={`filter-pill sort-option ${selectedSort === option ? 'active' : ''}`}
                  aria-selected={selectedSort === option}
                  onClick={() => handleSortSelect(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>

      {/* Achievement Grid */}
      <div className="achievements-section-heading">
        <span>Unlocked Achievements</span>
        <span className="achievements-section-count">
          {filteredAchievements.length} {filteredAchievements.length === 1 ? 'achievement' : 'achievements'}
        </span>
      </div>
      <div className="achievement-grid">
        <div className="achievement-ribbon-legend" aria-label="Achievement rarity legend">
          <h4>Rarity Guide</h4>
          <div className="achievement-ribbon-legend-items">
            {rarityLegend.map(item => (
              <div className="achievement-ribbon-legend-item" key={item.key}>
                <span
                  className={`achievement-ribbon-legend-swatch ${item.key}`}
                  style={{ backgroundColor: item.color }}
                  aria-hidden="true"
                />
                <div className="achievement-ribbon-legend-copy">
                  <span className="legend-title">{item.label}</span>
                  <span className="legend-description">{item.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {loading && <div>Loading achievements...</div>}
        {error && <div style={{color: 'red'}}>Error: {error}</div>}
        {!loading && !error && filteredAchievements.map(achievement => {
          const { icon, badgeClass } = getAchievementIcon(achievement);
          const tierClass = getTierClass(achievement.tier);
          const categoryClass = badgeClass || 'general';
          const progressInfo = getAchievementProgress(achievement);
          const displayProgress = progressInfo ?? {
            percent: 100,
            label: 'Progress',
            value: 'Completed'
          };
          const rarityClass = tierClass ? `rarity-${tierClass}` : '';

          const styles = getAchievementAccent(categoryClass);
          const cardStyle = {
            '--achievement-accent': styles.accent,
            '--achievement-accent-soft': styles.soft
          };

          return (
            <div
              key={achievement.name}
              className="achievement-card unlocked"
              style={cardStyle}
            >
              {tierClass && (
                <span
                  className={`achievement-ribbon ${rarityClass}`}
                  aria-hidden="true"
                />
              )}
              <div className="achievement-card-header">
                <div className="achievement-card-primary">
                  <div className={`achievement-badge ${categoryClass} ${rarityClass}`}>
                    {icon}
                  </div>
                  <div className="achievement-card-text">
                    <h3 className="achievement-card-title">{achievement.name}</h3>
                    <p className="achievement-card-description">{achievement.description}</p>
                  </div>
                </div>
                <div className="achievement-card-meta">
                  <span className="achievement-xp-chip">+{achievement.xp_value || 10} XP</span>
                  <span className={`achievement-category-chip ${categoryClass}`}>
                    {achievement.family || 'General'}
                  </span>
                </div>
              </div>

              <div className="achievement-progress">
                <div className="achievement-progress-meta">
                  <span className="achievement-progress-label">{displayProgress.label}</span>
                  <span className={`achievement-progress-status ${displayProgress.percent >= 99 ? 'status-complete' : ''}`}>
                    {displayProgress.percent >= 99 ? (
                      <>
                        <Check size={14} strokeWidth={3} />
                        <span>Completed</span>
                      </>
                    ) : (
                      displayProgress.value
                    )}
                  </span>
                </div>
                <div className="achievement-progress-bar">
                  <div
                    className="achievement-progress-fill"
                    style={{ width: `${Math.min(displayProgress.percent, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
        </div>
      </div>
      
    </div>
  );
};

export default Achievements; 