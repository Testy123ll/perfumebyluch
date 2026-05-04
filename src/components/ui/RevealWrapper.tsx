import React from "react";
import { useScrollReveal, revealClasses } from "@/hooks/useScrollReveal";

interface RevealWrapperProps {
  children: React.ReactNode;
  delay?: number;
}

const RevealWrapper: React.FC<RevealWrapperProps> = ({ children }) => {
  const { elementRef, isVisible } = useScrollReveal();

  return (
    <div 
      ref={elementRef as any}
      className={revealClasses(isVisible)}
    >
      {children}
    </div>
  );
};

export default RevealWrapper;
