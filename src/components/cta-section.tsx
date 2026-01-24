'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Github } from 'lucide-react';

/**
 * Call to Action Section Component - Figma Export with Animations
 * 
 * Uses the exported Figma design with geometric L-shaped background.
 * Features smooth fade-in animations and interactive button effects.
 */

export default function CTASection() {
  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-white dark:bg-black">
      {/* Figma Exported Background with Geometric L-shapes */}
      <motion.div
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="absolute inset-0"
      >
        <Image
          className="w-full h-full object-cover"
          alt="Geometric background with L-shapes"
          src="/figmaAssets/group-1.png"
          fill
          priority
        />
      </motion.div>
      
      {/* Main Content - Centered Overlay with Animations */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
        <motion.h1 
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-black dark:text-white mb-4 leading-tight"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
        >
          Ready to Start Building?
        </motion.h1>
        
        <motion.p 
          className="text-gray-600 dark:text-gray-400 max-w-md mb-8 leading-relaxed"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
        >
          Install Nextellar, run your first command, and start coding immediately. Everything else is already taken care of.
        </motion.p>
        
        <motion.div 
          className="flex flex-col sm:flex-row gap-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7, ease: "easeOut" }}
        >
          <Link href="/docs/getting-started">
            <motion.button
              className="bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-md font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors w-full sm:w-auto"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              Get Started
            </motion.button>
          </Link>
          
          <Link 
            href="https://github.com/nextellarlabs/nextellar" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <motion.button
              className="bg-white dark:bg-black text-black dark:text-white px-6 py-3 rounded-md font-medium border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors flex items-center gap-2 w-full sm:w-auto"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Github className="w-5 h-5" />
              View GitHub
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
