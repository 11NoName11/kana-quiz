# Kana Quiz - Level 4 & 5 Analysis System Documentation

## 📋 Overview

Sistem analisis hasil quiz khusus untuk **Level 4 & Level 5** saat **Mode Lock** aktif. Fitur ini menampilkan analisis detail real-time setelah user menyelesaikan quiz.

## 🎯 Fitur Utama

### 1. **Quiz Lock Behavior**
- Mode Lock dapat diaktifkan pada setiap level
- Level 4 & 5 dengan Mode Lock → User harus menyelesaikan semua 20 soal
- Tidak bisa pindah level sebelum selesai
- Tidak ada tombol "Stage Up" selama Mode Lock aktif

### 2. **Hasil Analisis Komprehensif**

#### Overview Tab:
- Total soal: jumlah keseluruhan soal yang dijawab
- Jawaban Benar: count jawaban correct
- Jawaban Salah: count jawaban wrong
- Persentase Akurasi: accuracy percentage (benar / total)
- Waktu Pengerjaan: durasi dari start hingga selesai
- Jenis Huruf: jumlah unique kana yang ditanya

#### Per-Kana Statistics Tab:
- Grid view semua kana yang ditanya
- Untuk setiap kana:
  - Display karakter
  - Benar / Salah / Total count
  - Accuracy percentage dengan color-coded bar
  - Sort by: Accuracy atau Frequency

#### Area Peningkatan Tab:
- **Huruf yang Sering Salah** (Top 5):
  - Ranked list dengan error rate
  - Button "Ulangi Huruf yang Salah"
  
- **Huruf yang Sudah Dikuasai** (100% accuracy):
  - Badges dengan jumlah kali benar

### 3. **Evaluasi Otomatis**

Berdasarkan accuracy percentage:
- **90-100%** → "Sudah Lancar" (Green)
- **70-89%** → "Cukup Bagus" (Light Green)
- **50-69%** → "Perlu Latihan" (Yellow)
- **<50%** → "Harus Diulang" (Red)

### 4. **UI/UX Modern**

- Responsive design (mobile, tablet, desktop)
- Smooth animations & transitions
- SVG accuracy circle untuk visual appeal
- Color-coded statistics
- Interactive tabs
- Professional gradient backgrounds

## 🔧 Technical Implementation

### File Structure

```
src/
├── data/
│   └── quizAnalysisUtils.js         (Utility functions)
├── components/
│   └── Game/
│       ├── Game.jsx                 (Modified)
│       ├── Question.jsx             (Modified)
│       ├── QuizResultAnalysis.jsx   (New)
│       ├── QuizResultAnalysis.scss  (New)
│       └── Question.scss            (Modified)
```

### Key Components

#### 1. **quizAnalysisUtils.js**

Exported functions:
- `calculateAccuracy(correct, total)` - Returns percentage
- `getEvaluationMessage(accuracy)` - Returns {message, level}
- `calculateKanaStats(answerHistory)` - Returns kana stats object
- `getMostDifficultChars(kanaStats)` - Returns top 5
- `getMasteredChars(kanaStats)` - Returns 100% accuracy chars
- `generateQuizReport(answerHistory, timeSpent)` - Returns comprehensive report
- `saveQuizReport(report, stage, groups)` - Save to localStorage
- `formatTime(seconds)` - Returns formatted time string

#### 2. **QuizResultAnalysis.jsx**

Props:
```js
{
  report: {          // Generated from generateQuizReport()
    totalQuestions,
    correctAnswers,
    wrongAnswers,
    overallAccuracy,
    evaluation: {message, level},
    timeSpent,
    kanaStats,      // All kana with stats
    uniqueKanaCount,
    mostDifficultChars,
    masteredChars,
    needPracticeChars
  },
  onClose,           // Callback when "Kembali ke Menu"
  onRetry,          // Callback when "Ulangi Level"
  onRetryDifficult  // Callback when "Ulangi Huruf yang Salah"
}
```

#### 3. **Question.jsx Changes**

New state properties:
```js
state = {
  // ... existing properties ...
  answerHistory: [],          // Track per-answer data
  quizStartTime: Date.now(),  // For time calculation
  isQuizComplete: false       // Trigger result modal
}
```

Answer history format:
```js
{
  kanaList: [kana1, kana2, ...],  // Array of kana in question
  answer: "user_answer",           // User's input
  isCorrect: true/false,           // Correctness
  timestamp: Date.now()            // When answered
}
```

#### 4. **Game.jsx Changes**

New state:
```js
state = {
  showScreen: '',    // 'stage', 'question', 'result'
  quizReport: null   // Store quiz report data
}
```

New methods:
- `handleQuizComplete(report)` - Triggered from Question
- `handleRetryQuiz()` - Reset and go to stage screen
- `handleBackToMenu()` - End game and go to menu
- `handleRetryDifficult()` - Retry with difficult chars

## 📊 Data Flow

```
User selects Level 4/5 + Mode Lock
         ↓
Question.jsx tracks every answer in answerHistory[]
         ↓
After 20 answers:
- Question.jsx generates report from answerHistory
- Calls this.props.onQuizComplete(report)
         ↓
Game.jsx receives report
- Sets state.showScreen = 'result'
- Sets state.quizReport = report
         ↓
QuizResultAnalysis modal renders with data
         ↓
User actions:
- Kembali ke Menu → handleBackToMenu()
- Ulangi Level → handleRetryQuiz()
- Ulangi Huruf Salah → handleRetryDifficult()
```

## 💾 LocalStorage

Quiz results are automatically saved to localStorage:

Key: `quizHistory`
Format: Array of records with:
```js
{
  timestamp: ISO string,
  stage: number,
  decidedGroups: array,
  report: {...},
  sessionId: number
}
```

Max 20 records kept (oldest are removed)

## 🚀 Usage

### For Users:

1. Go to Quiz Settings
2. Select Level 4 or Level 5
3. Toggle "Mode Lock" ON
4. Start Quiz
5. Answer all 20 questions
6. View detailed analysis when done
7. Choose: Retry, Go Back, or Retry Difficult Chars

### For Developers:

#### Adding new metric:

1. Update `calculateKanaStats()` in quizAnalysisUtils.js
2. Add new stats to returned object
3. Update `generateQuizReport()` to include new metric
4. Add UI in QuizResultAnalysis.jsx

#### Customizing evaluation levels:

Edit `getEvaluationMessage()` in quizAnalysisUtils.js:
```js
export const getEvaluationMessage = (accuracy) => {
  if (accuracy >= 95) return { message: 'Perfect!', level: 'perfect' };
  // ... etc
}
```

#### Styling changes:

QuizResultAnalysis.scss uses:
- CSS Grid for responsive layouts
- CSS Variables for easy theme changes
- Flexbox for flexible layouts
- Gradient backgrounds

## ✅ Testing Checklist

- [ ] Mode Lock toggle works
- [ ] Level 4 & 5 quiz completes after 20 questions
- [ ] Result modal appears automatically
- [ ] Statistics calculated correctly
- [ ] Accuracy percentage matches manual calculation
- [ ] Evaluation message shows correct level
- [ ] UI responsive on mobile (320px width)
- [ ] UI responsive on tablet (768px width)
- [ ] UI responsive on desktop (1024px+ width)
- [ ] localStorage saves history
- [ ] All buttons work correctly
- [ ] Animations smooth
- [ ] No console errors

## 🔍 Debugging

### Common Issues:

1. **Result modal not showing:**
   - Check `isLocked` prop is true
   - Check `stage` is 4 or 5
   - Check console for errors in `handleAnswer()`

2. **Statistics incorrect:**
   - Verify `answerHistory` array has correct format
   - Check `calculateAccuracy()` math
   - Trace through `calculateKanaStats()` logic

3. **localStorage not working:**
   - Check browser allows localStorage
   - Verify `saveQuizReport()` is called
   - Check DevTools Application tab

4. **Styling issues:**
   - Verify QuizResultAnalysis.scss imported correctly
   - Check for CSS conflicts with existing styles
   - Use DevTools Inspector to debug

## 📝 Future Enhancements

- [ ] Export results as PDF
- [ ] Compare with previous quiz results (trend analysis)
- [ ] Specific difficulty cards for each kana
- [ ] Sound effects for completion
- [ ] Share results social media
- [ ] Badge system (achievements)
- [ ] Spaced repetition based on accuracy
- [ ] AI-powered recommendations
- [ ] Multi-language support
