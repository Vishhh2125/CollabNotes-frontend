import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import { Register } from './components/Auth/Register.jsx'
import { Login } from './components/Auth/SignIn.jsx'
import { ProtectedRoute } from './components/ProtectedRoute'
import NotesList from './components/NotesList'
import WorkspaceSettings from './components/WorkspaceSettings'

function App() {
  return (
    <Routes>
      <Route path='/register' element={<Register />} />
      <Route path='/login' element={<Login />} />
      
      <Route
        path='/'
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<NotesList />} />
        <Route path='settings' element={<WorkspaceSettings />} />
      </Route>

      <Route path='*' element={<Navigate to='/' replace />} />
    </Routes>
  )
}

export default App
