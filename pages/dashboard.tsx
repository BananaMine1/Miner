import Header from '../components/Header';
import Dashboard from '../components/Dashboard';
import Footer from '../components/Footer';
import React from 'react';
import dynamic from 'next/dynamic';

export default dynamic(() => Promise.resolve(Dashboard), { ssr: false });
