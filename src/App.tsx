import { Routes, Route, Navigate } from 'react-router-dom'
import { SignIn } from './pages/SignIn'
import { SignUp } from './pages/SignUp'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/" element={<Navigate to="/signin" replace />} />
    </Routes>
  )
}

export default App
