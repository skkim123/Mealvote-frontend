import { Routes, Route } from "react-router-dom";
import Home from './Home';
import Votepage from './Votepage';
import VoteResult from "./VoteResult";
import PageNotFound from "./PageNotFound";

function App() {
  return (
    <div className="relative">
      <div className="absolute left-[50%] translate-x-[-50%] border rounded-[8px] mt-[48px] px-[24px] pt-[32px] py-[48px] shadow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/votepage/:roomID" element={<Votepage />} />
          <Route path="/voteresult/:roomID" element={<VoteResult />} />
          <Route path="*" element={<PageNotFound/>} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
