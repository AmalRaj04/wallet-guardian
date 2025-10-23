'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-bold text-white">404</h1>
        <h2 className="text-2xl font-semibold text-gray-300">Page Not Found</h2>
        <p className="text-gray-400 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}