import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import HomePage from './pages/HomePage'
import GamePage from './pages/GamePage'
import GameLobby from './pages/GameLobby'
import GameWaitingRoom from './pages/GameWaitingRoom'
import DebugAuth from './pages/DebugAuth'
import ProfileSetup from './pages/ProfileSetup'
import TestGameBoard from './pages/TestGameBoard'

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/profile-setup"
            element={
              <ProtectedRoute>
                <ProfileSetup />
              </ProtectedRoute>
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lobby"
            element={
              <ProtectedRoute>
                <GameLobby />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lobby/:gameId"
            element={
              <ProtectedRoute>
                <GameWaitingRoom />
              </ProtectedRoute>
            }
          />
          <Route
            path="/game/:gameId"
            element={
              <ProtectedRoute>
                <GamePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/debug"
            element={
              <ProtectedRoute>
                <DebugAuth />
              </ProtectedRoute>
            }
          />
          <Route
            path="/test-game-board"
            element={<TestGameBoard />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
