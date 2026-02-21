'use client';

import Image from 'next/image';
import Link from 'next/link';

const cards = [
  {
    title: 'One Command Setup',
    description:
      'Scaffold a Stellar Next.js app instantly with \n npx nextellar my-app',
    image: '/images/what-is-nextellar/whatisnextelar1.png',
  },
  {
    title: 'Built-in Stellar SDK Integration',
    description: 'Preconfigured Stellar SDK for easy blockchain connectivity',
    image: '/images/what-is-nextellar/whatisnextelar2.png',
  },
  {
    title: 'React Hooks for Web3',
    description:
      'Simplified access to Stellar data through hooks like \n useStellarAccount(), useStellarPayment(), and useTransactionHistory()',
    image: '/images/what-is-nextellar/whatisnextelar3.png',
  },
  {
    title: 'UI Components',
    description:
      'Drop-in React components for connecting and managing Stellar wallets',
    image: '/images/what-is-nextellar/ui-components.svg',
  },
];

export function WhatIsNextellar() {
  return (
    <section className="w-full bg-white dark:bg-black py-20 md:py-24">
      <div className="w-full max-w-[1520px] mx-auto px-4 md:px-6 lg:px-8 xl:px-26">
        {/* Top row: intro text + first card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left: What is Nextellar intro */}
          <div className="flex flex-col justify-center gap-6 py-8 md:py-16 md:pr-12">
            <h2 className="font-medium text-3xl md:text-4xl lg:text-5xl tracking-[-0.03em] text-black dark:text-white">
              What is Nextellar?
            </h2>
            <p className="text-sm md:text-base leading-relaxed text-black/80 dark:text-white/80 max-w-lg">
              Nextellar is a framework for developers to build and scale Stellar
              applications easily, abstracting blockchain complexities while
              allowing flexibility.
            </p>
            <div>
              <Link
                href="/docs"
                className="inline-block bg-black dark:bg-white text-white dark:text-black font-medium text-base py-3 px-7 hover:opacity-90 transition-opacity"
              >
                Try It Out
              </Link>
            </div>
          </div>

          {/* Right: One Command Setup card */}
          <div className="border border-black/20 dark:border-white/20 p-6 pb-4 flex flex-col justify-between min-h-[300px] md:min-h-[360px] overflow-hidden">
            <div>
              <h3 className="font-semibold text-xl md:text-2xl text-black dark:text-white mb-2">
                {cards[0].title}
              </h3>
              <p className="text-sm md:text-base text-black/80 dark:text-white/80 whitespace-pre-line">
                {cards[0].description}
              </p>
            </div>
            <div className="flex justify-end mt-6">
              <div
                className={`relative w-[200px] h-[160px] md:w-[350px] md:h-[275px]`}
              >
                <Image
                  src={cards[0].image}
                  alt={cards[0].title}
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Middle row: two cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
          {[cards[1], cards[2]].map((card) => (
            <div
              key={card.title}
              className="border border-black/20 dark:border-white/20 p-6 flex flex-col justify-between min-h-[300px] md:min-h-[360px] overflow-hidden"
            >
              <div>
                <h3 className="font-semibold text-xl md:text-2xl text-black dark:text-white mb-2">
                  {card.title}
                </h3>
                <p className="text-sm md:text-base text-black/80 dark:text-white/80 whitespace-pre-line">
                  {card.description}
                </p>
              </div>
              <div className="flex justify-end mt-6">
                <div className="relative w-[200px] h-[160px] md:w-[400px] md:h-[280px] transform translate-y-12">
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom row: UI Components card + large image */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
          {/* UI Components card */}
          <div className="border border-black/20 dark:border-white/20 min-h-[300px] md:min-h-[380px] overflow-hidden relative">
            <Image
              src="/images/what-is-nextellar/whatisnextelar4.png"
              alt="Nextellar UI Components"
              width={800} 
              height={800}
              className="object-cover w-full h-full"
            />
          </div>

          {/* Large decorative image placeholder */}
          <div className="border border-black/20 dark:border-white/20 overflow-hidden bg-[repeating-linear-gradient(135deg,transparent,transparent_13px,currentColor_13px,currentColor_14px)] text-black/10 dark:text-white/10 relative ">
            <Image
              src="/images/what-is-nextellar/whatisnextelar5.png"
              alt="Nextellar showcase"
              fill
              className="object-contain object-bottom object-right"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
