import React from 'react';
import dynamic from 'next/dynamic';
import Header from '../components/Header';
import Footer from '../components/Footer';

function Dashboard() {
  return (
    <div className="min-h-screen bg-green-950 text-yellow-50 flex flex-col">
      <Header />
      {/* ... your dashboard content ... */}
      <Footer />
    </div>
  );
}

export default dynamic(() => Promise.resolve(Dashboard), { ssr: false });
