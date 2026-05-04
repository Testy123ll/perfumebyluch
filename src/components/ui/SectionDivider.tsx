const SectionDivider = () => (
  <div className="container py-12 flex items-center justify-center gap-4 opacity-30">
    <div className="h-px flex-1 bg-gradient-to-r from-transparent to-border" />
    <div className="h-1.5 w-1.5 rotate-45 border border-primary bg-primary shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
    <div className="h-px flex-1 bg-gradient-to-l from-transparent to-border" />
  </div>
);

export default SectionDivider;
