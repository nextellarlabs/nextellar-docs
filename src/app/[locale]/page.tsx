import { WhyDevelopersSection } from '@/components/landing/why-developers-section';
import { WhatIsNextellar } from '@/components/landing/what-is-nextellar';
import HeroSection from '@/components/landing/hero';
import NavigationBar from '@/components/navigation';
import { StackSection } from '@/components/StackSection';
import Footer from '@/components/Footer';
import CTASection from '@/components/cta-section';
import { Locale, LOCALES } from '@/lib/i18n';

type Params = Promise<{ locale: string }>;

export const generateStaticParams = () => {
  return LOCALES.map((locale) => ({ locale }));
};

export default async function Home({ params }: { params: Params }) {
  const { locale } = await params;

  return (
    <main className="min-h-screen bg-white dark:bg-black">
      <NavigationBar />
      <HeroSection />
      <WhatIsNextellar />
      <WhyDevelopersSection />
      <StackSection />
      <CTASection />
      <Footer />
    </main>
  );
}
