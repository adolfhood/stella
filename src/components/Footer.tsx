import React from "react";

export default function Footer() {
  return (
    <footer className="bg-white text-center py-4 shadow-inner">
      <p className="text-gray-600">
        &copy; {new Date().getFullYear()} Stella. All rights reserved.
      </p>
    </footer>
  );
}
