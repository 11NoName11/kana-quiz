import React, { Component } from 'react';
import { kanaDictionary } from '../../data/kanaDictionary';
import { quizSettings } from '../../data/quizSettings';
import { findRomajisAtKanaKey, removeFromArray, arrayContains, shuffle, cartesianProduct } from '../../data/helperFuncs';
import { generateQuizReport, saveQuizReport, calculateKanaStats } from '../../data/quizAnalysisUtils';
import './Question.scss';

class Question extends Component {
  constructor(props) {
    super(props);
    this.inputRef = React.createRef();
  }

  state = {
    previousQuestion: [],
    previousAnswer: '',
    currentAnswer: '',
    currentQuestion: [],
    answerOptions: [],
    stageProgress: 0,
    totalScore: 0,
    lastAnswerScore: 0,
    showError: false,
    errorMessage: '',
    correctCount: 0,
    wrongCount: 0,
    timeLimit: this.props.gameTimer || 10,
    timeRemaining: this.props.gameTimer || 10,
    timerActive: false,
    // Quiz analysis tracking
    answerHistory: [],
    quizStartTime: Date.now(),
    isQuizComplete: false
  }
    // this.setNewQuestion = this.setNewQuestion.bind(this);
    // this.handleAnswer = this.handleAnswer.bind(this);
    // this.handleAnswerChange = this.handleAnswerChange.bind(this);
    // this.handleSubmit = this.handleSubmit.bind(this);
  // }

  getRandomKanas(amount, include, exclude) {
    let randomizedKanas = this.askableKanaKeys.slice();

    if(exclude && exclude.length > 0) {
      // we're excluding previous question when deciding a new question
      randomizedKanas = removeFromArray(exclude, randomizedKanas);
    }

    if(include && include.length > 0) {
      // we arrive here when we're deciding answer options (included = currentQuestion)

      // remove included kana
      randomizedKanas = removeFromArray(include, randomizedKanas);
      shuffle(randomizedKanas);

      // cut the size to make looping quicker
      randomizedKanas = randomizedKanas.slice(0,20);

      // let's remove kanas that have the same answer as included
      let searchFor = findRomajisAtKanaKey(include, kanaDictionary)[0];
      randomizedKanas = randomizedKanas.filter(character => {
        return searchFor!=findRomajisAtKanaKey(character, kanaDictionary)[0];
      });

      // now let's remove "duplicate" kanas (if two kanas have same answers)
      let tempRandomizedKanas = randomizedKanas.slice();
      randomizedKanas = randomizedKanas.filter(r => {
        let dupeFound = false;
        searchFor = findRomajisAtKanaKey(r, kanaDictionary)[0];
        tempRandomizedKanas.shift();
        tempRandomizedKanas.forEach(w => {
          if(findRomajisAtKanaKey(w, kanaDictionary)[0]==searchFor)
            dupeFound = true;
        });
        return !dupeFound;
      });

      // alright, let's cut the array and add included to the end
      randomizedKanas = randomizedKanas.slice(0, amount-1); // -1 so we have room to add included
      randomizedKanas.push(include);
      shuffle(randomizedKanas);
    }
    else {
      shuffle(randomizedKanas);
      randomizedKanas = randomizedKanas.slice(0, amount);
    }
    return randomizedKanas;
  }

  startTimer = () => {
    if(this.props.stage === 5) {
      // Reset timer to the limit value
      this.setState({timeRemaining: this.state.timeLimit, timerActive: true}, () => {
        this.timerInterval = setInterval(() => {
          this.setState(prevState => {
            if(prevState.timeRemaining <= 1) {
              this.stopTimer();
              this.handleTimeUp();
              return {timeRemaining: 0, timerActive: false};
            }
            return {timeRemaining: prevState.timeRemaining - 1};
          });
        }, 1000);
      });
    }
  }

  stopTimer = () => {
    if(this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  handleTimeUp = () => {
    // Time is up, auto-submit current answer (or as wrong if empty)
    if(this.state.currentAnswer === '') {
      this.handleAnswer('', true);
    } else {
      this.handleAnswer(this.state.currentAnswer, true);
    }
  }

  handleTimeLimitChange = (newLimit) => {
    this.setState({timeLimit: newLimit, timeRemaining: newLimit});
    this.stopTimer();
  }

  setNewQuestion() {
    this.stopTimer();
    if(this.props.stage!=4 && this.props.stage!=5)
      this.currentQuestion = this.getRandomKanas(1, false, this.previousQuestion);
    else if(this.props.stage==4)
      this.currentQuestion = this.getRandomKanas(3, false, this.previousQuestion);
    else if(this.props.stage==5)
      this.currentQuestion = this.getRandomKanas(5, false, this.previousQuestion);
    this.setState({currentQuestion: this.currentQuestion});
    this.setAnswerOptions();
    this.setAllowedAnswers();
    // Start timer for level 5
    if(this.props.stage === 5) {
      this.startTimer();
    }
  }

  setAnswerOptions() {
    this.answerOptions = this.getRandomKanas(3, this.currentQuestion[0], false);
    this.setState({answerOptions: this.answerOptions});
    // console.log(this.answerOptions);
  }

  setAllowedAnswers() {
    // console.log(this.currentQuestion);
    this.allowedAnswers = [];
    if(this.props.stage==1 || this.props.stage==3)
      this.allowedAnswers = findRomajisAtKanaKey(this.currentQuestion, kanaDictionary);
    else if(this.props.stage==2)
      this.allowedAnswers = this.currentQuestion;
    else if(this.props.stage==4 || this.props.stage==5) {
      let tempAllowedAnswers = [];

      this.currentQuestion.forEach(key => {
        tempAllowedAnswers.push(findRomajisAtKanaKey(key, kanaDictionary));
      });

      cartesianProduct(tempAllowedAnswers).forEach(answer => {
        this.allowedAnswers.push(answer.join(''));
      });
    }
    // console.log(this.allowedAnswers);
  }

  handleAnswer = (answer, dontAdvance = false) => {
    if(this.props.stage<=2) document.activeElement.blur(); // reset answer button's :active
    this.previousQuestion = this.currentQuestion;
    this.setState({previousQuestion: this.previousQuestion});
    this.previousAnswer = answer;
    this.setState({previousAnswer: this.previousAnswer});
    this.previousAllowedAnswers = this.allowedAnswers; // Set BEFORE checking

    let answerScore = 0;
    let newCorrectCount = this.state.correctCount;
    let newWrongCount = this.state.wrongCount;
    const isCorrect = this.isInAllowedAnswers(this.previousAnswer);

    if(isCorrect) {
      this.stageProgress = this.stageProgress+1;
      answerScore = 5; // Add 5 points for correct answer
      newCorrectCount = this.state.correctCount + 1;
      this.setState({showError: false, errorMessage: ''});
    }
    else {
      this.stageProgress = this.stageProgress > 0 ? this.stageProgress - 1 : 0;
      answerScore = -1; // Subtract 1 point for wrong answer
      newWrongCount = this.state.wrongCount + 1;
      newCorrectCount = this.state.correctCount > 0 ? this.state.correctCount - 1 : 0; // Decrease correct count on wrong answer
    }

    let newScore = Math.max(0, this.state.totalScore + answerScore);

    // Track answer history for analysis (Level 4 & 5 only)
    let newAnswerHistory = this.state.answerHistory;
    if(this.props.stage === 4 || this.props.stage === 5) {
      newAnswerHistory = [...this.state.answerHistory, {
        kanaList: this.previousQuestion,
        answer: this.previousAnswer,
        isCorrect: isCorrect,
        timestamp: Date.now()
      }];
    }

    this.setState({
      stageProgress: this.stageProgress,
      totalScore: newScore,
      lastAnswerScore: answerScore,
      correctCount: newCorrectCount,
      wrongCount: newWrongCount,
      answerHistory: newAnswerHistory
    });

    if(dontAdvance && !this.isInAllowedAnswers(this.previousAnswer)) {
      this.setState({showError: true, errorMessage: 'Jawaban salah, coba lagi!'});
      return;
    }

    // Mode Lock behavior: endless quiz
    if(this.props.isLocked && (this.props.stage === 4 || this.props.stage === 5)) {
      // Just continue with next question (endless mode)
      this.setNewQuestion();
    }
    // Normal behavior: move to next stage
    else if(this.stageProgress >= quizSettings.stageLength[this.props.stage]) {
      setTimeout(() => { this.props.handleStageUp() }, 300);
    }
    else {
      this.setNewQuestion();
    }
  }

  // Method to finish endless quiz and show results
  finishQuiz = () => {
    const timeSpent = Math.round((Date.now() - this.state.quizStartTime) / 1000);
    const report = generateQuizReport(this.state.answerHistory, timeSpent, this.props.decidedGroups);

    // Save to localStorage
    saveQuizReport(report, this.props.stage, this.props.decidedGroups);

    // Notify parent component to show result analysis
    this.setState({ isQuizComplete: true });
    if(this.props.onQuizComplete) {
      this.props.onQuizComplete(report);
    }
  }

  // Method to show statistics during quiz
  showStatistics = () => {
    const timeSpent = Math.round((Date.now() - this.state.quizStartTime) / 1000);
    const kanaStats = calculateKanaStats(this.state.answerHistory, {});
    const report = generateQuizReport(this.state.answerHistory, timeSpent, this.props.decidedGroups);

    if(this.props.onShowStatistics) {
      this.props.onShowStatistics({
        correctCount: this.state.correctCount,
        wrongCount: this.state.wrongCount,
        kanaStats: kanaStats,
        totalScore: this.state.totalScore,
        quizReport: report,
        stage: this.props.stage
      });
    }
  }

  initializeCharacters() {
    this.askableKanas = {};
    this.askableKanaKeys = [];
    this.askableRomajis = [];
    this.previousQuestion = '';
    this.previousAnswer = '';
    this.stageProgress = 0;
    Object.keys(kanaDictionary).forEach(whichKana => {
      // console.log(whichKana); // 'hiragana' or 'katakana'
      Object.keys(kanaDictionary[whichKana]).forEach(groupName => {
        // console.log(groupName); // 'h_group1', ...
        // do we want to include this group?
        if(arrayContains(groupName, this.props.decidedGroups)) {
          // let's merge the group to our askableKanas
          this.askableKanas = Object.assign(this.askableKanas, kanaDictionary[whichKana][groupName]['characters']);
          Object.keys(kanaDictionary[whichKana][groupName]['characters']).forEach(key => {
            // let's add all askable kana keys to array
            this.askableKanaKeys.push(key);
            this.askableRomajis.push(kanaDictionary[whichKana][groupName]['characters'][key][0]);
          });
        }
      });
    });
    // console.log(this.askableKanas);
  }

  getAnswerType() {
    if(this.props.stage==2) return 'kana';
    else return 'romaji';
  }

  getShowableQuestion() {
    if(this.getAnswerType()=='kana')
      return findRomajisAtKanaKey(this.state.currentQuestion, kanaDictionary)[0];
    else return this.state.currentQuestion;
  }

  getPreviousResult() {
    let resultString='';
    // console.log(this.previousAnswer);
    if(this.previousQuestion=='')
      resultString = <div className="previous-result none">Let's go! Which character is this?</div>
    else {
      let rightAnswer = (
        this.props.stage==2 ?
          findRomajisAtKanaKey(this.previousQuestion, kanaDictionary)[0]
          : this.previousQuestion.join('')
        )+' = '+ this.previousAllowedAnswers[0];

      if(this.isInAllowedAnswers(this.previousAnswer))
        resultString = (
          <div className="previous-result correct" title="Correct answer!">
            <span className="pull-left glyphicon glyphicon-none"></span>{rightAnswer}<span className="pull-right glyphicon glyphicon-ok"></span>
          </div>
        );
      else
        resultString = (
          <div className="previous-result wrong" title="Wrong answer!">
            <span className="pull-left glyphicon glyphicon-none"></span>{rightAnswer}<span className="pull-right glyphicon glyphicon-remove"></span>
          </div>
        );
    }
    return resultString;
  }

  isInAllowedAnswers(previousAnswer) {
    // Check against previousAllowedAnswers which is now correctly set
    if(previousAnswer === '') return false;
    if(this.previousAllowedAnswers && arrayContains(previousAnswer, this.previousAllowedAnswers))
      return true;
    else return false;
  }

  getExpectedAnswerLength() {
    // Get the length of the first allowed answer (to know when user is done typing)
    if(this.allowedAnswers && this.allowedAnswers.length > 0) {
      return this.allowedAnswers[0].length;
    }
    return 0;
  }

  checkAnswer(answer) {
    // Check if answer is correct
    const isCorrect = arrayContains(answer, this.allowedAnswers);

    // Stop timer when answer is submitted
    this.stopTimer();

    // Clear input and auto-focus (both for correct and wrong answers)
    this.setState({currentAnswer: ''}, () => {
      if(this.inputRef.current) {
        this.inputRef.current.focus();
      }
    });

    if(isCorrect) {
      this.handleAnswer(answer, false); // Correct: auto-advance
    } else {
      this.handleAnswer(answer, true); // Wrong: show error, don't advance
    }
  }

  handleAnswerChange = e => {
    const typed = e.target.value.replace(/\s+/g, '');
    this.setState({currentAnswer: typed, showError: false});

    // Auto-check when user has typed the expected length
    if(typed.length > 0) {
      const expectedLength = this.getExpectedAnswerLength();
      if(typed.length === expectedLength) {
        // User has typed all expected characters, check the answer
        this.checkAnswer(typed.toLowerCase());
      }
    }
  }

  componentWillMount() {
    this.initializeCharacters();
    // Initialize timer state immediately
    const timerValue = (this.props.stage === 5 && this.props.gameTimer) ? this.props.gameTimer : 10;
    this.state.timeLimit = timerValue;
    this.state.timeRemaining = timerValue;
  }

  componentDidMount() {
    this.setNewQuestion();
  }

  componentDidUpdate(prevProps) {
    // If timer prop changed, update state and restart timer
    if(prevProps.gameTimer !== this.props.gameTimer && this.props.gameTimer) {
      this.setState({timeLimit: this.props.gameTimer, timeRemaining: this.props.gameTimer}, () => {
        // Restart timer after state is updated
        this.stopTimer();
        this.startTimer();
      });
    }
  }

  componentWillUnmount() {
    this.stopTimer();
  }

  render() {
    let btnClass = "btn btn-default answer-button";
    if ('ontouchstart' in window)
      btnClass += " no-hover"; // disables hover effect on touch screens
    let stageProgressPercentage = Math.round((this.state.stageProgress/quizSettings.stageLength[this.props.stage])*100)+'%';
    let stageProgressPercentageStyle = { width: stageProgressPercentage }
    const scoreIndicatorClass = this.state.lastAnswerScore > 0 ? 'score-positive' : (this.state.lastAnswerScore < 0 ? 'score-negative' : '');

    // Check if quiz can be finished (Mode Lock + 20+ soal + Level 4/5)
    const canFinishQuiz = this.props.isLocked &&
                          (this.props.stage === 4 || this.props.stage === 5) &&
                          this.state.stageProgress >= quizSettings.stageLength[this.props.stage];

    // Check if user can view statistics (Mode Lock Level 4/5 with some answers)
    const canViewStats = this.props.isLocked &&
                         (this.props.stage === 4 || this.props.stage === 5) &&
                         this.state.correctCount + this.state.wrongCount > 0;

    return (
      <div className="text-center question col-xs-12">
        <div className="score-header">
          <div className="score-display">
            <div className="score-value">{this.state.totalScore}</div>
            <div className="score-label">Points</div>
          </div>
          <div className="stats-display">
            <div className="stat-item correct">
              <span className="stat-value">{this.state.correctCount}</span>
              <span className="stat-label">Correct</span>
            </div>
            <div className="stat-item wrong">
              <span className="stat-value">{this.state.wrongCount}</span>
              <span className="stat-label">Wrong</span>
            </div>
          </div>
          {this.props.stage === 5 && (
            <div className={`timer-display ${this.state.timeRemaining <= 5 ? 'timer-warning' : ''}`}>
              <span className="timer-value">{this.state.timeRemaining}s</span>
              <span className="timer-label">Time</span>
            </div>
          )}
          {this.state.lastAnswerScore !== 0 && (
            <div className={`score-indicator ${scoreIndicatorClass}`}>
              {this.state.lastAnswerScore > 0 ? '+' : ''}{this.state.lastAnswerScore}
            </div>
          )}
          {canFinishQuiz && (
            <button
              className="btn btn-sm btn-success finish-quiz-button"
              onClick={this.finishQuiz}
              title="Selesai dan lihat hasil (minimal 20 soal terjawab)"
            >
              ✓ Selesai
            </button>
          )}
          {canViewStats && (
            <button
              className="btn btn-sm btn-info view-stats-button"
              onClick={this.showStatistics}
              title="Lihat statistik quiz Anda"
            >
              📊 Statistik
            </button>
          )}
        </div>
        {this.getPreviousResult()}
        {this.state.showError && (
          <div className="error-notification">
            <span className="glyphicon glyphicon-warning-sign"></span>
            {this.state.errorMessage}
          </div>
        )}
        <div className="big-character">{this.getShowableQuestion()}</div>
        <div className="answer-container">
          {
            this.props.stage<3 ?
              this.state.answerOptions.map((answer, idx) => {
                return <AnswerButton answer={answer}
                  className={btnClass}
                  key={idx}
                  answertype={this.getAnswerType()}
                  handleAnswer={this.handleAnswer} />
              })
            : <div className="answer-form-container">
                <input ref={this.inputRef} autoFocus className="answer-input" type="text" value={this.state.currentAnswer} onChange={this.handleAnswerChange} placeholder="jawab" />
              </div>
          }
        </div>
        <div className="progress">
          <div className="progress-bar progress-bar-info"
            role="progressbar"
            aria-valuenow={this.state.stageProgress}
            aria-valuemin="0"
            aria-valuemax={quizSettings.stageLength[this.props.stage]}
            style={stageProgressPercentageStyle}
          >
            <span>
              Stage {this.props.stage} {this.props.isLocked ? ' (Locked - Endless)' : ''}
              {canFinishQuiz && <span className="finish-badge"> • Bisa Selesai</span>}
            </span>
          </div>
        </div>
      </div>
    );
  }

}

class AnswerButton extends Component {
  getShowableAnswer() {
    if(this.props.answertype=='romaji')
      return findRomajisAtKanaKey(this.props.answer, kanaDictionary)[0];
    else return this.props.answer;
  }

  render() {
    return (
      <button className={this.props.className} onClick={()=>this.props.handleAnswer(this.getShowableAnswer())}>{this.getShowableAnswer()}</button>
    );
  }
}
export default Question;
