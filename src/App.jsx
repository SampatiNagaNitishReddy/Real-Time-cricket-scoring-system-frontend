import { useState } from 'react'
import AppRoutes from './routes/AppRoutes'
import './App.css'
import Navbar from './components/common/Navbar'
import { useAuth } from './context/AuthContext'
function App() {
   const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <>
    <Navbar />
  <AppRoutes/>
  </>
)
}

export default App
