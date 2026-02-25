import { WhyDevelopersSection } from '@/components/landing/why-developers-section';
import { WhatIsNextellar } from '@/components/landing/what-is-nextellar';
import HeroSection from '@/components/landing/hero';
import NavigationBar from '@/components/navigation';
import { StackSection } from '@/components/StackSection';

export default function Home() {
  return (
    <main className="min-h-screen bg-white dark:bg-black">
      <NavigationBar />
      <HeroSection />
      <WhatIsNextellar />
      <WhyDevelopersSection />
      <StackSection />
    </main>
  );
}
