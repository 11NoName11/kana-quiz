import React, { Component } from 'react';
import { calculateAccuracy, getEvaluationMessage } from '../../data/quizAnalysisUtils';
import './QuizStatistics.scss';

class QuizStatistics extends Component {
  getAccuracyColor = (accuracy) => {
    if (accuracy >= 90) return '#4CAF50';
    if (accuracy >= 70) return '#8BC34A';
    if (accuracy >= 50) return '#FFC107';
    return '#F44336';
  }

  getTopDifficultKanas = (kanaStats, limit = 5) => {
    return Object.entries(kanaStats)
      .map(([kana, stats]) => ({
        kana,
        ...stats
      }))
      .sort((a, b) => b.wrong - a.wrong || b.errorRate - a.errorRate)
      .slice(0, limit);
  }

  getTopMasteredKanas = (kanaStats, limit = 5) => {
    return Object.entries(kanaStats)
      .map(([kana, stats]) => ({
        kana,
        ...stats
      }))
      .filter(item => item.accuracy === 100)
      .sort((a, b) => b.total - a.total)
      .slice(0, limit);
  }

  renderStatCard = (label, value, unit = '', color = null) => {
    return (
      <div className="stat-card" style={color ? { borderTopColor: color } : {}}>
        <div className="stat-label">{label}</div>
        <div className="stat-value" style={color ? { color: color } : {}}>
          {value}
          {unit && <span className="stat-unit">{unit}</span>}
        </div>
      </div>
    );
  }

  render() {
    const {
      correctCount,
      wrongCount,
      kanaStats,
      onContinue,
      onFinish,
      totalScore,
      stage
    } = this.props;

    const totalAnswers = correctCount + wrongCount;
    const accuracy = totalAnswers > 0 ? calculateAccuracy(correctCount, totalAnswers) : 0;
    const evaluation = getEvaluationMessage(accuracy);
    const accuracyColor = this.getAccuracyColor(accuracy);
    const difficultKanas = this.getTopDifficultKanas(kanaStats);
    const masteredKanas = this.getTopMasteredKanas(kanaStats);

    return (
      <div className="quiz-statistics-page">
        <div className="statistics-container">
          {/* Header */}
          <div className="stats-header">
            <h1>📊 Statistik Quiz</h1>
            <p className="subtitle">Lihat progres Anda saat ini</p>
          </div>

          {/* Main Stats Cards */}
          <div className="stats-grid-main">
            {this.renderStatCard('Total Soal', totalAnswers, '', accuracyColor)}
            {this.renderStatCard('Jawaban Benar', correctCount, '', '#4CAF50')}
            {this.renderStatCard('Jawaban Salah', wrongCount, '', '#F44336')}
            {this.renderStatCard('Poin', totalScore, 'poin', '#667eea')}
          </div>

          {/* Accuracy Display */}
          <div className="accuracy-display">
            <div className="accuracy-circle-container">
              <svg viewBox="0 0 120 120" className="accuracy-circle">
                <circle cx="60" cy="60" r="50" className="accuracy-bg" />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  className="accuracy-fill"
                  style={{
                    strokeDashoffset: 314.159 - (314.159 * accuracy / 100),
                    stroke: accuracyColor
                  }}
                />
              </svg>
              <div className="accuracy-text">
                <div className="accuracy-percentage">{accuracy}%</div>
                <div className="accuracy-label">Akurasi</div>
              </div>
            </div>
            <div className="evaluation-badge" style={{ backgroundColor: accuracyColor }}>
              {evaluation.message}
            </div>
          </div>

          {/* Difficult Characters */}
          {difficultKanas.length > 0 && (
            <div className="stats-section">
              <h3>🔴 Huruf yang Sering Salah</h3>
              <div className="kana-list difficult">
                {difficultKanas.map((item, idx) => (
                  <div key={idx} className="kana-item-stat">
                    <span className="kana-char">{item.kana}</span>
                    <span className="kana-error">{item.wrong} ✕</span>
                    <span className="kana-rate">{item.errorRate}% error</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mastered Characters */}
          {masteredKanas.length > 0 && (
            <div className="stats-section">
              <h3>✅ Huruf yang Sudah Dikuasai</h3>
              <div className="kana-list mastered">
                {masteredKanas.map((item, idx) => (
                  <span key={idx} className="kana-badge">{item.kana}</span>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="stats-actions">
            <button
              className="btn btn-continue"
              onClick={onContinue}
            >
              <span className="btn-icon">▶</span>
              Lanjutkan Quiz
            </button>
            <button
              className="btn btn-finish"
              onClick={onFinish}
            >
              <span className="btn-icon">✓</span>
              Selesaikan & Lihat Hasil
            </button>
          </div>

          {/* Info Message */}
          <div className="stats-info">
            <p>💡 Terus latihan untuk meningkatkan akurasi Anda!</p>
          </div>
        </div>
      </div>
    );
  }
}

export default QuizStatistics;
