import { Route, Routes } from "react-router-dom";
import "./App.css";
import Login from "./Pages/Auth/Login/Login";
import Register from "./Pages/Auth/Register/Register";
import Home from "./Pages/Auth/Home/Home";

function App() {
  return (
    <>
      <h1>app</h1>
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/login" element={<Login />}></Route>
        <Route path="/register" element={<Register />}></Route>
      </Routes>
    </>
  );
}

export default App;
