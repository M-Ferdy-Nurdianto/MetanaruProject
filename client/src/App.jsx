import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Members from './pages/Members';
import Posts from './pages/Posts';
import AfterEvent from './pages/AfterEvent';
import Cheki from './pages/Cheki';
import Checkout from './pages/Checkout';
import Admin from './pages/admin/Admin';
import Login from './pages/Login';
import AOS from 'aos';
import 'aos/dist/aos.css';

function App() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const isLogin = location.pathname === '/login';

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: false,
      mirror: true
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col selection:bg-[#FF0033] selection:text-white overflow-x-hidden relative">
      {!isAdmin && !isLogin && <Navbar />}
      
      <main className="flex-grow relative z-10">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/members" element={<Members />} />
          <Route path="/posts" element={<Posts />} />
          <Route path="/cheki" element={<Cheki />} />
          <Route path="/otsu" element={<AfterEvent />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
      
      {!isAdmin && !isLogin && <Footer />}
    </div>
  );
}

export default App;
