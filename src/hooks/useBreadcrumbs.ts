import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { findNavigationItem } from '@/config/navigation';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function useBreadcrumbs(): BreadcrumbItem[] {
  const { pathname } = useLocation();

  return useMemo(() => {
    if (pathname === '/') {
      return [{ label: 'Dashboard' }];
    }

    const result = findNavigationItem(pathname);

    if (!result) {
      return [{ label: 'Dashboard', href: '/' }, { label: pathname.slice(1) }];
    }

    const { item, group } = result;

    return [
      { label: 'Dashboard', href: '/' },
      { label: group.title, href: undefined },
      { label: item.title, href: undefined },
    ];
  }, [pathname]);
}
