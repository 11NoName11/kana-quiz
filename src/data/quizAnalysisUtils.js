/**
 * Quiz Analysis Utilities
 * Fungsi-fungsi untuk menganalisis hasil quiz real-time
 */
import { kanaDictionary } from './kanaDictionary';

/**
 * Calculate accuracy percentage
 */
export const calculateAccuracy = (correct, total) => {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
};

/**
 * Get evaluation message based on accuracy
 * 90–100% → "Sudah Lancar"
 * 70–89% → "Cukup Bagus"
 * 50–69% → "Perlu Latihan"
 * <50% → "Harus Diulang"
 */
export const getEvaluationMessage = (accuracy) => {
  if (accuracy >= 90) {
    return { message: 'Sudah Lancar', level: 'excellent' };
  } else if (accuracy >= 70) {
    return { message: 'Cukup Bagus', level: 'good' };
  } else if (accuracy >= 50) {
    return { message: 'Perlu Latihan', level: 'fair' };
  } else {
    return { message: 'Harus Diulang', level: 'poor' };
  }
};

/**
 * Get all kana from selected groups in kanaDictionary
 * Auto-detects hiragana vs katakana from group names
 * Returns: object with kana stats initialized to 0
 */
const getAllKanaFromGroups = (decidedGroups) => {
  const allKana = {};

  if (!decidedGroups || decidedGroups.length === 0) {
    return allKana;
  }

  // Determine which script types are used
  const hasHiragana = decidedGroups.some(g => g.startsWith('h_'));
  const hasKatakana = decidedGroups.some(g => g.startsWith('k_'));

  // Collect kana from hiragana groups
  if (hasHiragana) {
    const hiraganaData = kanaDictionary.hiragana;
    decidedGroups.forEach((groupName) => {
      if (groupName.startsWith('h_') && hiraganaData[groupName] && hiraganaData[groupName].characters) {
        const groupCharacters = hiraganaData[groupName].characters;
        Object.keys(groupCharacters).forEach((kana) => {
          if (!allKana[kana]) {
            allKana[kana] = { correct: 0, wrong: 0, total: 0, accuracy: 0 };
          }
        });
      }
    });
  }

  // Collect kana from katakana groups
  if (hasKatakana) {
    const katakanaData = kanaDictionary.katakana;
    decidedGroups.forEach((groupName) => {
      if (groupName.startsWith('k_') && katakanaData[groupName] && katakanaData[groupName].characters) {
        const groupCharacters = katakanaData[groupName].characters;
        Object.keys(groupCharacters).forEach((kana) => {
          if (!allKana[kana]) {
            allKana[kana] = { correct: 0, wrong: 0, total: 0, accuracy: 0 };
          }
        });
      }
    });
  }

  return allKana;
};

/**
 * Calculate per-kana statistics
 * Returns: { kana: { correct, wrong, total, accuracy } }
 */
export const calculateKanaStats = (answerHistory, allKana = {}) => {
  const stats = { ...allKana }; // Initialize with all kana

  answerHistory.forEach((entry) => {
    const { kanaList, isCorrect } = entry;

    // Untuk level 4 & 5, kanaList adalah array
    if (Array.isArray(kanaList)) {
      kanaList.forEach((kana) => {
        if (!stats[kana]) {
          stats[kana] = { correct: 0, wrong: 0, total: 0 };
        }

        stats[kana].total += 1;

        if (isCorrect) {
          stats[kana].correct += 1;
        } else {
          stats[kana].wrong += 1;
        }
      });
    }
  });

  // Add accuracy untuk setiap kana
  Object.keys(stats).forEach((kana) => {
    stats[kana].accuracy = calculateAccuracy(stats[kana].correct, stats[kana].total);
  });

  return stats;
};

/**
 * Get most difficult characters (sering salah)
 */
export const getMostDifficultChars = (kanaStats, limit = 5) => {
  return Object.entries(kanaStats)
    .sort((a, b) => {
      const aErrorRate = b[1].wrong / b[1].total;
      const bErrorRate = a[1].wrong / a[1].total;
      return aErrorRate - bErrorRate;
    })
    .slice(0, limit)
    .map(([kana, stats]) => ({
      kana,
      ...stats,
      errorRate: Math.round((stats.wrong / stats.total) * 100)
    }));
};

/**
 * Get mastered characters (100% correct)
 */
export const getMasteredChars = (kanaStats) => {
  return Object.entries(kanaStats)
    .filter(([_, stats]) => stats.accuracy === 100)
    .map(([kana, stats]) => ({
      kana,
      ...stats
    }))
    .sort((a, b) => b.total - a.total); // Sort by frequency
};

/**
 * Get characters that need practice (accuracy < 80%)
 */
export const getNeedPracticeChars = (kanaStats) => {
  return Object.entries(kanaStats)
    .filter(([_, stats]) => stats.accuracy < 80)
    .map(([kana, stats]) => ({
      kana,
      ...stats
    }))
    .sort((a, b) => a.accuracy - b.accuracy); // Sort by lowest accuracy
};

/**
 * Generate comprehensive quiz analysis report
 * @param {Array} answerHistory - Array of answer records
 * @param {number} timeSpent - Time spent in seconds
 * @param {Array} decidedGroups - Selected groups for the quiz
 */
export const generateQuizReport = (answerHistory, timeSpent = null, decidedGroups = []) => {
  const totalQuestions = answerHistory.length;
  const correctAnswers = answerHistory.filter((a) => a.isCorrect).length;
  const wrongAnswers = totalQuestions - correctAnswers;
  const overallAccuracy = calculateAccuracy(correctAnswers, totalQuestions);
  const evaluation = getEvaluationMessage(overallAccuracy);

  // Get all kana from selected groups
  const allKana = getAllKanaFromGroups(decidedGroups);
  const kanaStats = calculateKanaStats(answerHistory, allKana);
  const kanaList = Object.keys(kanaStats);

  return {
    totalQuestions,
    correctAnswers,
    wrongAnswers,
    overallAccuracy,
    evaluation,
    timeSpent,
    kanaStats,
    kanaList,
    uniqueKanaCount: kanaList.length,
    mostDifficultChars: getMostDifficultChars(kanaStats),
    masteredChars: getMasteredChars(kanaStats),
    needPracticeChars: getNeedPracticeChars(kanaStats)
  };
};

/**
 * Save quiz report to localStorage with timestamp
 */
export const saveQuizReport = (report, stage, decidedGroups) => {
  const quizHistory = JSON.parse(localStorage.getItem('quizHistory') || '[]');

  const recordData = {
    timestamp: new Date().toISOString(),
    stage,
    decidedGroups,
    report,
    sessionId: Date.now() // Simple session ID
  };

  quizHistory.push(recordData);

  // Keep only last 20 records
  if (quizHistory.length > 20) {
    quizHistory.shift();
  }

  localStorage.setItem('quizHistory', JSON.stringify(quizHistory));

  return recordData;
};

/**
 * Get quiz history from localStorage
 */
export const getQuizHistory = () => {
  return JSON.parse(localStorage.getItem('quizHistory') || '[]');
};

/**
 * Format time from seconds to readable format
 */
export const formatTime = (seconds) => {
  if (!seconds) return 'N/A';

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  if (minutes > 0) {
    return `${minutes} menit ${secs} detik`;
  }
  return `${secs} detik`;
};
