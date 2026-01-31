import { WhyDevelopersSection } from '@/components/landing/why-developers-section';
import HeroSection from '@/components/landing/hero';
import NavigationBar from '@/components/navigation';

export default function Home() {
  return (
    <main className="min-h-screen bg-white dark:bg-black">
      <NavigationBar />
      <HeroSection />
      <WhyDevelopersSection />
    </main>
  );
}
