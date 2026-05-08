import React, { Component } from 'react';
import { kanaDictionary } from '../../data/kanaDictionary';
import ChooseCharacters from '../ChooseCharacters/ChooseCharacters';
import Game from '../Game/Game';

class GameContainer extends Component {
  state = {
    stage:1,
    isLocked: false,
    decidedGroups: JSON.parse(localStorage.getItem('decidedGroups') || null) || [],
    gameTimer: 10
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
        </div>
    )
  }
}

export default GameContainer;
