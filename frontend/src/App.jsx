import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { attachRipple } from './lib/ripple.js';
import { CompareProvider } from './context/CompareContext.jsx';
import { ProductsProvider } from './context/ProductsContext.jsx';
import { AdminProvider, AdminGate } from './context/AdminContext.jsx';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import CategoryPage from './pages/CategoryPage.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import AdminProducts from './pages/AdminProducts.jsx';
import AdminOrders from './pages/AdminOrders.jsx';
import AdminReminders from './pages/AdminReminders.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import ChatWidget from './components/ChatWidget.jsx';
import AIDiagnosticChat from './components/AIDiagnosticChat.jsx';
import CompareBar from './components/CompareBar.jsx';
import AdminReviews from './pages/AdminReviews.jsx';
import AdminMessages from './pages/AdminMessages.jsx';

export default function App() {
  useEffect(() => {
    attachRipple();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    const timeout = setTimeout(() => {
      const els = document.querySelectorAll('.reveal');
      els.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const alreadyVisible = rect.top < window.innerHeight && rect.bottom > 0;
        if (alreadyVisible) {
          el.classList.add('visible');
        } else {
          observer.observe(el);
        }
      });
    }, 50);

    return () => {
      clearTimeout(timeout);
      observer.disconnect();
    };
  }, []);

  return (
    <AdminProvider>
      <ProductsProvider>
        <CompareProvider>
          <Navbar />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/categorie/:slug" element={<CategoryPage />} />
            <Route path="/commande" element={<CheckoutPage />} />

            <Route path="/admin" element={<AdminGate><AdminDashboard /></AdminGate>} />
            <Route path="/admin/produits" element={<AdminGate><AdminProducts /></AdminGate>} />
            <Route path="/admin/commandes" element={<AdminGate><AdminOrders /></AdminGate>} />
            <Route path="/admin/rappels" element={<AdminGate><AdminReminders /></AdminGate>} />
            <Route path="/admin/avis" element={<AdminGate><AdminReviews /></AdminGate>} />
            <Route path="/admin/messages" element={<AdminGate><AdminMessages /></AdminGate>} />
          </Routes>

          <CartDrawer />
          <ChatWidget />
          <AIDiagnosticChat />
          <CompareBar />
        </CompareProvider>
      </ProductsProvider>
    </AdminProvider>
  );
}