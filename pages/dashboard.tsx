import Header from '../components/Header';
import Dashboard from '../components/Dashboard';
import Footer from '../components/Footer';
import React from 'react';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-green-950 text-yellow-50 flex flex-col">
      <Header />
      <Dashboard />
      <Footer />
    </div>
  );
}
