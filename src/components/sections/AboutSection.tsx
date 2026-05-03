import React from 'react';
import SectionHeading from '../ui/SectionHeading';

interface AboutSectionProps {
  withBorder?: boolean;
}

const AboutSection: React.FC<AboutSectionProps> = ({ withBorder = true }) => {
  return (
    <section className={`bg-white py-12 sm:py-20 px-4 sm:px-6 lg:px-8 ${withBorder ? 'border-b border-orange-100' : ''}`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-20">
          <div className="lg:w-1/2 text-center lg:text-left">
            <SectionHeading
              eyebrow="About BakeVault"
              title="Built around one problem: Nigerian bakers deserve a supplier they can actually count on."
              description="Based in Lagos, BakeVault stocks baking ingredients and delivers them the same day across the city. For bakers who can't afford a supplier to let them down."
              align="left"
            />
          </div>
          <div className="lg:w-1/2 relative hidden sm:block">
            <div className="aspect-[4/3] rounded-[40px] overflow-hidden shadow-2xl rotate-2">
              <img
                src="https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=1200"
                className="w-full h-full object-cover"
                alt="Bakery Supply"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
