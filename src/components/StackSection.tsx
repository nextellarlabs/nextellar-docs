import { PuzzleAnimation } from "./PuzzleAnimation";

export function StackSection() {
  return (
    <section className="relative w-full py-24 px-6 md:px-12 lg:px-24 overflow-hidden bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
        {/* Left Column: Text & CTA */}
        <div className="flex flex-col items-start gap-6 max-w-lg z-10">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 leading-tight">
            Seamlessly Connects With Your Entire Stack
          </h2>
          <p className="text-lg text-neutral-500 dark:text-neutral-400 leading-relaxed">
            Nextellar integrates seamlessly with your existing ecosystem, including Next.js, Node.js, Tailwind, ESLint, and Jest, configuring everything automatically.
          </p>
          <button className="mt-4 px-8 py-4 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-medium rounded-lg hover:opacity-90 transition-opacity active:scale-[0.98] shadow-sm">
            Try It Out
          </button>
        </div>

        {/* Right Column: Puzzle Animation */}
        <div className="w-full h-full flex items-center justify-center pointer-events-none md:pointer-events-auto">
          <PuzzleAnimation />
        </div>
        
      </div>
    </section>
  );
}
