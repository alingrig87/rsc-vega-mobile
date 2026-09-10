import { useEffect, useState } from 'react';

/** Live device/viewport orientation via matchMedia — not a CSS-rotation trick. Scatter plots in particular read better wide (the whole point is seeing spread/correlation along x), so charts here adapt their aspect ratio when the phone is actually turned sideways instead of trying to fake landscape within a portrait viewport. */
export function useOrientation(): 'portrait' | 'landscape' {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(() =>
    typeof window !== 'undefined' && window.matchMedia('(orientation: landscape)').matches ? 'landscape' : 'portrait',
  );

  useEffect(() => {
    const mql = window.matchMedia('(orientation: landscape)');
    const update = () => setOrientation(mql.matches ? 'landscape' : 'portrait');
    update();
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, []);

  return orientation;
}
