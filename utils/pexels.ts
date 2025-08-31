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
  });
  return (await response.json()) as PexelsImage;
};

export const searchPexelsImages = async (searchTerm: string): Promise<PexelsImage[]> => {
  const domain = 'https://api.pexels.com/';
  const path = 'v1/search';
  const query = `?query=${searchTerm}&orientation=landscape&per_page=20&page=1`;
  const url = `${domain}${path}${query}`;
  const response = await fetch(url, {
    headers: { Authorization: API_KEY },
    next: { revalidate: 345_600 }, // 4 days
  });
  const result = await response.json();

  if (result.photos) {
    return result.photos;
  }
  return [];
};
