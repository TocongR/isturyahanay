import { BrowserRouter, Routes, Route } from "react-router-dom";
import Chat from "./Chat";
import Admin from "./Admin";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Chat />} />
        <Route path="/admin-9xk2p" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;