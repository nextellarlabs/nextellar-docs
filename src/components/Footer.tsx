'use client';
import React from 'react';

const Footer = () => {
  const footerValues = [
    { name: 'Github', link: 'https://github.com/' },
    { name: 'Blog', link: 'https://blog.com' },
    { name: 'X', link: 'https://x.com/' },
    { name: 'LinkedIn', link: 'https://linkedin.com/' },
  ];

  return (
    <footer
      className="w-full flex items-center justify-between
      my-12
      lg:my-16
      text-black border-black dark:text-white dark:border-white gap-7"
    >
      <div className="hidden   md:block md:w-2/12 border-t border-b border-r  py-4 md:h-[105.83px]" />

      <div className="flex items-center justify-center border-t border-b  w-full md:border md:w-8/12 h-[105.83px] py-4">
        <div className="flex justify-around w-full  md:gap-30">
          {footerValues.map((item, index) => (
            <a
              key={index}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              {item.name}
            </a>
          ))}
        </div>
      </div>

      <div className="hidden md:block md:w-2/12 border-t border-b border-l py-4 md:h-[105.83px]" />
    </footer>
  );
};

export default Footer;
