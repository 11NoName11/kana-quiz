import React, { Component } from 'react';
import {
  formatTime,
  getMostDifficultChars,
  getMasteredChars
} from '../../data/quizAnalysisUtils';
import './QuizResultAnalysis.scss';

class QuizResultAnalysis extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expandedTab: 'overview', // overview, perKana, improvements
      sortBy: 'accuracy' // accuracy, frequency
    };
  }

  toggleTab = (tab) => {
    this.setState({ expandedTab: this.state.expandedTab === tab ? null : tab });
  }

  setSortBy = (sortBy) => {
    this.setState({ sortBy });
  }

  getEvaluationColor = (level) => {
    switch (level) {
      case 'excellent': return '#4CAF50';
      case 'good': return '#8BC34A';
      case 'fair': return '#FFC107';
      case 'poor': return '#F44336';
      default: return '#2196F3';
    }
  }

  renderStatCard = (label, value, unit = '', icon = null) => {
    return (
      <div className="stat-card">
        {icon && <div className="stat-icon">{icon}</div>}
        <div className="stat-content">
          <div className="stat-label">{label}</div>
          <div className="stat-value">
            {value}
            {unit && <span className="stat-unit">{unit}</span>}
          </div>
        </div>
      </div>
    );
  }

  renderKanaItem = (kana, stats) => {
    const accuracyColor = stats.accuracy >= 90 ? '#4CAF50' :
                         stats.accuracy >= 70 ? '#8BC34A' :
                         stats.accuracy >= 50 ? '#FFC107' : '#F44336';

    return (
      <div key={kana} className="kana-item">
        <div className="kana-character">{kana}</div>
        <div className="kana-stats">
          <div className="stat-row">
            <span className="stat-name">Benar:</span>
            <span className="stat-value correct">{stats.correct}</span>
          </div>
          <div className="stat-row">
            <span className="stat-name">Salah:</span>
            <span className="stat-value wrong">{stats.wrong}</span>
          </div>
          <div className="stat-row">
            <span className="stat-name">Total:</span>
            <span className="stat-value">{stats.total}</span>
          </div>
        </div>
        <div className="accuracy-bar">
          <div
            className="accuracy-fill"
            style={{
              width: `${stats.accuracy}%`,
              backgroundColor: accuracyColor
            }}
          />
        </div>
        <div className="accuracy-text" style={{ color: accuracyColor }}>
          {stats.accuracy}%
        </div>
      </div>
    );
  }

  renderPerKanaStats = () => {
    const { report } = this.props;
    const { sortBy } = this.state;
    const stats = report.kanaStats;

    let sortedKanas = Object.entries(stats).map(([kana, data]) => ({
      kana,
      ...data
    }));

    if (sortBy === 'accuracy') {
      sortedKanas.sort((a, b) => a.accuracy - b.accuracy);
    } else {
      sortedKanas.sort((a, b) => b.total - a.total);
    }

    return (
      <div className="per-kana-section">
        <div className="section-header">
          <h3>Statistik Per Huruf</h3>
          <div className="sort-buttons">
            <button
              className={`sort-btn ${sortBy === 'accuracy' ? 'active' : ''}`}
              onClick={() => this.setSortBy('accuracy')}
            >
              Akurasi
            </button>
            <button
              className={`sort-btn ${sortBy === 'frequency' ? 'active' : ''}`}
              onClick={() => this.setSortBy('frequency')}
            >
              Frekuensi
            </button>
          </div>
        </div>
        <div className="kana-grid">
          {sortedKanas.map(item => this.renderKanaItem(item.kana, item))}
        </div>
      </div>
    );
  }

  renderDifficultChars = () => {
    const { report } = this.props;
    const difficultChars = report.mostDifficultChars.slice(0, 5);

    if (difficultChars.length === 0) {
      return (
        <div className="improvement-section">
          <h3>Huruf yang Sering Salah</h3>
          <p className="info-text">Tidak ada huruf yang salah! Luar biasa!</p>
        </div>
      );
    }

    return (
      <div className="improvement-section">
        <h3>🔴 Huruf yang Sering Salah</h3>
        <div className="difficulty-list">
          {difficultChars.map((item, idx) => (
            <div key={idx} className="difficulty-item">
              <div className="rank">{idx + 1}</div>
              <div className="kana-display">{item.kana}</div>
              <div className="stats-mini">
                <span className="wrong">{item.wrong} salah</span>
                <span className="total">dari {item.total}</span>
              </div>
              <div className="error-rate">Error Rate: {item.errorRate}%</div>
            </div>
          ))}
        </div>
        <button className="btn btn-warning retry-btn" onClick={() => this.props.onRetryDifficult()}>
          Ulangi Huruf yang Salah
        </button>
      </div>
    );
  }

  renderMasteredChars = () => {
    const { report } = this.props;
    const masteredChars = report.masteredChars;

    if (masteredChars.length === 0) {
      return null;
    }

    return (
      <div className="improvement-section">
        <h3>✅ Huruf yang Sudah Dikuasai</h3>
        <div className="mastered-list">
          {masteredChars.map((item, idx) => (
            <span key={idx} className="mastered-badge" title={`${item.total} kali benar`}>
              {item.kana}
            </span>
          ))}
        </div>
      </div>
    );
  }

  render() {
    const { report, onClose, onRetry } = this.props;
    const { expandedTab } = this.state;

    const evaluationColor = this.getEvaluationColor(report.evaluation.level);

    return (
      <div className="quiz-result-page">
        <div className="quiz-result-container">
          {/* Header */}
          <div className="result-header">
            <h1>🎯 Quiz Selesai!</h1>
            <button className="close-btn" onClick={onClose} title="Kembali ke menu">✕</button>
          </div>

          {/* Main Evaluation */}
          <div className="accuracy-display-results">
            <div className="accuracy-circle-container">
              <svg viewBox="0 0 120 120" className="accuracy-circle">
                <circle cx="60" cy="60" r="50" className="accuracy-circle-bg" />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  className="accuracy-circle-fill"
                  style={{
                    strokeDashoffset: 314.159 - (314.159 * report.overallAccuracy / 100),
                    stroke: evaluationColor
                  }}
                />
              </svg>
              <div className="accuracy-text">
                <div className="accuracy-percentage">{report.overallAccuracy}%</div>
                <div className="accuracy-label">Akurasi</div>
              </div>
            </div>
            <div className="evaluation-badge" style={{ backgroundColor: evaluationColor }}>
              {report.evaluation.message}
            </div>
          </div>

          {/* Stats Overview */}
          <div className="stats-grid">
            {this.renderStatCard('Total Soal', report.totalQuestions, '')}
            {this.renderStatCard('Jawaban Benar', report.correctAnswers, '', '✓')}
            {this.renderStatCard('Jawaban Salah', report.wrongAnswers, '', '✕')}
            {this.renderStatCard('Jenis Huruf', report.uniqueKanaCount, '', '字')}
            {report.timeSpent && this.renderStatCard('Waktu', formatTime(report.timeSpent), '')}
          </div>

          {/* Tabs */}
          <div className="result-tabs">
            <div className="tabs-header">
              <button
                className={`tab-btn ${expandedTab === 'overview' ? 'active' : ''}`}
                onClick={() => this.toggleTab('overview')}
              >
                Ringkasan
              </button>
              <button
                className={`tab-btn ${expandedTab === 'perKana' ? 'active' : ''}`}
                onClick={() => this.toggleTab('perKana')}
              >
                Statistik Per Huruf
              </button>
              <button
                className={`tab-btn ${expandedTab === 'improvements' ? 'active' : ''}`}
                onClick={() => this.toggleTab('improvements')}
              >
                Area Peningkatan
              </button>
            </div>

            <div className="tabs-content">
              {expandedTab === 'overview' && (
                <div className="tab-pane">
                  <div className="overview-content">
                    <p>Anda telah menyelesaikan {report.totalQuestions} soal dengan akurasi {report.overallAccuracy}%.</p>
                    <p className="evaluation-message" style={{ color: evaluationColor }}>
                      <strong>{report.evaluation.message}</strong>
                    </p>
                    <div className="recommendation">
                      {report.overallAccuracy >= 90 && (
                        <p>🎉 Pertahankan performa ini! Anda sudah menguasai materi dengan sangat baik.</p>
                      )}
                      {report.overallAccuracy >= 70 && report.overallAccuracy < 90 && (
                        <p>👍 Bagus! Terus latihan untuk meningkatkan akurasi lebih tinggi lagi.</p>
                      )}
                      {report.overallAccuracy >= 50 && report.overallAccuracy < 70 && (
                        <p>💪 Sudah lumayan! Tapi masih perlu latihan lebih untuk menguasai sepenuhnya.</p>
                      )}
                      {report.overallAccuracy < 50 && (
                        <p>📚 Anda perlu banyak latihan lagi. Jangan menyerah, ulangi lagi!</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {expandedTab === 'perKana' && this.renderPerKanaStats()}

              {expandedTab === 'improvements' && (
                <div className="tab-pane">
                  {this.renderDifficultChars()}
                  {this.renderMasteredChars()}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="result-actions">
            <button className="btn btn-secondary" onClick={onClose}>
              Kembali ke Menu
            </button>
            <button className="btn btn-primary" onClick={onRetry}>
              Ulangi Level
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default QuizResultAnalysis;
