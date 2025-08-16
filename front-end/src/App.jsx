import { Route, Routes } from "react-router-dom";
import "./App.css";
import HomePage from "./Pages/Home/HomePage";
import StorePage from "./Pages/Store/StorePage";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />}></Route>
        <Route path="/store" element={<StorePage />}></Route>
      </Routes>
    </>
  );
}

export default App;
