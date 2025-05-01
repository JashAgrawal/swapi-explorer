/**
 * SWAPI (Star Wars API) service
 * Provides functions to interact with the Star Wars API
 */
import axios from 'axios';

// Base API client with common configuration
const apiClient = axios.create({
  baseURL: 'https://swapi.tech/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Resource types available in the API
export type ResourceType = 'people' | 'planets' | 'films' | 'species' | 'vehicles' | 'starships';

// Common response structure for paginated results
export interface PaginatedResponse<T> {
  message: string;
  total_records: number;
  total_pages: number;
  previous: string | null;
  next: string | null;
  results: T[];
}

// Resource list item structure for basic listing
export interface ResourceListItem {
  uid: string;
  name: string;
  url: string;
}

// Resource list item structure for search results
export interface SearchResultItem<T> {
  properties: T;
  description: string;
  _id: string;
  uid: string;
  __v: number;
}

// Search response structure
export interface SearchResponse<T> {
  message: string;
  result: SearchResultItem<T>[];
}

// Detailed resource structure
export interface ResourceDetail<T> {
  message: string;
  result: {
    properties: T;
    description: string;
    _id: string;
    uid: string;
    __v: number;
  };
}

// Person properties
export interface PersonProperties {
  name: string;
  height: string;
  mass: string;
  hair_color: string;
  skin_color: string;
  eye_color: string;
  birth_year: string;
  gender: string;
  homeworld: string;
  films: string[];
  species: string[];
  vehicles: string[];
  starships: string[];
  created: string;
  edited: string;
  url: string;
}

// Planet properties
export interface PlanetProperties {
  name: string;
  rotation_period: string;
  orbital_period: string;
  diameter: string;
  climate: string;
  gravity: string;
  terrain: string;
  surface_water: string;
  population: string;
  residents: string[];
  films: string[];
  created: string;
  edited: string;
  url: string;
}

// Film properties
export interface FilmProperties {
  title: string;
  episode_id: number;
  opening_crawl: string;
  director: string;
  producer: string;
  release_date: string;
  characters: string[];
  planets: string[];
  starships: string[];
  vehicles: string[];
  species: string[];
  created: string;
  edited: string;
  url: string;
}

// Species properties
export interface SpeciesProperties {
  name: string;
  classification: string;
  designation: string;
  average_height: string;
  skin_colors: string;
  hair_colors: string;
  eye_colors: string;
  average_lifespan: string;
  homeworld: string;
  language: string;
  people: string[];
  films: string[];
  created: string;
  edited: string;
  url: string;
}

// Vehicle properties
export interface VehicleProperties {
  name: string;
  model: string;
  manufacturer: string;
  cost_in_credits: string;
  length: string;
  max_atmosphering_speed: string;
  crew: string;
  passengers: string;
  cargo_capacity: string;
  consumables: string;
  vehicle_class: string;
  pilots: string[];
  films: string[];
  created: string;
  edited: string;
  url: string;
}

// Starship properties
export interface StarshipProperties {
  name: string;
  model: string;
  manufacturer: string;
  cost_in_credits: string;
  length: string;
  max_atmosphering_speed: string;
  crew: string;
  passengers: string;
  cargo_capacity: string;
  consumables: string;
  hyperdrive_rating: string;
  MGLT: string;
  starship_class: string;
  pilots: string[];
  films: string[];
  created: string;
  edited: string;
  url: string;
}

/**
 * Get a paginated list of resources by type
 * @param type - The type of resource to fetch
 * @param page - The page number to fetch
 * @param search - Optional search term to filter results
 */
export const getResources = async <T>(
  type: ResourceType,
  page: number = 1,
  search?: string
): Promise<PaginatedResponse<ResourceListItem> | SearchResponse<T>> => {
  const params: Record<string, string | number> = { page };
  if (search) params.name = search;

  try {
    // If search is provided, the API returns a different response structure
    if (search) {
      const response = await apiClient.get<SearchResponse<T>>(`/${type}`, { params });
      return response.data;
    } else {
      const response = await apiClient.get<PaginatedResponse<ResourceListItem>>(`/${type}`, { params });
      return response.data;
    }
  } catch (error) {
    console.error(`Error fetching ${type}:`, error);
    throw error;
  }
};

/**
 * Get detailed information about a specific resource
 * @param type - The type of resource
 * @param id - The unique ID of the resource
 */
export const getResourceById = async <T>(
  type: ResourceType,
  id: string
): Promise<ResourceDetail<T>> => {
  try {
    const response = await apiClient.get<ResourceDetail<T>>(`/${type}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${type} with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Fetch a resource by its full URL
 * @param url - The full URL of the resource
 */
export const getResourceByUrl = async <T>(url: string): Promise<T> => {
  try {
    // Extract the path from the full URL to use with our base client
    const path = url.replace('https://swapi.tech/api', '');
    const response = await apiClient.get<T>(path);
    return response.data;
  } catch (error) {
    console.error(`Error fetching resource at ${url}:`, error);
    throw error;
  }
};

// Convenience functions for specific resource types
export const getPeople = (page: number = 1, search?: string) =>
  getResources<PersonProperties>('people', page, search);

export const getPlanets = (page: number = 1, search?: string) =>
  getResources<PlanetProperties>('planets', page, search);

export const getFilms = (page: number = 1, search?: string) =>
  getResources<FilmProperties>('films', page, search);

export const getSpecies = (page: number = 1, search?: string) =>
  getResources<SpeciesProperties>('species', page, search);

export const getVehicles = (page: number = 1, search?: string) =>
  getResources<VehicleProperties>('vehicles', page, search);

export const getStarships = (page: number = 1, search?: string) =>
  getResources<StarshipProperties>('starships', page, search);

export const getPerson = (id: string) =>
  getResourceById<PersonProperties>('people', id);

export const getPlanet = (id: string) =>
  getResourceById<PlanetProperties>('planets', id);

export const getFilm = (id: string) =>
  getResourceById<FilmProperties>('films', id);

export const getSpeciesDetail = (id: string) =>
  getResourceById<SpeciesProperties>('species', id);

export const getVehicle = (id: string) =>
  getResourceById<VehicleProperties>('vehicles', id);

export const getStarship = (id: string) =>
  getResourceById<StarshipProperties>('starships', id);
