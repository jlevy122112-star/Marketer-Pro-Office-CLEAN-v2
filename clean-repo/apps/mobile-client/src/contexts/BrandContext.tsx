'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import type { BrandTone } from '@marketer-pro/cinematic-engine';

interface Brand {
  id:   string;
  name: string;
  tone: BrandTone;
}

interface BrandCtx {
  activeBrand:    Brand | null;
  setActiveBrand: (brand: Brand | null) => void;
}

const Ctx = createContext<BrandCtx | null>(null);

export function BrandProvider({ children }: { children: ReactNode }) {
  const [activeBrand, setActiveBrand] = useState<Brand | null>(null);
  return <Ctx.Provider value={{ activeBrand, setActiveBrand }}>{children}</Ctx.Provider>;
}

export function useBrandContext(): BrandCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useBrandContext must be inside BrandProvider');
  return ctx;
}    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchBrands();
  }, [isAuthenticated]);

  const createBrand = async (data: Partial<Brand>): Promise<Brand> => {
    const res = await fetch('/api/brands', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create brand');
    const result = await res.json();
    setBrands(prev => [...prev, result.brand]);
    return result.brand;
  };

  return (
    <BrandContext.Provider
      value={{
        brands,
        activeBrand,
        isLoading,
        setActiveBrand,
        refreshBrands: fetchBrands,
        createBrand,
      }}
    >
      {children}
    </BrandContext.Provider>
  );
};

export const useBrand = (): BrandContextValue => {
  const ctx = useContext(BrandContext);
  if (!ctx) throw new Error('useBrand must be used within BrandProvider');
  return ctx;
};
