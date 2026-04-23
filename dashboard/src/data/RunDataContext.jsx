/**
 * FORMULIX – RunDataContext
 *
 * Makes the benchmark data (real or mock) available to all components
 * without prop-drilling.
 */

import { createContext, useContext } from 'react';

export const RunDataContext = createContext(null);

export function useData() {
  return useContext(RunDataContext);
}
