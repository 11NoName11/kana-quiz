import React, { Component } from 'react';
import './ChooseKanjiPage.scss';
import { ALL_KANJI_BAB, KANJI_BAB_1, KANJI_BAB_2, KANJI_BAB_3, KANJI_BAB_4, KANJI_BAB_5, KANJI_BAB_6 } from '../../data/kanji';

const PAGES_DATA = [
  KANJI_BAB_1, KANJI_BAB_2, KANJI_BAB_3, KANJI_BAB_4, KANJI_BAB_5,
  KANJI_BAB_6
];

class ChooseKanjiPage extends Component {
  state = {
    errMsg: ''
  }

  startKanjiQuiz = (pageIndex) => {
    const pageData = PAGES_DATA[pageIndex];

    if (pageData.length === 0) {
      this.setState({ errMsg: `Bab ${pageIndex + 1} masih kosong` });
      return;
    }

    this.props.handleStartKanjiQuiz(pageData, pageIndex + 1);
  }

  startAllKanjiQuiz = () => {
    // Combine all pages with data
    const allKanji = PAGES_DATA.reduce((acc, page) => {
      if (page.length > 0) {
        return acc.concat(page);
      }
      return acc;
    }, []);

    if (allKanji.length === 0) {
      this.setState({ errMsg: 'Tidak ada data kanji' });
      return;
    }

    this.props.handleStartKanjiQuiz(allKanji, 'Semua Halaman');
  }

  render() {
    const { errMsg } = this.state;

    return (
      <div className="choose-kanji-container">
        <div className="kanji-header-section">
          <h1 className="kanji-title">Pilih Bab Kanji</h1>
          <p className="kanji-subtitle">Pilih bab yang ingin dipelajari</p>
        </div>

        {errMsg && <div className="error-message">{errMsg}</div>}

        <div className="kanji-pages-grid">
          {ALL_KANJI_BAB.map((bab, idx) => {
            const hasData = PAGES_DATA[idx].length > 0;
            return (
              <button
                key={idx}
                className={`page-button ${hasData ? '' : 'disabled'}`}
                onClick={() => this.startKanjiQuiz(idx)}
                disabled={!hasData}
              >
                <span className="page-number">Bab {bab.bab}</span>
                <span className="page-range">({bab.range})</span>
                <span className="page-count">{PAGES_DATA[idx].length} kanji</span>
              </button>
            );
          })}
        </div>

        <div className="all-kanji-section">
          <button className="all-kanji-button" onClick={this.startAllKanjiQuiz}>
            🎯 Test Semua Kanji
          </button>
        </div>

        <button
          className="back-button"
          onClick={this.props.handleBackToHome}
        >
          ← Kembali
        </button>
      </div>
    );
  }
}

export default ChooseKanjiPage;
