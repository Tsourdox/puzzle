const API_KEY = '563492ad6f91700001000001e9543e64cc6240f3a18b3b0d9f42629d';

export interface PexelsImage {
  id: string;
  width: number;
  height: number;
  alt: string;
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

export const searchPexelsImages = async (searchTerm?: string) => {
  if (!searchTerm) return [];

  const domain = 'https://api.pexels.com/';
  const path = 'v1/search';
  const page = 1;
  // const page = Math.ceil(Math.random() * 5);
  const query = `?query=${searchTerm}&orientation=landscape&per_page=10&page=${page}`;
  const url = `${domain}${path}${query}`;
  const response = await fetch(url, {
    headers: { Authorization: API_KEY },
  });
  return (await response.json()).photos as PexelsImage[];
};
