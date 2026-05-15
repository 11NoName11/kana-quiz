import React, { Component } from 'react';
import { kanaDictionary } from '../../data/kanaDictionary';
import ShowStage from './ShowStage';
import Question from './Question';
import QuizResultAnalysis from './QuizResultAnalysis';

class Game extends Component {
  state = {
    showScreen: '',
    quizReport: null
  }

  componentWillMount() {
    this.setState({showScreen: 'stage'});
  }

  stageUp = () => {
    this.props.stageUp();
    this.setState({showScreen: 'stage'});
  }

  lockStage = stage => {
    this.setState({showScreen: 'question'});
    this.props.lockStage(stage);
  }

  showQuestion = () => {
    this.setState({showScreen: 'question'})
  }

  // Handle quiz completion for Mode Lock Level 4 & 5
  handleQuizComplete = (report) => {
    this.setState({
      showScreen: 'result',
      quizReport: report
    });
  }

  // Handle retry quiz
  handleRetryQuiz = () => {
    this.setState({
      showScreen: 'stage',
      quizReport: null
    });
  }

  // Handle back to menu
  handleBackToMenu = () => {
    this.props.handleEndGame();
  }

  // Handle retry difficult characters
  handleRetryDifficult = () => {
    // This could be enhanced to filter characters, for now just retry
    this.setState({
      showScreen: 'stage',
      quizReport: null
    });
  }

  render() {
    return (
      <div>
        {
          this.state.showScreen==='stage' &&
            <ShowStage lockStage={this.lockStage} handleShowQuestion={this.showQuestion} handleEndGame={this.props.handleEndGame} stage={this.props.stage} gameTimer={this.props.gameTimer} />
        }
        {
          this.state.showScreen==='question' &&
            <Question
              isLocked={this.props.isLocked}
              handleStageUp={this.stageUp}
              stage={this.props.stage}
              decidedGroups={this.props.decidedGroups}
              gameTimer={this.props.gameTimer}
              onQuizComplete={this.handleQuizComplete}
            />
        }
        {
          this.state.showScreen==='result' && this.state.quizReport &&
            <QuizResultAnalysis
              report={this.state.quizReport}
              onClose={this.handleBackToMenu}
              onRetry={this.handleRetryQuiz}
              onRetryDifficult={this.handleRetryDifficult}
            />
        }
      </div>
    );
  }
}

export default Game;
