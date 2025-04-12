import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for responsive UI layout
 * Returns breakpoint information based on current viewport size
 */
export const useResponsive = () => {
  // Breakpoint sizes
  const breakpoints = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536
  };
  
  const getBreakpoint = useCallback(() => {
    if (typeof window === 'undefined') return {};
    
    const width = window.innerWidth;
    
    return {
      isMobile: width < breakpoints.md,
      isTablet: width >= breakpoints.md && width < breakpoints.lg,
      isDesktop: width >= breakpoints.lg,
      isSmall: width < breakpoints.sm,
      isMedium: width >= breakpoints.sm && width < breakpoints.lg,
      isLarge: width >= breakpoints.lg && width < breakpoints.xl,
      isExtraLarge: width >= breakpoints.xl
    };
  }, [breakpoints.lg, breakpoints.md, breakpoints.sm, breakpoints.xl]);
  
  const [breakpoint, setBreakpoint] = useState(getBreakpoint());
  
  const handleResize = useCallback(() => {
    setBreakpoint(getBreakpoint());
  }, [getBreakpoint]);
  
  useEffect(() => {
    // Set initial breakpoint
    handleResize();
    
    // Set up event listener for window resize
    window.addEventListener('resize', handleResize);
    
    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);
  
  return {
    ...breakpoint,
    breakpoints
  };
};

export default useResponsive;