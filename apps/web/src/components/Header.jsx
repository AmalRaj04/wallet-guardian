'use client';
import { Moon, Sun } from 'lucide-react';

export default function Header({ isDarkMode, setIsDarkMode }) {
  return (
    <header className="relative z-20">
      <div className="backdrop-blur-md bg-white/10 border-b border-white/20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="text-xl font-bold text-white font-[family-name:Space_Grotesk]">
              CoinScope
            </span>
          </div>
          
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-full backdrop-blur-sm bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-300 hover:scale-105"
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-yellow-400" />
            ) : (
              <Moon className="w-5 h-5 text-blue-400" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}