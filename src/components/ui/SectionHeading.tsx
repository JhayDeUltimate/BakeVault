import React from 'react';

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: React.ReactNode;
  align?: 'left' | 'center';
}

const SectionHeading: React.FC<SectionHeadingProps> = ({ eyebrow, title, description, align = 'center' }) => {
  const alignment = align === 'center' ? 'text-center mx-auto' : 'text-left';

  return (
    <div className={['max-w-3xl', alignment].join(' ')}>
      {eyebrow ? <p className="text-brand-brown text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] mb-4">{eyebrow}</p> : null}
      <h2 className="text-3xl sm:text-5xl font-extrabold text-brand-darkGray font-display tracking-tighter">{title}</h2>
      {description ? <div className="mt-5 text-sm sm:text-base text-brand-darkGray/70 leading-relaxed font-medium">{description}</div> : null}
    </div>
  );
};

export default SectionHeading;
