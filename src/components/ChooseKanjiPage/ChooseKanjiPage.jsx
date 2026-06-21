import React, { Component } from 'react';
import './ChooseKanjiPage.scss';
import { ALL_KANJI_PAGES, KANJI_PAGE_1, KANJI_PAGE_2, KANJI_PAGE_3, KANJI_PAGE_4, KANJI_PAGE_5, KANJI_PAGE_6, KANJI_PAGE_7, KANJI_PAGE_8, KANJI_PAGE_9, KANJI_PAGE_10, KANJI_PAGE_11 } from '../../data/kanji';

const PAGES_DATA = [
  KANJI_PAGE_1, KANJI_PAGE_2, KANJI_PAGE_3, KANJI_PAGE_4, KANJI_PAGE_5,
  KANJI_PAGE_6, KANJI_PAGE_7, KANJI_PAGE_8, KANJI_PAGE_9, KANJI_PAGE_10, KANJI_PAGE_11
];

class ChooseKanjiPage extends Component {
  state = {
    errMsg: ''
  }

  startKanjiQuiz = (pageIndex) => {
    const pageData = PAGES_DATA[pageIndex];

    if (pageData.length === 0) {
      this.setState({ errMsg: `Halaman ${pageIndex + 1} masih kosong` });
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
          <h1 className="kanji-title">Pilih Halaman Kanji</h1>
          <p className="kanji-subtitle">Pilih halaman yang ingin dipelajari</p>
        </div>

        {errMsg && <div className="error-message">{errMsg}</div>}

        <div className="kanji-pages-grid">
          {ALL_KANJI_PAGES.map((page, idx) => {
            const hasData = PAGES_DATA[idx].length > 0;
            return (
              <button
                key={idx}
                className={`page-button ${hasData ? '' : 'disabled'}`}
                onClick={() => this.startKanjiQuiz(idx)}
                disabled={!hasData}
              >
                <span className="page-number">Halaman {page.page}</span>
                <span className="page-range">({page.range})</span>
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
