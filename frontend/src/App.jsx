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
  
  // NEW: A safety lock so the router doesn't kick you out while switching
  const [isSwitching, setIsSwitching] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("wallet_address");
    if (saved) setWallet(saved);
    setIsLoading(false);

    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
          setWallet(accounts[0]);
          localStorage.setItem("wallet_address", accounts[0]);
        } else {
          // Only disconnect if we aren't manually switching
          if (!isSwitching) handleDisconnect();
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      return () => {
        if(window.ethereum.removeListener) {
            window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
      };
    }
  }, [isSwitching]); // Dependency added

  const handleLoginClick = () => {
    setShowLoginModal(true);
  };

  const handleMetaMaskConnect = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setWallet(accounts[0]);
        localStorage.setItem("wallet_address", accounts[0]);
        setShowLoginModal(false); 
      } catch (error) {
        console.error("Connection failed:", error);
      }
    } else {
      alert("MetaMask not detected!");
    }
  };

  // --- THE LOGIC THAT FIXES THE ISSUE ---
  const handleSwitchWallet = async () => {
    // 1. Turn on the Safety Lock
    setIsSwitching(true);
    
    try {
      // 2. Force the "Select Account" popup
      await window.ethereum.request({
        method: "wallet_requestPermissions",
        params: [{ eth_accounts: {} }],
      });

      // 3. Get the new account
      const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
      });
      
      // 4. Update the wallet
      setWallet(accounts[0]);
      localStorage.setItem("wallet_address", accounts[0]);
      
    } catch (error) {
      console.log("Switch cancelled.");
    } finally {
      // 5. Turn off the Safety Lock
      setIsSwitching(false);
    }
  };

  const handleDisconnect = () => {
    setWallet(null);
    localStorage.removeItem("wallet_address");
    window.location.href = "/"; 
  };

  if (isLoading) return null;

  // Helper to determine if user is allowed on protected pages
  // They are allowed if they have a wallet OR if they are currently switching
  const isAuthenticated = wallet !== null || isSwitching;

  return (
    <Router>
      <LoginModal 
          isOpen={showLoginModal} 
          onClose={() => setShowLoginModal(false)} 
          onComplete={handleMetaMaskConnect} 
      />

      <Layout 
        wallet={wallet} 
        onConnect={handleLoginClick} 
        onDisconnect={handleDisconnect}
        onSwitchWallet={handleSwitchWallet}
      >
        <Routes>
          <Route path="/" element={<Home wallet={wallet} onConnect={handleLoginClick} />} />
          
          {/* UPDATED ROUTES: Logic checks isAuthenticated instead of just wallet */}
          <Route path="/lender" element={isAuthenticated ? <Lender wallet={wallet} /> : <Navigate to="/" />} />
          <Route path="/borrower" element={isAuthenticated ? <Borrower wallet={wallet} /> : <Navigate to="/" />} />
          <Route path="/merchant" element={isAuthenticated ? <Merchant wallet={wallet} /> : <Navigate to="/" />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;