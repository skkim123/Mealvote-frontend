import { Routes, Route } from "react-router-dom";
import Home from './Home';
import Votepage from './Votepage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/votepage/:roomID" element={<Votepage/>}/>
    </Routes>
  );
}

export default App;
