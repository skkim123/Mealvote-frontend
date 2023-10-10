import { Routes, Route } from "react-router-dom";
import Home from './Home';
import Votepage from './Votepage';
import VoteResult from "./VoteResult";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/votepage/:roomID" element={<Votepage/>}/>
      <Route path="/voteresult/:roomID" element={<VoteResult/>}/>
    </Routes>
  );
}

export default App;
