'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const routes = [
  { name: 'Docs', path: '/docs' },
  { name: 'Features', path: '/#features' },
  { name: 'Blog', path: '/blog' },
  { name: 'Contact', path: '/contact' },
];

const NavigationBar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-black border-b border-black/10 dark:border-white/10">
      <nav className="w-full max-w-380 mx-auto px-4 md:px-6 lg:px-8 xl:px-26">
        <div className="h-16 md:h-18 lg:h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="shrink-0">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <Image
                src="/logos/logo-with-text-light.png"
                width={150}
                height={40}
                alt="Nextellar"
                className="w-32 md:w-36 lg:w-40 dark:hidden"
                priority
              />
              <Image
                src="/logos/logo-with-text-dark.png"
                width={150}
                height={40}
                alt="Nextellar"
                className="w-32 md:w-36 lg:w-40 hidden dark:block"
                priority
              />
            </motion.div>
          </Link>

          {/* Desktop Navigation Links */}
          <ul className="hidden md:flex items-center gap-6 lg:gap-10">
            {routes.map(({ name, path }) => (
              <li key={name}>
                <Link href={path}>
                  <motion.span
                    className="relative text-sm lg:text-base font-medium text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                    whileHover={{ y: -1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {name}
                    <motion.span
                      className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#4F46E5] dark:bg-[#818CF8]"
                      whileHover={{ width: '100%' }}
                      transition={{ duration: 0.2 }}
                    />
                  </motion.span>
                </Link>
              </li>
            ))}
          </ul>

          {/* Get Started Button & Mobile Menu Toggle */}
          <div className="flex items-center gap-4">
            <Link href="/docs/getting-started/introduction" className="hidden md:block">
              <motion.button
                className="text-white text-sm lg:text-base font-medium px-5 lg:px-6 py-2.5 lg:py-3 transition-colors bg-black dark:bg-white dark:text-black"
                whileHover={{ scale: 1.02, opacity: 0.9 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                Get Started
              </motion.button>
            </Link>

            {/* Mobile Menu Button */}
            <motion.button
              className="md:hidden p-2 text-black dark:text-white"
              onClick={() => setIsOpen(!isOpen)}
              whileTap={{ scale: 0.95 }}
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
            >
              <AnimatePresence mode="wait">
                {isOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-6 h-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="w-6 h-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="md:hidden overflow-hidden border-t border-black/10 dark:border-white/10"
            >
              <ul className="flex flex-col py-4 gap-1">
                {routes.map(({ name, path }, index) => (
                  <motion.li
                    key={name}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                  >
                    <Link
                      href={path}
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-3 text-base font-medium text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    >
                      {name}
                    </Link>
                  </motion.li>
                ))}
                <motion.li
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  transition={{ duration: 0.2, delay: routes.length * 0.05 }}
                  className="px-4 pt-3"
                >
                  <Link
                    href="/docs/getting-started/introduction"
                    onClick={() => setIsOpen(false)}
                    className="block w-full text-white text-center font-medium px-5 py-3 transition-colors hover:opacity-90 bg-black dark:bg-white dark:text-black"
                  >
                    Get Started
                  </Link>
                </motion.li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
};

export default NavigationBar;
