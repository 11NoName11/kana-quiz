import React, { Component } from 'react';
import './KanjiQuiz.scss';

class KanjiQuiz extends Component {
  state = {
    mode: 'choice',
    currentIndex: 0,
    cards: this.props.cards || [],
    showFurigana: false,
    isSequential: false,
    usedIndices: [],
    quizItems: [],
    quizIndex: 0,
    showAnswer: false,
    quizCompleted: false
  }

  componentDidMount() {
    this.initializeCards(this.props.cards);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.cards !== this.props.cards) {
      this.initializeCards(this.props.cards);
    }
  }

  initializeCards = (cards = []) => {
    this.setState({
      mode: 'choice',
      cards: cards || [],
      currentIndex: 0,
      showFurigana: false,
      isSequential: false,
      usedIndices: [],
      quizItems: [],
      quizIndex: 0,
      showAnswer: false,
      quizCompleted: false
    });
  }

  startFlashcardMode = () => {
    const { cards } = this.state;
    this.setState({
      mode: 'flashcard',
      currentIndex: 0,
      showFurigana: false,
      isSequential: false,
      usedIndices: [],
      quizIndex: 0,
      showAnswer: false,
      quizCompleted: false
    }, () => {
      if ((cards || []).length > 0) {
        this.shuffleCard();
      }
    });
  }

  startQuizMode = () => {
    const { cards } = this.state;
    const quizItems = this.createQuizItems(cards || []);

    this.setState({
      mode: 'quiz',
      quizItems,
      quizIndex: 0,
      showAnswer: false,
      quizCompleted: false
    });
  }

  createQuizItems = (cards = []) => {
    const pool = cards || [];
    const total = pool.length; // allow full chapter size (e.g., 113)
    const remaining = [...pool];
    const quizItems = [];

    while (quizItems.length < total && remaining.length > 0) {
      const randomIndex = Math.floor(Math.random() * remaining.length);
      quizItems.push(remaining.splice(randomIndex, 1)[0]);
    }

    return quizItems;
  }

  shuffleCard = () => {
    const { cards, usedIndices } = this.state;
    if (!cards || cards.length === 0) {
      return;
    }

    const allIndices = cards.map((_, index) => index);
    let availableIndices = allIndices.filter(index => !usedIndices.includes(index));
    let nextUsedIndices = [...usedIndices];

    if (availableIndices.length === 0) {
      availableIndices = allIndices.slice();
      nextUsedIndices = [];
    }

    const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    nextUsedIndices.push(randomIndex);

    this.setState({
      currentIndex: randomIndex,
      showFurigana: false,
      isSequential: false,
      usedIndices: nextUsedIndices
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

  toggleQuizAnswer = () => {
    this.setState({ showAnswer: !this.state.showAnswer });
  }

  nextQuizCard = () => {
    const { quizIndex, quizItems } = this.state;

    if (quizIndex < quizItems.length - 1) {
      this.setState({
        quizIndex: quizIndex + 1,
        showAnswer: false
      });
    } else {
      this.setState({
        quizCompleted: true,
        showAnswer: false
      });
    }
  }

  restartQuiz = () => {
    this.startQuizMode();
  }

  backToSelection = () => {
    this.setState({
      mode: 'choice',
      showFurigana: false,
      showAnswer: false,
      quizCompleted: false
    });
  }

  render() {
    const { mode, currentIndex, cards, showFurigana, isSequential, quizItems, quizIndex, showAnswer, quizCompleted } = this.state;
    const hasCards = cards.length > 0;
    const currentCard = hasCards ? cards[currentIndex] : null;
    const currentQuizCard = quizItems[quizIndex];

    if (!hasCards) {
      return (
        <div className="kanji-quiz-container">
          <div className="kanji-empty-state">
            <h2>Tidak ada data kanji untuk dipelajari.</h2>
            <button className="nav-btn menu-btn" onClick={this.props.handleEndKanjiQuiz}>
              ← Kembali ke Menu
            </button>
          </div>
        </div>
      );
    }

    if (mode === 'choice') {
      return (
        <div className="kanji-quiz-container">
          <div className="kanji-mode-choice">
            <h2 className="kanji-mode-title">Pilih Mode Belajar</h2>
            <p className="kanji-mode-subtitle">Flashcard untuk melihat kartu, quiz untuk hafalan acak tanpa pengulangan.</p>
            <div className="kanji-mode-buttons">
              <button className="mode-btn mode-btn-primary" onClick={this.startFlashcardMode}>
                📚 Flashcard
              </button>
              <button className="mode-btn mode-btn-secondary" onClick={this.startQuizMode}>
                🧠 Quiz ({cards.length} soal)
              </button>
            </div>
          </div>
          <button className="nav-btn menu-btn" onClick={this.props.handleEndKanjiQuiz}>
            ← Menu
          </button>
        </div>
      );
    }

    if (mode === 'quiz') {
      if (quizCompleted) {
        return (
          <div className="kanji-quiz-container">
            <div className="kanji-quiz-complete">
              <h2>Quiz selesai 🎉</h2>
              <p>Kamu sudah menyelesaikan {quizItems.length} soal tanpa pengulangan.</p>
              <div className="kanji-mode-buttons">
                <button className="mode-btn mode-btn-primary" onClick={this.restartQuiz}>
                  Ulang Quiz
                </button>
                <button className="mode-btn mode-btn-secondary" onClick={this.backToSelection}>
                  Pilih Mode
                </button>
              </div>
            </div>
          </div>
        );
      }

      if (!currentQuizCard) {
        return (
          <div className="kanji-quiz-container">
            <div className="kanji-empty-state">
              <h2>Tidak ada soal yang tersedia.</h2>
            </div>
          </div>
        );
      }

      return (
        <div className="kanji-quiz-container">
          <div className="kanji-card-wrapper" onClick={this.toggleQuizAnswer}>
            <div className={`kanji-card-content ${showAnswer ? 'flipped' : ''}`}>
              <div className="kanji-card-front">
                <h1 className="kanji-large japanese-font">
                  {currentQuizCard.kanji}
                </h1>
              </div>
              <div className="kanji-card-back">
                <div className="kanji-furigana japanese-font">
                  {currentQuizCard.hiragana}
                </div>
                {currentQuizCard.arti && (
                  <div className="kanji-meaning">
                    {currentQuizCard.arti}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="kanji-counter-bottom">
            {quizIndex + 1} / {quizItems.length}
          </div>

          <div className="kanji-nav-bottom">
            <button className="nav-btn menu-btn" onClick={this.backToSelection}>
              ← Kembali
            </button>
            <button className="nav-btn shuffle-btn" onClick={this.toggleQuizAnswer}>
              {showAnswer ? 'Sembunyikan' : 'Lihat Arti'}
            </button>
            <button className="nav-btn sequential-btn" onClick={this.nextQuizCard}>
              {quizIndex === quizItems.length - 1 ? 'Selesai' : 'Lanjut →'}
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="kanji-quiz-container">
        <div className="kanji-card-wrapper" onClick={this.handleCardClick}>
          <div className={`kanji-card-content ${showFurigana ? 'flipped' : ''}`}>
            <div className="kanji-card-front">
              <h1 className="kanji-large japanese-font">
                {currentCard.kanji}
              </h1>
            </div>

            <div className="kanji-card-back">
              <div className="kanji-furigana japanese-font">
                {currentCard.hiragana}
              </div>
              {currentCard.arti && (
                <div className="kanji-meaning">
                  {currentCard.arti}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="kanji-counter-bottom">
          {currentIndex + 1} / {cards.length}
        </div>

        <div className="kanji-nav-bottom">
          <button className="nav-btn menu-btn" onClick={this.backToSelection}>
            ← Mode
          </button>

          <button
            className={`nav-btn nav-prev-btn ${currentIndex === 0 ? 'disabled' : ''}`}
            onClick={this.prevSequential}
            disabled={currentIndex === 0}
          >
            ← Prev
          </button>

          <button
            className={`nav-btn nav-next-btn ${currentIndex === cards.length - 1 ? 'disabled' : ''}`}
            onClick={this.nextSequential}
            disabled={currentIndex === cards.length - 1}
          >
            Next →
          </button>
        </div>
      </div>
    );
  }
}

export default KanjiQuiz;
