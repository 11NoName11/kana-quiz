import React, { Component } from 'react';
import Switch from 'react-toggle-switch';
import { kanaDictionary } from '../../data/kanaDictionary';
import { ALL_KANJI_BAB, KANJI_BAB_1, KANJI_BAB_2, KANJI_BAB_3, KANJI_BAB_4, KANJI_BAB_5, KANJI_BAB_6, KANJI_BAB_7 } from '../../data/kanji';
import './ChooseCharacters.scss';
import CharacterGroup from './CharacterGroup';

const PAGES_DATA = [
  KANJI_BAB_1, KANJI_BAB_2, KANJI_BAB_3, KANJI_BAB_4, KANJI_BAB_5,
  KANJI_BAB_6, KANJI_BAB_7
];

class ChooseCharacters extends Component {
  state = {
    errMsg : '',
    selectedGroups: this.props.selectedGroups,
    showAlternatives: [],
    showSimilars: [],
    startIsVisible: true,
    selectedTimer: 10,
    showKanjiPages: true
  }

  componentDidMount() {
    this.testIsStartVisible();
    window.addEventListener('resize', this.testIsStartVisible);
    window.addEventListener('scroll', this.testIsStartVisible);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.testIsStartVisible);
    window.removeEventListener('scroll', this.testIsStartVisible);
  }

  componentDidUpdate(prevProps, prevState) {
    this.testIsStartVisible();
  }

  testIsStartVisible = () => {
    if(this.startRef) {
      const rect = this.startRef.getBoundingClientRect();
      if(rect.y > window.innerHeight && this.state.startIsVisible)
        this.setState({ startIsVisible: false });
      else if(rect.y <= window.innerHeight && !this.state.startIsVisible)
        this.setState({ startIsVisible: true });
    }
  }

  scrollToStart() {
    if(this.startRef) {
      const rect = this.startRef.getBoundingClientRect();
      const absTop = rect.top + window.pageYOffset;
      const scrollPos = absTop - window.innerHeight + 50;
      window.scrollTo(0, scrollPos > 0 ? scrollPos : 0);
    }
  }

  getIndex(groupName) {
    return this.state.selectedGroups.indexOf(groupName);
  }

  isSelected(groupName) {
    return this.getIndex(groupName) > -1 ? true : false;
  }

  removeSelect(groupName) {
    if(this.getIndex(groupName)<0)
      return;
    let newSelectedGroups = this.state.selectedGroups.slice();
    newSelectedGroups.splice(this.getIndex(groupName), 1);
    this.setState({selectedGroups: newSelectedGroups});
  }

  addSelect(groupName) {
    this.setState({errMsg: '', selectedGroups: this.state.selectedGroups.concat(groupName)});
  }

  toggleSelect = groupName => {
    if(this.getIndex(groupName) > -1)
      this.removeSelect(groupName);
    else
      this.addSelect(groupName);
  }

  selectAll(whichKana, altOnly=false, similarOnly=false) {
    const thisKana = kanaDictionary[whichKana];
    let newSelectedGroups = this.state.selectedGroups.slice();
    Object.keys(thisKana).forEach(groupName => {
      if(!this.isSelected(groupName) && (
        (altOnly && groupName.endsWith('_a')) ||
        (similarOnly && groupName.endsWith('_s')) ||
        (!altOnly && !similarOnly)
      ))
        newSelectedGroups.push(groupName);
    });
    this.setState({errMsg: '', selectedGroups: newSelectedGroups});
  }

  selectNone(whichKana, altOnly=false, similarOnly=false) {
    let newSelectedGroups = [];
    this.state.selectedGroups.forEach(groupName => {
      let mustBeRemoved = false;
      Object.keys(kanaDictionary[whichKana]).forEach(removableGroupName => {
        if(removableGroupName === groupName && (
          (altOnly && groupName.endsWith('_a')) ||
          (similarOnly && groupName.endsWith('_s')) ||
          (!altOnly && !similarOnly)
        ))
          mustBeRemoved = true;
      });
      if(!mustBeRemoved)
        newSelectedGroups.push(groupName);
    });
    this.setState({selectedGroups: newSelectedGroups});
  }

  toggleAlternative(whichKana, postfix) {
    let show = postfix == '_a' ? this.state.showAlternatives : this.state.showSimilars;
    const idx = show.indexOf(whichKana);
    if(idx >= 0)
      show.splice(idx, 1);
    else
      show.push(whichKana)
    if(postfix == '_a')
      this.setState({showAlternatives: show});
    if(postfix == '_s')
      this.setState({showSimilars: show});
  }

  getSelectedAlternatives(whichKana, postfix) {
    return this.state.selectedGroups.filter(groupName => {
      return groupName.startsWith(whichKana == 'hiragana' ? 'h_' : 'k_') &&
        groupName.endsWith(postfix);
    }).length;
  }

  getAmountOfAlternatives(whichKana, postfix) {
    return Object.keys(kanaDictionary[whichKana]).filter(groupName => {
      return groupName.endsWith(postfix);
    }).length;
  }

  alternativeToggleRow(whichKana, postfix, show) {
    let checkBtn = "glyphicon glyphicon-small glyphicon-"
    let status;
    if(this.getSelectedAlternatives(whichKana, postfix) >= this.getAmountOfAlternatives(whichKana, postfix))
      status = 'check';
    else if(this.getSelectedAlternatives(whichKana, postfix) > 0)
      status = 'check half';
    else
      status = 'unchecked'
    checkBtn += status

    return <div
      key={'alt_toggle_' + whichKana + postfix}
      onClick={() => this.toggleAlternative(whichKana, postfix)}
      className="choose-row"
    >
      <span
        className={checkBtn}
        onClick={ e => {
          if(status == 'check')
            this.selectNone(whichKana, postfix == '_a', postfix == '_s');
          else if(status == 'check half' || status == 'unchecked')
            this.selectAll(whichKana, postfix == '_a', postfix == '_s');
          e.stopPropagation();
        }}
      ></span>
      {
        show ? <span className="toggle-caret">&#9650;</span>
          : <span className="toggle-caret">&#9660;</span>
      }
      {
        postfix == '_a' ? 'Alternative characters (ga · ba · kya..)' :
          'Look-alike characters'
      }
    </div>
  }

  showGroupRows(whichKana, showAlternatives, showSimilars = false) {
    const thisKana = kanaDictionary[whichKana];
    let rows = [];
    Object.keys(thisKana).forEach((groupName, idx) => {
      if(groupName == "h_group11_a" || groupName == "k_group13_a")
        rows.push(this.alternativeToggleRow(whichKana, "_a", showAlternatives));
      if(groupName == "k_group11_s")
        rows.push(this.alternativeToggleRow(whichKana, "_s", showSimilars));

      if((!groupName.endsWith("a") || showAlternatives) &&
        (!groupName.endsWith("s") || showSimilars)) {
        rows.push(<CharacterGroup
          key={idx}
          groupName={groupName}
          selected={this.isSelected(groupName)}
          characters={thisKana[groupName].characters}
          handleToggleSelect={this.toggleSelect}
        />);
      }
    });

    return rows;
  }

  startGame() {
    if(this.state.selectedGroups.length < 1) {
      this.setState({ errMsg: 'Choose at least one group!'});
      return;
    }
    // Pass timer to parent FIRST before starting game
    if(this.props.setGameTimer) {
      this.props.setGameTimer(this.state.selectedTimer);
    }
    this.props.handleStartGame(this.state.selectedGroups);
  }

  toggleKanjiPages = () => {
    this.setState({ showKanjiPages: !this.state.showKanjiPages, errMsg: '' });
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
    return (
      <div className="choose-characters">
        <div className="row">
          <div className="col-xs-12">
            <div className="panel panel-default">
              <div className="panel-body welcome">
                <h4>Welcome to Rahaaa's quiz</h4>
                <p>Pilih huruf katakana dan hiragana yang sudah anda pelajari</p>
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-6">
            <div className="panel panel-default">
              <div className="panel-heading">Hiragana · ひらがな</div>
              <div className="panel-body selection-areas">
                {this.showGroupRows('hiragana', this.state.showAlternatives.indexOf('hiragana') >= 0)}
              </div>
              <div className="panel-footer text-center">
                <a href="javascript:;" onClick={()=>this.selectAll('hiragana')}>All</a> &nbsp;&middot;&nbsp; <a href="javascript:;"
                  onClick={()=>this.selectNone('hiragana')}>None</a>
                &nbsp;&middot;&nbsp; <a href="javascript:;" onClick={()=>this.selectAll('hiragana', true)}>All alternative</a>
                &nbsp;&middot;&nbsp; <a href="javascript:;" onClick={()=>this.selectNone('hiragana', true)}>No alternative</a>
              </div>
            </div>
          </div>
          <div className="col-sm-6">
            <div className="panel panel-default">
              <div className="panel-heading">Katakana · カタカナ</div>
              <div className="panel-body selection-areas">
                {this.showGroupRows('katakana', this.state.showAlternatives.indexOf('katakana') >= 0, this.state.showSimilars.indexOf('katakana') >= 0)}
              </div>
              <div className="panel-footer text-center">
                <a href="javascript:;" onClick={()=>this.selectAll('katakana')}>All</a> &nbsp;&middot;&nbsp; <a href="javascript:;"
                  onClick={()=>this.selectNone('katakana')}>None
                </a>
                &nbsp;&middot;&nbsp; <a href="javascript:;" onClick={()=>this.selectAll('katakana', true)}>All alternative</a>
                &nbsp;&middot;&nbsp; <a href="javascript:;" onClick={()=>this.selectNone('katakana', true)}>No alternative</a>
              </div>
            </div>
          </div>
          <div className="col-sm-3 col-xs-12">
            <div className="level5-timer-selection">
              <h5>⏱️ Level 5 Timer</h5>
              <div className="timer-buttons">
                {[5, 8, 10, 12, 13, 15].map(time => (
                  <button
                    key={time}
                    className={`timer-btn ${this.state.selectedTimer === time ? 'active' : ''}`}
                    onClick={() => this.setState({selectedTimer: time})}
                  >
                    {time}s
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="col-sm-3 col-xs-12 pull-right">
            <span className="pull-right lock">Lock to stage &nbsp;
              {
                this.props.isLocked &&
                  <input className="stage-choice" type="number" min="1" max="5" maxLength="1" size="1"
                    onChange={(e)=>{
                      const stage = parseInt(e.target.value);
                      if(stage === 5 && this.props.setGameTimer) {
                        this.props.setGameTimer(this.state.selectedTimer);
                      }
                      this.props.lockStage(stage, true);
                    }}
                    value={this.props.stage}
                  />
              }
              <Switch onClick={()=>{
                if(this.props.stage === 5 && this.props.setGameTimer) {
                  this.props.setGameTimer(this.state.selectedTimer);
                }
                this.props.lockStage(1);
              }} on={this.props.isLocked} /></span>
          </div>
          <div className="col-sm-offset-3 col-sm-6 col-xs-12 text-center">
            {
              this.state.errMsg != '' &&
                <div className="error-message">{this.state.errMsg}</div>
            }
            <button ref={c => this.startRef = c} className="btn btn-danger startgame-button" onClick={() => this.startGame()}>Mulai quiz nyaaa</button>
          </div>
          {
            this.state.showKanjiPages && (
              <div className="col-xs-12" style={{marginTop: '20px', marginBottom: '20px'}}>
                <div className="panel panel-info">
                  <div className="panel-heading" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px'}}>
                    <h4 style={{margin: 0, fontSize: '18px', fontWeight: 'bold'}}>📚 Pilih Bab Kanji</h4>
                  </div>
                  <div className="panel-body">
                    <div className="kanji-pages-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '12px', marginBottom: '20px'}}>
                      {ALL_KANJI_BAB.map((bab, idx) => {
                        const hasData = PAGES_DATA[idx].length > 0;
                        return (
                          <button
                            key={idx}
                            className={`btn ${hasData ? 'btn-primary' : 'btn-default'}`}
                            onClick={() => this.startKanjiQuiz(idx)}
                            disabled={!hasData}
                            style={{
                              padding: '12px 8px',
                              minHeight: '90px',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'center',
                              alignItems: 'center',
                              opacity: hasData ? 1 : 0.5,
                              cursor: hasData ? 'pointer' : 'not-allowed',
                              borderRadius: '6px',
                              fontSize: hasData ? '13px' : '12px',
                              transition: 'all 0.2s',
                              boxShadow: hasData ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                            }}
                            onMouseEnter={(e) => hasData && (e.target.style.transform = 'translateY(-2px)')}
                            onMouseLeave={(e) => hasData && (e.target.style.transform = 'translateY(0)')}
                          >
                            <div style={{fontSize: '15px', fontWeight: 'bold', marginBottom: '4px'}}>Bab {bab.bab}</div>
                            <div style={{fontSize: '11px', opacity: 0.8, marginBottom: '2px'}}>{bab.range}</div>
                            <div style={{fontSize: '12px', fontWeight: '600', marginTop: '4px'}}>{PAGES_DATA[idx].length} kanji</div>
                          </button>
                        );
                      })}
                    </div>
                    <div style={{borderTop: '1px solid #ddd', paddingTop: '15px'}}>
                      <button
                        className="btn btn-success btn-block"
                        onClick={this.startAllKanjiQuiz}
                        style={{marginTop: '0', padding: '12px', fontSize: '14px', fontWeight: 'bold'}}
                      >
                        🎯 Test Semua Kanji ({PAGES_DATA.reduce((sum, page) => sum + page.length, 0)} total)
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          }
          <div className="down-arrow"
            style={{display: this.state.startIsVisible ? 'none' : 'block'}}
            onClick={(e) => this.scrollToStart(e)}
          >
          </div>
        </div>
      </div>
    );
  }
}

export default ChooseCharacters;
