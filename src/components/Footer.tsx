import React from "react";

export default function Footer() {
  return (
    <footer className="bg-primary text-center py-4 shadow-inner">
      <p className="text-primary-foreground">
        &copy; {new Date().getFullYear()} Stella. All rights reserved.
      </p>
    </footer>
  );
}
