
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './Home';
import Search from './Search';
import Game from './Game';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Home />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/Search" element={<Search />} />
        <Route path="/:gameID" element={<Game />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;