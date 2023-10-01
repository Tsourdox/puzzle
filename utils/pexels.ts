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

// key: search term, value: image array
let imageCache: Map<string, PexelsImage[]> = new Map();
// key: search term, value: date
let cacheDate: Map<string, Date> = new Map();

export const getPexelsImage = async (id: string) => {
  // check cache and return if found

  const url = `https://api.pexels.com/v1/photos/${id}`;
  const response = await fetch(url, {
    headers: { Authorization: API_KEY },
  });
  return (await response.json()) as PexelsImage;
};

export const searchPexelsImages = async (searchTerm: string): Promise<PexelsImage[]> => {
  // check cache and return if found
  const cachedImages = imageCache.get(searchTerm);
  const cachedDate = cacheDate.get(searchTerm);
  if (cachedImages && cachedDate) {
    const diff = Date.now() - cachedDate.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    if (diff < oneDay) {
      console.log('returning cached images');
      return cachedImages;
    }
  }
  console.log('fetching new images');

  const domain = 'https://api.pexels.com/';
  const path = 'v1/search';
  const page = 1;
  // const page = Math.ceil(Math.random() * 5);
  const query = `?query=${searchTerm}&orientation=landscape&per_page=20&page=${page}`;
  const url = `${domain}${path}${query}`;
  const response = await fetch(url, {
    headers: { Authorization: API_KEY },
  });
  const result = await response.json();
  // console.log(result);

  if (result.photos) {
    imageCache.set(searchTerm, result.photos);
    cacheDate.set(searchTerm, new Date());
    return result.photos;
  }
  return [];
};
