// Kept apart from pexels.ts (which is server-only), so the API server can use the type
export interface PexelsImage {
  id: string;
  width: number;
  height: number;
  alt: string;
  author: string;
  src: {
    large2x: string;
    large: string;
    medium: string;
  };
}
