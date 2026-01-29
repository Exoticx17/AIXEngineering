import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/dashboard';

function App() {
  return (
    <div className="App">
      <Router>
      <div className="routes">
        <Routes>
          <Route exact path="/" element={<Dashboard />} />
        </Routes>
      </div>
      </Router>
    </div>
  );
}

export default App;