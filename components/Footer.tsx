import React from 'react';

export default function Footer() {
  return (
    <footer className="text-center text-offWhite mt-8 pb-6 text-sm opacity-75">
      &copy; {new Date().getFullYear()} Banana Miners. All rights reserved.
    </footer>
  );
}
