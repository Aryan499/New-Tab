"use client";
import React, { useState, useEffect } from 'react';
import allQuotes from '@/data/quotes.json';
import { Quote } from '@/types/Quote.types'; 



const Quotes = () => {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (allQuotes.length > 0) {
      const randomIndex = Math.floor(Math.random() * allQuotes.length);
      setQuote(allQuotes[randomIndex]);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <p className="text-white text-center">Loading quote...</p>;
  }

  if (!quote) {
    return <p className="text-white text-center">No quote found. Please check your data.</p>;
  }

  return (
    <div className="flex justify-center items-center mb-5">
      <blockquote className="text-white text-center text-xl font-medium p-4 border-l-4 border-white mx-auto max-w-2xl">
        {/* Fixed: Replaced " with &quot; */}
        <p className="italic">&quot;{quote.q}&quot;</p>
        <footer className="mt-2 text-sm text-gray-300">
          — {quote.a}
        </footer>
      </blockquote>
    </div>
  );
};

export default Quotes;