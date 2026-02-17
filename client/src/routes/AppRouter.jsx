import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "../components/MainLayout";

import Home from "../components/Home";
import TestSetup from "../components/TestSetup";

import GameLobby from "../components/GameLobby";
import TypingFallGame from "../components/TypingFallGame";
import LoginPage from "../components/LoginPage";
import SignUpPage from "../components/SignUpPage";
import TypingChallenge from "../components/TypingChallenge";
import SpellingQuiz from "../components/SpellingQuiz";
import TypingRaceBot from "../components/TypingRaceBot";
import LevelSelect from "../components/LevelSelect";
import UserProfileDashboard from "../components/UserProfileDashboard";
import TypingRaceLevelSelect from "../components/TypingRaceLevelSelect";
import TypingFallLevelSelect from "../components/TypingFallLevelSelect";
import LessonList_1 from "../components/LissonList_1";
import LessonStepPage_1 from "../components/LessonStepPage_1";
import ForgotPasswordPage from "../components/ForgotPasswordPage";
import ForgotPasswordSuccess from "../components/ForgotPasswordSuccess";
import ResetPasswordPage from "../components/ResetPasswordPage";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="typing-test" element={<TestSetup />} />
          <Route
            path="typing-challenge/:level/:time"
            element={<TypingChallenge />}
          />

          <Route path="minigames" element={<GameLobby />} />
          <Route path="minigames/:gameId/levels" element={<LevelSelect />} />
          <Route
            path="minigames/spelling-quiz/:levelId"
            element={<SpellingQuiz />}
          />
          <Route
            path="minigames/typing-race/level/:levelId"
            element={<TypingRaceBot />}
          />
          <Route
            path="minigames/typing-fall/:levelId"
            element={<TypingFallGame />}
          />
          <Route
            path="minigames/typing-race/levels"
            element={<TypingRaceLevelSelect />}
          />
          <Route
            path="minigames/typing-fall/levels"
            element={<TypingFallLevelSelect />}
          />

          <Route path="user-profile" element={<UserProfileDashboard />} />

          <Route path="lessons" element={<LessonList_1 />} />
          <Route path="lessons/:lessonId?" element={<LessonList_1 />} />
          <Route
            path="lessons/:lessonId/steps/:stepIndex"
            element={<LessonStepPage_1 />}
          />
        </Route>

        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route
          path="/forgot-password/success"
          element={<ForgotPasswordSuccess />}
        />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
