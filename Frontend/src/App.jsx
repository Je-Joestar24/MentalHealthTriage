import { Outlet } from 'react-router-dom'

function App() {
  return (
    <div className="app">
      <Outlet />
      {/* 
      <Modals /> 
      */}
    </div>
  )
}

export default App