'use client';

import React from 'react';
import { LayoutGroup } from 'framer-motion';

export function MotionLayoutRoot({ children }: { children: React.ReactNode }) {
  return <LayoutGroup id="root-layout">{children}</LayoutGroup>;
}
