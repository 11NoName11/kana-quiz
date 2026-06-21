import React, { Component } from 'react';
import './KanjiQuiz.scss';

class KanjiQuiz extends Component {
  state = {
    currentIndex: 0,
    cards: this.props.cards || [],
    showFurigana: false,
    isSequential: false
  }

  componentDidMount() {
    this.shuffleCard();
  }

  shuffleCard = () => {
    const { currentIndex, cards } = this.state;
    let randomIndex;

    // Ensure new index is different from current
    do {
      randomIndex = Math.floor(Math.random() * cards.length);
    } while (randomIndex === currentIndex && cards.length > 1);

    this.setState({
      currentIndex: randomIndex,
      showFurigana: false,
      isSequential: false
    });
  }

  startSequential = () => {
    this.setState({
      currentIndex: 0,
      showFurigana: false,
      isSequential: true
    });
  }

  nextSequential = () => {
    const { currentIndex, cards } = this.state;
    if (currentIndex < cards.length - 1) {
      this.setState({
        currentIndex: currentIndex + 1,
        showFurigana: false
      });
    }
  }

  prevSequential = () => {
    const { currentIndex } = this.state;
    if (currentIndex > 0) {
      this.setState({
        currentIndex: currentIndex - 1,
        showFurigana: false
      });
    }
  }

  handleCardClick = () => {
    this.setState({ showFurigana: !this.state.showFurigana });
  }

  render() {
    const { currentIndex, cards, showFurigana, isSequential } = this.state;
    const currentCard = cards[currentIndex];

    return (
      <div className="kanji-quiz-container">
        <div className="kanji-card-wrapper" onClick={this.handleCardClick}>
          <div className={`kanji-card-content ${showFurigana ? 'flipped' : ''}`}>
            {/* Front - Kanji */}
            <div className="kanji-card-front">
              <h1 className="kanji-large japanese-font">
                {currentCard.kanji}
              </h1>
            </div>

            {/* Back - Furigana */}
            <div className="kanji-card-back">
              <div className="kanji-furigana japanese-font">
                {currentCard.hiragana}
              </div>
            </div>
          </div>
        </div>

        {/* Counter */}
        <div className="kanji-counter-bottom">
          {currentIndex + 1} / {cards.length}
        </div>

        {/* Navigation */}
        <div className="kanji-nav-bottom">
          <button
            className="nav-btn menu-btn"
            onClick={this.props.handleEndKanjiQuiz}
          >
            ← Menu
          </button>

          {isSequential ? (
            <>
              <button
                className={`nav-btn nav-prev-btn ${currentIndex === 0 ? 'disabled' : ''}`}
                onClick={this.prevSequential}
                disabled={currentIndex === 0}
              >
                ← Prev
              </button>

              <button
                className="nav-btn shuffle-btn"
                onClick={this.shuffleCard}
              >
                🔀 Shuffle
              </button>

              <button
                className={`nav-btn nav-next-btn ${currentIndex === cards.length - 1 ? 'disabled' : ''}`}
                onClick={this.nextSequential}
                disabled={currentIndex === cards.length - 1}
              >
                Next →
              </button>
            </>
          ) : (
            <>
              <button
                className="nav-btn shuffle-btn"
                onClick={this.shuffleCard}
              >
                🔀 Shuffle
              </button>

              <button
                className="nav-btn sequential-btn"
                onClick={this.startSequential}
              >
                ↻ Urut
              </button>
            </>
          )}
        </div>
      </div>
    );
  }
}

export default KanjiQuiz;
