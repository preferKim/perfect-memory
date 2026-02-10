import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Screen components
import SubjectScreen from './screens/SubjectScreen';
import EnglishSelectionScreen from './screens/EnglishSelectionScreen';
import AlphabetStudyScreen from './screens/AlphabetStudyScreen';
import KoreanSelectionScreen from './screens/KoreanSelectionScreen';
import MathSelectionScreen from './screens/MathSelectionScreen';
import SocialSelectionScreen from './screens/SocialSelectionScreen';
import ScienceSelectionScreen from './screens/ScienceSelectionScreen';
import ObjectiveScreen from './screens/ObjectiveScreen';
import GameScreen from './screens/GameScreen';
import RankingScreen from './screens/RankingScreen';
import KoreanGrammarScreen from './screens/KoreanGrammarScreen';
import GrammarQuiz from './components/games/GrammarQuiz';
import LiteraryTermsScreen from './screens/LiteraryTermsScreen';
import LiteraryTermsQuiz from './screens/LiteraryTermsQuiz';
import SocialQuizScreen from './screens/SocialQuizScreen';
import ScienceQuizScreen from './screens/ScienceQuizScreen';
import SpellingGame from './components/games/SpellingGame';
import SpacingGame from './components/games/SpacingGame';
import ChosungGame from './components/games/ChosungGame';
import ChosungResultScreen from './screens/ChosungResultScreen';
import MathGameScreen from './screens/MathGameScreen';
import DashboardScreen from './screens/DashboardScreen';

import WrongAnswerScreen from './screens/WrongAnswerScreen';
import CertificateSelectionScreen from './screens/CertificateSelectionScreen';
import AwsSelectionScreen from './screens/AwsSelectionScreen';
import CertificateQuizScreen from './screens/CertificateQuizScreen';

// Playground components
import ClickerGame from './screens/playground/ClickerGame';
import TypingGame from './screens/playground/TypingGame';
import GuessingGame from './screens/playground/GuessingGame';
import PuzzleGame from './components/games/PuzzleGame';

// General components
import ShareButton from './components/ShareButton';
import LevelUpNotification from './components/LevelUpNotification';


// NOTE: This is a major refactor. The original App.jsx was a single large component
// that handled all state and screen transitions. It has been replaced with a router-based
// system. State and logic from the old App.jsx will need to be moved into the individual
// screen components or shared contexts.

function App() {
  return (
    <div className="w-full min-h-screen items-center justify-center overflow-x-hidden">
      <div className="max-w-2xl w-full h-full">
        <Routes>
          {/* Main Subjects */}
          <Route path="/" element={<SubjectScreen />} />
          <Route path="/english" element={<EnglishSelectionScreen />} />
          <Route path="/english/alphabet" element={<AlphabetStudyScreen />} />
          <Route path="/math" element={<MathSelectionScreen />} />
          <Route path="/math/:tab" element={<MathSelectionScreen />} />
          <Route path="/korean" element={<KoreanSelectionScreen />} />
          <Route path="/social" element={<SocialSelectionScreen />} />
          <Route path="/social/:difficulty" element={<SocialQuizScreen />} />
          <Route path="/science" element={<ScienceSelectionScreen />} />

          <Route path="/science/:difficulty" element={<ScienceQuizScreen />} />

          {/* Certificate */}
          <Route path="/certificate" element={<CertificateSelectionScreen />} />
          <Route path="/certificate/aws" element={<AwsSelectionScreen />} />
          <Route path="/certificate/quiz" element={<CertificateQuizScreen />} />

          {/* Math */}
          <Route path="/math/jsj50day/:lectureId" element={<ObjectiveScreen />} />
          <Route path="/math/game" element={<MathGameScreen />} />

          {/* Korean */}
          <Route path="/korean/grammar" element={<KoreanGrammarScreen />} />
          <Route path="/korean/grammar-quiz" element={<GrammarQuiz />} />
          <Route path="/korean/literary-terms" element={<LiteraryTermsScreen />} />
          <Route path="/korean/literary-terms-quiz" element={<LiteraryTermsQuiz />} />
          <Route path="/korean/spelling" element={<SpellingGame />} />
          <Route path="/korean/spacing" element={<SpacingGame />} />
          <Route path="/korean/chosung" element={<ChosungGame />} />
          <Route path="/korean/chosung-result" element={<ChosungResultScreen />} />

          <Route path="/game" element={<GameScreen />} />
          <Route path="/results" element={<RankingScreen />} />
          <Route path="/dashboard" element={<DashboardScreen />} />
          <Route path="/wrong-answer" element={<WrongAnswerScreen />} />

          {/* Playground */}
          <Route path="/playground/clicker" element={<ClickerGame />} />
          <Route path="/playground/typing" element={<TypingGame />} />
          <Route path="/playground/guessing" element={<GuessingGame />} />
          <Route path="/playground/puzzle" element={<PuzzleGame />} />

        </Routes>
      </div>
      <ShareButton />
      <LevelUpNotification />
    </div>
  );
}

export default App;