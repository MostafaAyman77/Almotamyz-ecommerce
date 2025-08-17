import { Route, Routes } from "react-router-dom";
import "./App.css";
import HomePage from "./Pages/Home/HomePage";
import StorePage from "./Pages/Store/StorePage";
import TopHeader from "./components/Utility/Header/TopHeader";
import BottomHeader from "./components/Utility/Header/BottomHeader";
import CartProvider from "./components/context/CartContext";

function App() {
  return (
    <CartProvider>
      <header>
        <TopHeader />
        <BottomHeader />
      </header>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/store" element={<StorePage />} />
      </Routes>
    </CartProvider>
  );
}

export default App;
