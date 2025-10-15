import { Outlet } from 'react-router-dom'
import Navbar from './components/header/Navbar'

function App() {
  return (
    <>
      <div>
        <Navbar />

        <main>
          <Outlet />
        </main>{/* 
        <Modals /> */}
        <footer>
          <small>© 2025 Mental Health Triage App</small>
        </footer>
      </div>
    </>
  )
}

export default App