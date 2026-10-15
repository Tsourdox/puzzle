import { useEffect, useState } from 'react';
import type { GalleryRow } from '../pages';

let cache: GalleryRow[] | undefined;

export default function useGallery() {
  const [rows, setRows] = useState(cache ?? []);

  useEffect(() => {
    if (cache) return;
    fetch('/api/gallery')
      .then((response) => response.json())
      .then((gallery: GalleryRow[]) => setRows((cache = gallery)))
      .catch((error) => console.error('Failed to load images:', error));
  }, []);

  return rows;
}
