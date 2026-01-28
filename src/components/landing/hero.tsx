'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/button';
import { ArrowRight, Github } from 'lucide-react';
import Link from 'next/link';

import { useMemo } from 'react';

const ScatteredBlock = ({ children, delay }: { children: React.ReactNode, delay: number }) => {
  const randoms = useMemo(() => ({
    x: (Math.random() - 0.5) * 60,
    y: -40 - Math.random() * 40,
    rotate: (Math.random() - 0.5) * 30,
    duration: 0.8 + Math.random() * 0.7,
  }), []);

  return (
    <motion.div
      variants={{
        initial: { x: 0, y: 0, rotate: 0 },
        animate: { 
          x: [0, randoms.x, 0],
          y: [0, randoms.y, 0],
          rotate: [0, randoms.rotate, 0],
          transition: {
            delay: delay + 0.75,
            duration: randoms.duration,
            ease: [0.34, 1.56, 0.64, 1] 
          }
        }
      }}
    >
      {children}
    </motion.div>
  );
};

export default function HeroSection() {
  return (
    <section className="relative w-full min-h-screen flex flex-col items-center justify-center space-y-[60px]  overflow-hidden bg-white dark:bg-black">
      <motion.div 
        initial="initial"
        animate="animate"
        className="relative z-10 flex flex-col gap-[30px] pointer-events-none select-none"
      >
        <motion.div
          variants={{
            initial: { opacity: 0, y: -1000 },
            animate: { 
              opacity: 1, 
              y: 0, 
              transition: { 
                type: "spring",
                bounce: 0.4,
                duration: 0.8,
                delay: 0.6 
              } 
            }
          }}
          className="flex gap-[30px] justify-center"
        >
          <div className="flex gap-[30px]">
            <div className='w-[221.14px]  flex  flex-col gap-[30px]'>
              <ScatteredBlock delay={0.6}>
                <div className="w-[221.14px] h-[215.29px] border border-black/60 dark:border-white/20 bg-[repeating-linear-gradient(135deg,transparent,transparent_13px,currentColor_13px,currentColor_14px)] text-black/20 dark:text-white/20" />
              </ScatteredBlock>
              <ScatteredBlock delay={0.6}>
                <div className="w-[255px] h-[215.29px] border-r-0 border border-black/60 dark:border-white/20  " />
              </ScatteredBlock>
            </div>
            <div className='flex flex-col  '>
              <ScatteredBlock delay={0.6}>
                <div className="w-[221.14px] flex-1 border-b-0   h-[245.30px]  border border-black/60 dark:border-white/20  " />
              </ScatteredBlock>
              <ScatteredBlock delay={0.6}>
                <div className="w-[221.14px] h-[215.29px] border-t-0 border-l-0 border border-black/60 dark:border-white/20 " />
              </ScatteredBlock>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-[30px]">
            {[...Array(6)].map((_, i) => (
              <ScatteredBlock key={i} delay={0.6}>
                <div className={`w-[221.14px] h-[215.29px] border border-black/60 dark:border-white/20 ${i === 1 ? 'bg-[repeating-linear-gradient(135deg,transparent,transparent_13px,currentColor_13px,currentColor_14px)] text-black/20 dark:text-white/20' : ''}`} />
              </ScatteredBlock>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-[30px]">
            <div className='flex flex-col'>
              <ScatteredBlock delay={0.6}>
                <div className="w-[221.14px] flex-1 border-b-0  h-[245.30px]  border border-black/60 dark:border-white/20" />
              </ScatteredBlock>
              <ScatteredBlock delay={0.6}>
                <div className="w-[221.14px] h-[215.29px] border border-t-0  border-r-0 border-black/60 dark:border-white/20  text-black/20 dark:text-white/20" />
              </ScatteredBlock>
            </div>
            <div className="w-[221.14px]  flex  flex-col gap-[30px]">
              <ScatteredBlock delay={0.6}>
                <div className="w-[221.14px] h-[215.29px] border border-black/60 dark:border-white/20 text-black/20 dark:text-white/20 bg-[repeating-linear-gradient(135deg,transparent,transparent_13px,currentColor_13px,currentColor_14px)]" />
              </ScatteredBlock>
              <ScatteredBlock delay={0.6}>
                <div className="w-[240.14px] h-[215.29px] border -ml-[30px] border-l-0 border-black/60 dark:border-white/20  text-black/20 dark:text-white/20" />
              </ScatteredBlock>
            </div>
          </div>
        </motion.div>

        <motion.div 
          variants={{
            initial: { opacity: 0, y: -1000 },
            animate: { 
              opacity: 1, 
              y: 0, 
              transition: { 
                type: "spring",
                bounce: 0.4,
                duration: 0.8,
                delay: 0.2 
              } 
            }
          }}
          className="flex gap-[30px] justify-center"
        >
          <div className="flex gap-[30px]">
            <div className='w-[221.14px] flex flex-col gap-[30px]'>
              <ScatteredBlock delay={0.2}>
                <div className="w-[250.14px] h-[215.29px] border-r-0 border border-black/60 dark:border-white/20 text-black/20 dark:text-white/20" />
              </ScatteredBlock>
              <ScatteredBlock delay={0.2}>
                <div className="w-[221.14px] h-[215.29px] border border-black/60 dark:border-white/20  bg-[repeating-linear-gradient(135deg,transparent,transparent_13px,currentColor_13px,currentColor_14px)] text-black/20 dark:text-white/20" />
              </ScatteredBlock>
            </div>
            <div className='flex flex-col'>
              <ScatteredBlock delay={0.2}>
                <div className="w-[221.14px] h-[215.29px] border-l-0 border-b-0 border border-black/60 dark:border-white/20 text-black/20 dark:text-white/20" />
              </ScatteredBlock>
              <ScatteredBlock delay={0.2}>
                <div className="w-[221.14px] flex-1 border-t-0 h-[230.29px] border border-black/60 dark:border-white/20 text-black/20 dark:text-white/20" />
              </ScatteredBlock>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-[30px]">
            {[...Array(6)].map((_, i) => (
              <ScatteredBlock key={i} delay={0.2}>
                <div className={`w-[221.14px] h-[215.29px] border border-black/60 dark:border-white/20 ${i === 4 ? 'bg-[repeating-linear-gradient(135deg,transparent,transparent_13px,currentColor_13px,currentColor_14px)] text-black/20 dark:text-white/20' : ''}`} />
              </ScatteredBlock>
            ))}
          </div>

          <div className="flex gap-[30px]">
            <div className='flex flex-col'>
              <ScatteredBlock delay={0.2}>
                <div className="w-[221.14px] h-[215.29px] border-r-0 border-b-0 border border-black/60 dark:border-white/20 text-black/20 dark:text-white/20" />
              </ScatteredBlock>
              <ScatteredBlock delay={0.2}>
                <div className="w-[221.14px] flex-1 border-t-0 h-[230.29px] border border-black/60 dark:border-white/20 text-black/20 dark:text-white/20" />
              </ScatteredBlock>
            </div>
            <div className='w-[221.14px] flex flex-col gap-[30px]'>
              <ScatteredBlock delay={0.2}>
                <div className="w-[240.14px] -ml-[30px] h-[215.29px] border-l-0 border border-black/60 dark:border-white/20 text-black/20 dark:text-white/20" />
              </ScatteredBlock>
              <ScatteredBlock delay={0.2}>
                <div className="w-[221.14px] h-[215.29px] border border-black/60 dark:border-white/20 text-black/20 dark:text-white/20 bg-[repeating-linear-gradient(135deg,transparent,transparent_13px,currentColor_13px,currentColor_14px)]" />
              </ScatteredBlock>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ 
            duration: 0.3, 
            delay: 1.8, 
            ease: [0.16, 1, 0.3, 1] 
          }}
          className="w-[760px] h-[490px] -mt-8 flex flex-col items-center justify-center text-center bg-white dark:bg-black space-y-12 px-6 pointer-events-auto"
        >
          <div className="space-y-6">
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.8, 
                delay: 2.0, 
                ease: [0.16, 1, 0.3, 1] 
              }}
              className="font-medium text-4xl md:text-5xl lg:text-7xl text-black dark:text-white leading-tight tracking-tight"
            >
              Build Stellar-Powered <br className="hidden sm:block" /> Apps. Faster.
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.8, 
                delay: 2.3, 
                ease: [0.16, 1, 0.3, 1] 
              }}
              className="font-normal text-base md:text-lg text-black/80 dark:text-white/80 max-w-2xl mx-auto"
            >
              A modern framework that brings Stellar blockchain power to
              Next.js, enabling developers to build scalable, Web3-ready apps
              with ease.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.8, 
              delay: 2.6, 
              ease: [0.16, 1, 0.3, 1] 
            }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10"
          >
            <Link href="/docs/getting-started/introduction">
              <Button className="h-12 px-8 py-3 text-lg bg-black dark:bg-white text-white dark:text-black rounded-none border-none hover:opacity-90 transition-all flex items-center gap-2 font-medium">
                Get Started
              </Button>
            </Link>
            <Link href="https://github.com/nextellarlabs/nextellar">
              <Button
                variant="outline"
                className="h-12 px-8 py-3 text-lg border-black/20 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/5 rounded-none flex items-center gap-2 transition-all font-medium text-black dark:text-white"
              >
                View on GitHub
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
