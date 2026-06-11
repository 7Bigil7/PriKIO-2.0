const fs = require('fs');

const text = fs.readFileSync('campusdesign.txt', 'utf8');
const lines = text.split('\n');

// Extract CSS (Lines 181 to 693)
const cssLines = lines.slice(180, 693);
fs.appendFileSync('src/app/globals.css', '\n/* Desktop Landing Page CSS */\n' + cssLines.join('\n'));

// Extract HTML (Lines 697 to 892)
const htmlLines = lines.slice(696, 892);
let htmlString = htmlLines.join('\n');

// Convert HTML to JSX
htmlString = htmlString.replace(/class=/g, 'className=');
htmlString = htmlString.replace(/onclick=".*?"/g, ''); // Remove inline onclicks
htmlString = htmlString.replace(/style=".*?"/g, ''); // Remove inline styles for now (or convert them, but there's only one display:flex gap: 64px)
htmlString = htmlString.replace(/<!--.*?-->/g, ''); // Remove HTML comments
htmlString = htmlString.replace(/<br>/g, '<br/>');

// Add inline styles properly for the ones we removed
htmlString = htmlString.replace(/<div >/g, '<div>'); // cleanup empty tags

// Specifically fix the style="display:flex; gap: 64px; flex-wrap: wrap;" on line 850
htmlString = htmlString.replace('<div >\n      <div className="footer-links-col">', '<div style={{display:"flex", gap: "64px", flexWrap: "wrap"}}>\n      <div className="footer-links-col">');

const pageTsx = `'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LandingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSignIn = () => {
    setLoading(true)
    setTimeout(() => {
      router.push('/upload')
    }, 500)
  }

  return (
    <>
      <div className="desktop-only-landing">
        ${htmlString.replace(/Start Printing/g, '{loading ? "Loading..." : "Start Testing (Bypass Auth)"}').replace(/<button className="btn-primary" >/g, '<button className="btn-primary" onClick={handleSignIn} disabled={loading}>')}
      </div>
    </>
  )
}
`;

fs.writeFileSync('src/app/page.tsx', pageTsx);
console.log('Done!');
