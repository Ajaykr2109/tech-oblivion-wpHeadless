"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
 
import { decodeEntities } from '@/lib/entities';

const Search: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    // Ensure pasted content with HTML entities renders nicely
    setSearchTerm(decodeEntities(inputValue));
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };
  return (
    <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
      <input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={handleInputChange}
        className="border rounded px-3 py-2"
      />
      <button type="submit" className="bg-primary text-primary-foreground px-3 py-2 rounded">Go</button>
    </form>
  );
};

export default Search;