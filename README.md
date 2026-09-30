# ⚡️ MindSprint

> **"Think Fast • Train Your Brain • Have Fun"**

[![Platform](https://img.shields.io/badge/Platform-Web%20(HTML5%20%7C%20CSS3%20%7C%20Vanilla%20JS)-6366f1.svg)](https://github.com)
[![Status](https://img.shields.io/badge/Status-Fully%20Functional%20%26%20Complete-10b981.svg)](https://github.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A complete, modern, professional, and responsive web-based brain-training and mind-exercise gaming platform built with pure **HTML5, CSS3, and Vanilla JavaScript**.

Designed with clean glassmorphic aesthetics, zero external heavy frameworks, Web Audio API sound synthesis, and automated LocalStorage progress tracking.

---

## 🌟 Key Features

- **🎮 12 Fully Functional Brain Games**: Complete games spanning Memory, Logic, Focus, Speed, Math, and Word skills.
- **📅 Daily Challenge Mode**: 5 targeted exercises generated deterministically each day based on the calendar date, with bonus streak rewards.
- **🧠 Dynamic Brain Profile**: Tracks your cognitive metrics across 5 domains (Memory, Logic, Focus, Speed, Accuracy) calculated purely from active gameplay.
- **🔥 Habit & Streak Tracking**: Automatic calendar-based workout streak tracking with milestone badges.
- **🎨 Dual Premium Themes**: Instant toggle between sleek **Dark Mode** (slate & glowing neon) and vibrant **Light Mode**, with saved preferences.
- **✨ Animated Particle Canvas**: Interactive floating neural nodes and connection lines that gently respond to mouse motion (with toggle setting).
- **🔊 Web Audio API Synthesizer**: Low-latency, pleasant sound effects synthesized in real time (zero missing audio files, zero CORS issues).
- **🌿 Relax Mode vs. ⚡️ Challenge Mode**: Toggle Relax Mode to play at your own pace without strict countdown timers or life limits.
- **📱 100% Responsive Design**: Touch-friendly buttons, mobile bottom navigation bar, tablet grid layouts, and desktop widescreen optimization.
- **💾 LocalStorage Engine**: Automatically preserves your high scores, best reaction times, total points, streak, and preferences across browser sessions.

---

## 🎮 The 12 Cognitive Exercises

| # | Game | Category | Description |
|---|---|---|---|
| 1 | **Number Pattern** | 💡 Logic | Deduce mathematical sequences (arithmetic, geometric, fibonacci, alternating) and pick the missing value. |
| 2 | **Memory Sequence** | 🧠 Memory | Memorize flashing sequences of colorful icons and reproduce them in identical order. |
| 3 | **Find The Different** | 🎯 Focus | Spot the subtle odd emoji or symbol out from an expanding grid (3×3 to 6×6). |
| 4 | **Quick Math** | 💡 Logic / Math | Rapid mental arithmetic under time pressure (+, -, ×, ÷, and multi-step mixed brackets). |
| 5 | **Reaction Test** | ⚡️ Speed | Measure visual motor reflexes down to the exact millisecond with false-start detection. |
| 6 | **Word Scramble** | 🔤 Word | Anagram puzzle across categories like Animals, Food, Technology, and Nature. |
| 7 | **Memory Match** | 🧠 Memory | Classic 3D card-flipping concentration workout with 4 to 8 pairs. |
| 8 | **Logic Puzzle** | 💡 Logic | Deductive reasoning questions, syllogisms, relative rankings, and situational logic. |
| 9 | **Focus Challenge** | 🎯 Focus | Filter visual noise and tap designated target bubbles amidst moving, bouncing distractors. |
| 10 | **Odd Color** | 🎯 Focus | Discern the single square with a subtle hue/lightness difference that narrows every round. |
| 11 | **Number Memory** | 🧠 Memory | Memorize multi-digit numbers flashed on screen and recall them via on-screen pad or keyboard. |
| 12 | **Typing Speed** | ⚡️ Speed | Test typing words per minute (WPM), keystroke accuracy, and error counts on curated neuroscience quotes. |
| 13 | **Mind Duel (1v1 Battle)** | ⚔️ Battle | Real-time 1v1 cognitive battle! Play vs Computer (AI) with 3 difficulty levels, or play 2 Players head-to-head on the same device across 5 rapid mental clashes. |

---

## 📁 Project File Structure

```text
MindSprint/
│
├── index.html                  # Master application shell & SPA views
├── README.md                   # Project documentation & guidelines
│
├── css/
│   ├── themes.css              # Dark & Light design tokens, color palettes
│   ├── style.css               # Core styling, layouts, components, cards, modals
│   ├── games.css               # Game-specific board layouts, grids, tiles, animations
│   └── responsive.css          # Mobile bottom navbar, breakpoints, accessibility
│
├── js/
│   ├── storage.js              # Safe LocalStorage wrapper, state management
│   ├── sound.js                # Web Audio API sound synthesizer
│   ├── background.js           # Floating particles canvas background
│   ├── navigation.js           # SPA hash routing & view transitions
│   ├── score.js                # Scoring rules, combos, brain profile computation
│   ├── dailyChallenge.js       # Date-seeded daily challenge system
│   ├── gamesEngine.js          # Modal orchestrator, timers, lives, HUD, confetti
│   ├── app.js                  # Main controller, catalog filters, settings bindings
│   │
│   └── games/
│       ├── numberPattern.js    # Game 1: Number sequence patterns
│       ├── memorySequence.js   # Game 2: Flashing icon sequence recall
│       ├── findDifferent.js    # Game 3: Odd emoji spotter
│       ├── quickMath.js        # Game 4: Rapid arithmetic equations
│       ├── reactionTest.js     # Game 5: Millisecond reflex test
│       ├── wordScramble.js     # Game 6: Thematic anagram builder
│       ├── memoryMatch.js      # Game 7: 3D card flip matching
│       ├── logicPuzzle.js      # Game 8: Analytical reasoning scenarios
│       ├── focusChallenge.js   # Game 9: Dynamic moving targets arena
│       ├── oddColor.js         # Game 10: Subtle shade nuance detector
│       ├── numberMemory.js     # Game 11: Digit span working memory
│       ├── typingSpeed.js      # Game 12: Real-time WPM typing speed
│       └── mindDuel.js         # Game 13: 1v1 Battle (vs Computer AI & 2 Players)
```

---

## 🛠️ Technologies Used

- **HTML5**: Semantic tags (`<header>`, `<nav>`, `<main>`, `<section>`), canvas elements, accessibility ARIA roles.
- **CSS3**:
  - CSS Custom Properties (Variables) for instant theme switching
  - Flexbox and CSS Grid layouts
  - Glassmorphism (`backdrop-filter: blur()`)
  - 3D Transforms (`perspective`, `transform-style: preserve-3d`)
  - Smooth keyframe animations (`pulse`, `shake`, `slideDown`)
- **Vanilla JavaScript (ES6+)**:
  - Class-based modular architecture
  - Web Audio API (`AudioContext`, `OscillatorNode`, `GainNode`)
  - HTML5 Canvas 2D API for background particles & victory confetti
  - Web Storage API (`localStorage`)
  - Real-time DOM manipulation and event delegation

---

## 🚀 How to Run Locally

Because MindSprint uses pure Vanilla HTML5, CSS3, and JavaScript with zero build dependencies, you can run it immediately on any machine:

### Option 1: Direct File Opening
Double-click `index.html` in your file explorer to open it in your favorite modern browser (Chrome, Edge, Firefox, Safari).

### Option 2: Local HTTP Server (Recommended)
Using Python:
```bash
# In the MindSprint project root:
python -m http.server 8000
```
Then navigate to `http://localhost:8000` in your browser.

Using Node / npx:
```bash
npx serve .
```

---

## 📸 Screenshots & Previews

*(Place screenshots here when showcasing the project)*

- **Dashboard / Home**: Glowing metrics, category shortcuts, dynamic hero banner.
- **Game Arena**: Active HUD with timer pill, lives counter, combo streak multiplier, and star rating.
- **Brain Profile**: 5-domain cognitive score breakdown and performance recommendations.
- **Daily Challenge**: 5 daily targeted workouts with completion checklist.

---

## 🔮 Future Enhancements

- [ ] Exportable Brain Fitness Report (PDF / Image summary).
- [ ] Multiple user profiles on the same device.
- [ ] Sound themes (classic retro 8-bit, zen ambient chimes, sci-fi synth).
- [ ] Additional cognitive exercises (Stroop test, spatial rotation, verbal analogies).

---

## 👤 Author

Developed as an advanced SEM-5 Engineering project showcasing modern frontend development, state management, cognitive game mechanics, and responsive web design.
