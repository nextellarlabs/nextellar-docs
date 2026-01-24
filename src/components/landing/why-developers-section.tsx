'use client';

import { FeatureCard } from './feature-card';
import { LightningAnimation } from './animated-svg/lightning-animation';
import { BlocksAnimation } from './animated-svg/blocks-animation';
import { TypeScriptAnimation } from './animated-svg/typescript-animation';

export function WhyDevelopersSection() {
  return (
    <section className="w-full min-h-screen bg-white dark:bg-black flex items-start justify-center pt-20">
      {/* Main Frame - width: 1520px, height: 799px, gap: 64px */}
      <div className="w-full max-w-[1520px] mx-auto px-4 lg:px-8 xl:px-[104px] flex flex-col items-center gap-8 lg:gap-12 xl:gap-16">

        {/* Header - Frame 2095586715: height 126px, gap 24px */}
        <div className="flex flex-col items-center gap-6">
          <h2 className="font-medium text-3xl md:text-4xl lg:text-5xl tracking-[-0.03em] text-black dark:text-white text-center">
            Why Developers Choose Nextellar
          </h2>
          <p className="text-base leading-[22px] text-[rgba(0,0,0,0.8)] dark:text-[rgba(255,255,255,0.8)] text-center max-w-[440px]">
            Nextellar offers speed, scalability, and simplicity. It handles setup, letting you focus on building.
          </p>
        </div>

        {/* Cards - Frame 2095586744: height 500px, gap 16px */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
          <FeatureCard
            title="Zero Setup. Maximum Speed."
            description="Kickstart production-ready projects in seconds with everything configured — TypeScript, Tailwind, and more."
          >
            <LightningAnimation />
          </FeatureCard>

          <FeatureCard
            title="Modular and Extensible by Design."
            description="Create plugins to enhance workflows for authentication or deployment. Nextellar's design fits any project."
          >
            <BlocksAnimation />
          </FeatureCard>

          <FeatureCard
            title="TypeScript & ESM-Ready."
            description="Ship consistent codebases. Nextellar enforces clean standards and structures for effortless collaboration."
          >
            <TypeScriptAnimation />
          </FeatureCard>
        </div>

        {/* CTA Button - Frame 62561: height 45px */}
        <a
          href="/docs"
          className="bg-black dark:bg-white text-white dark:text-black font-medium text-base py-[13px] px-[30px] hover:opacity-90 transition-opacity inline-block"
        >
          Try It Out
        </a>
      </div>
    </section>
  );
}
