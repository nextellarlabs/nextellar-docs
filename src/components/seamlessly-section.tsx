'use client'

import { Button } from '@/components/button'
import { PuzzleAnimation } from '@/components/puzzle-animation'

export function SeamlesslySection() {
  return (
    <section className="w-full bg-white px-6 py-16 md:py-24 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
          <div className="flex flex-col items-start">
            <h2 className="text-[32px] leading-[1.1] md:text-[40px] lg:text-[48px] font-semibold tracking-[-0.02em] text-black">
              Seamlessly Connects With Your Entire Stack
            </h2>
            <p className="mt-5 max-w-[520px] text-[15px] leading-[1.7] text-black/60 md:text-[17px]">
              Nextellar integrates seamlessly with your existing ecosystem, including Next.js, Node.js, Tailwind, ESLint, and Jest, configuring everything automatically.
            </p>
            <Button className="mt-8 h-auto rounded-[4px] border-0 bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-black/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20">
              Try It Out
            </Button>
          </div>
          <div className="flex w-full items-center justify-center lg:justify-end">
            <PuzzleAnimation />
          </div>
        </div>
      </div>
    </section>
  )
}
