'use client';
// =============================================================================
// DepGraph — SearchBar
// Debounced text input for filtering the deps table by package name.
// =============================================================================

import { useRef } from 'react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = 'Search packages…' }: Props) {
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => onChange(val), 300);
  }

  return (
    <input
      id="deps-search"
      type="search"
      className="search-bar"
      defaultValue={value}
      onChange={handleChange}
      placeholder={placeholder}
      aria-label="Search packages by name"
      autoComplete="off"
    />
  );
}
