import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Lender from './pages/Lender';
import Borrower from './pages/Borrower';
import Merchant from './pages/Merchant';
import LoginModal from './components/LoginModal'; 

function App() {
  const [wallet, setWallet] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("wallet_address");
    if (saved) setWallet(saved);
    setIsLoading(false);
  }, []);

  const handleLoginClick = () => {
    setShowLoginModal(true);
  };

  const handleMetaMaskConnect = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const walletAddress = accounts[0];
        setWallet(walletAddress);
        localStorage.setItem("wallet_address", walletAddress);
        setShowLoginModal(false); 
      } catch (error) {
        console.error("User denied account access or error occurred:", error);
      }
    } else {
      alert("MetaMask not detected! Please install the extension.");
    }
  };

  const handleDisconnect = () => {
    setWallet(null);
    localStorage.removeItem("wallet_address");
    window.location.href = "/"; 
  };

  if (isLoading) return null;

  return (
    <Router>
      {/* The LoginModal is placed here to overlay everything */}
      <LoginModal 
          isOpen={showLoginModal} 
          onClose={() => setShowLoginModal(false)} 
          onComplete={handleMetaMaskConnect} 
      />

      <Layout wallet={wallet} onConnect={handleLoginClick} onDisconnect={handleDisconnect}>
        <Routes>
          <Route path="/" element={<Home wallet={wallet} onConnect={handleLoginClick} />} />
          <Route path="/lender" element={wallet ? <Lender wallet={wallet} /> : <Navigate to="/" />} />
          <Route path="/borrower" element={wallet ? <Borrower wallet={wallet} /> : <Navigate to="/" />} />
          <Route path="/merchant" element={wallet ? <Merchant wallet={wallet} /> : <Navigate to="/" />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;