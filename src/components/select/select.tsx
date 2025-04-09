'use client';

import { useState } from 'react';

import Image from 'next/image';

type Option = { label: string; value: string; icon?: string };

interface Props {
  icon?: string;
  options: Option[];
  selectIcon?: boolean;
}

export default function CustomSelect({ icon, options, selectIcon }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<Option>(options[0]);

  return (
    <div className='relative inline-block'>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='w-full flex items-center justify-between gap-2 p-2 border bg-white dark:bg-background dark:text-white text-black hover:scale-105 transition-transform duration-200'
      >
        <div className='flex items-center gap-2'>
          {icon && <Image src={icon} alt='icon' width={16} height={16} />}
          {selected.label}
        </div>
        {selectIcon && <span>▼</span>}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className='absolute z-10 mt-1 w-full bg-white dark:bg-background border shadow-lg'>
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                setSelected(option);
                setIsOpen(false);
              }}
              className='w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800'
            >
              {option.icon && <Image src={option.icon} alt='icon' width={16} height={16} />}
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
