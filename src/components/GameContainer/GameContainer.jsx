import React, { Component } from 'react';
import { kanaDictionary } from '../../data/kanaDictionary';
import ChooseCharacters from '../ChooseCharacters/ChooseCharacters';
import Game from '../Game/Game';
import KanjiQuiz from '../KanjiQuiz/KanjiQuiz';

class GameContainer extends Component {
  state = {
    stage:1,
    isLocked: false,
    decidedGroups: JSON.parse(localStorage.getItem('decidedGroups') || null) || [],
    gameTimer: 10,
    selectedKanjiPage: null,
    kanjiQuizCards: []
  }

  componentWillReceiveProps() {
    if(!this.state.isLocked)
      this.setState({stage: 1});
  }

  startGame = decidedGroups => {
    if(parseInt(this.state.stage)<1 || isNaN(parseInt(this.state.stage)))
      this.setState({stage: 1});
    else if(parseInt(this.state.stage)>5)
      this.setState({stage: 5});

    this.setState({decidedGroups: decidedGroups});
    localStorage.setItem('decidedGroups', JSON.stringify(decidedGroups));
    this.props.handleStartGame();
  }

  startKanjiQuizPage = () => {
    this.props.handleStartKanjiQuizPage();
  }

  selectKanjiPage = (cards, pageName) => {
    this.setState({
      kanjiQuizCards: cards,
      selectedKanjiPage: pageName
    });
    this.props.handleStartKanjiQuiz();
  }

  startKanjiQuizDirect = (cards, pageName) => {
    this.setState({
      kanjiQuizCards: cards,
      selectedKanjiPage: pageName
    });
    this.props.handleStartKanjiQuiz();
  }

  stageUp = () => {
    this.setState({stage: this.state.stage+1});
  }

  lockStage = (stage, forceLock) => {
    // Parse stage to ensure it's an integer
    const parsedStage = typeof stage === 'string' ? parseInt(stage) : stage;
    if(forceLock)
      this.setState({stage: parsedStage, isLocked: true});
    else
      this.setState({stage: parsedStage, isLocked: !this.state.isLocked});
  }

  setGameTimer = (timerValue) => {
    this.setState({gameTimer: timerValue});
  }

  render() {
    return (
      <div>
        { this.props.gameState==='chooseCharacters' &&
            <ChooseCharacters selectedGroups={this.state.decidedGroups}
              handleStartGame={this.startGame}
              setGameTimer={this.setGameTimer}
              stage={this.state.stage}
              isLocked={this.state.isLocked}
              lockStage={this.lockStage}
              handleStartKanjiQuiz={this.startKanjiQuizDirect}
            />
          }
          { this.props.gameState==='game' &&
              <Game decidedGroups={this.state.decidedGroups}
                handleEndGame={this.props.handleEndGame}
                stageUp={this.stageUp}
                stage={this.state.stage}
                isLocked={this.state.isLocked}
                lockStage={this.lockStage}
                gameTimer={this.state.gameTimer}
              />
          }
          { this.props.gameState==='kanjiQuiz' &&
              <KanjiQuiz
                cards={this.state.kanjiQuizCards}
                pageName={this.state.selectedKanjiPage}
                handleEndKanjiQuiz={this.props.handleEndGame}
              />
          }
        </div>
    )
  }
}

export default GameContainer;
