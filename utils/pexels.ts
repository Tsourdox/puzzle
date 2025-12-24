const API_KEY = '563492ad6f91700001000001e9543e64cc6240f3a18b3b0d9f42629d';

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

export const getPexelsImage = async (id: string) => {
  const url = `https://api.pexels.com/v1/photos/${id}`;
  const response = await fetch(url, {
    headers: { Authorization: API_KEY },
    cache: 'force-cache',
  });
  return (await response.json()) as PexelsImage;
};

export const getCuratedPexelsImages = async (): Promise<PexelsImage[]> => {
  try {
    const domain = 'https://api.pexels.com/';
    const path = 'v1/curated';
    const query = `?per_page=40&page=1`;
    const url = `${domain}${path}${query}`;

    const response = await fetch(url, {
      headers: { Authorization: API_KEY },
      next: { revalidate: 86_400 }, // 1 day
    });

    if (!response.ok) {
      console.error(`Pexels API error: ${response.status} ${response.statusText}`);
      return [];
    }

    const result = await response.json();

    if (result.photos) {
      return result.photos;
    }
    return [];
  } catch (error) {
    console.error('Failed to fetch curated images from Pexels:', error);
    return [];
  }
};

export const searchPexelsImages = async (searchTerm: string): Promise<PexelsImage[]> => {
  try {
    const domain = 'https://api.pexels.com/';
    const path = 'v1/search';
    const perPage = 20;
    const totalPages = 10;
    const spacing = 4; // Select every 4th image
    const allImages: PexelsImage[] = [];

    // Random offset to get different images on each revalidation
    const randomOffset = Math.floor(Math.random() * 4);

    // Fetch multiple pages to get variety
    const pagePromises = Array.from({ length: totalPages }, (_, i) => {
      const query = `?query=${searchTerm}&orientation=landscape&per_page=${perPage}&page=${i + 1 + randomOffset}`;
      const url = `${domain}${path}${query}`;
      return fetch(url, {
        headers: { Authorization: API_KEY },
        next: { revalidate: 86_400 }, // 1 day
      }).then((response) => {
        if (!response.ok) {
          throw new Error(`${response.status} ${response.statusText}`);
        }
        return response.json();
      });
    });

    const results = await Promise.allSettled(pagePromises);

    // Select spaced images from each page to avoid duplicates/similar images
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value.photos) {
        const spacedImages = result.value.photos.filter(
          (_: unknown, index: number) => index % spacing === 0,
        );
        allImages.push(...spacedImages);
      } else if (result.status === 'rejected') {
        console.error(`Failed to fetch page for "${searchTerm}":`, result.reason);
      }
    }

    return allImages;
  } catch (error) {
    console.error(`Failed to fetch images for "${searchTerm}":`, error);
    return [];
  }
};
