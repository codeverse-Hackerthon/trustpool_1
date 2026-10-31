/**
 * Development data is opt-in. Set VITE_ENABLE_MOCKS=true for the offline
 * hackathon demo; production builds always surface API errors instead.
 */
export const mocksEnabled = import.meta.env.VITE_ENABLE_MOCKS === 'true';

export const requireMockMode = (error: unknown): never => {
  if (mocksEnabled) throw error; // unreachable helper used only as a guard
  throw error;
};
