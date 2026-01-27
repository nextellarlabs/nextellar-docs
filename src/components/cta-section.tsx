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
    <div className="relative w-full min-h-screen overflow-hidden bg-white dark:bg-black flex items-center justify-center">
      {/* Figma Exported Background with Geometric L-shapes */}
      <motion.div
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="absolute inset-0"
      >
        <Image
          className="w-full h-full object-cover dark:opacity-20 dark:invert"
          alt="Geometric background with L-shapes"
          src="/figmaAssets/group-1.png"
          fill
          priority
        />
        {/* Dark mode overlay for better contrast */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/5 via-transparent to-black/5 dark:from-white/5 dark:via-transparent dark:to-white/5" />
      </motion.div>
      
      {/* Main Content - Centered Overlay with Animations */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 sm:px-8 max-w-3xl mx-auto">
        <motion.h1 
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-black dark:text-white mb-6 leading-tight tracking-tight"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
        >
          Ready to Start Building?
        </motion.h1>
        
        <motion.p 
          className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto mb-10 leading-relaxed"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
        >
          Install Nextellar, run your first command, and start coding immediately. Everything else is already taken care of.
        </motion.p>
        
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full sm:w-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7, ease: "easeOut" }}
        >
          <Link href="/docs/getting-started" className="w-full sm:w-auto">
            <motion.button
              className="bg-black dark:bg-white text-white dark:text-black px-8 py-3.5 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors w-full shadow-lg dark:shadow-white/10"
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
            className="w-full sm:w-auto"
          >
            <motion.button
              className="bg-white dark:bg-gray-900 text-black dark:text-white px-8 py-3.5 rounded-lg font-medium border-2 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 w-full shadow-lg dark:shadow-white/5"
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
