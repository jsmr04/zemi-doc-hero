'use client';
import { useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';

const Accordion = ({ title, text }: { title: string; text: string }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="flex flex-col gap-2 pb-1">
      <div
        className="flex flex-row items-center justify-center gap-2"
        onClick={() => setExpanded((prev) => !prev)}
      >
        <FiChevronDown
          className={`transform duration-500 ${expanded ? 'rotate-180' : ''}`}
        />
        <p className="text-lg hover:border-b-1">{title}</p>
      </div>
      <p className={`text-justify ${expanded ? 'block' : 'hidden'}`}>{text}</p>
    </div>
  );
};

export default Accordion;
