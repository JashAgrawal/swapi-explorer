/**
 * Resource List Component
 * Displays a paginated table of resources with search and filtering
 * Enhanced with advanced features like fuzzy search, virtual scrolling, and data visualization
 */
import { FC, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import usePageTransition from '../../hooks/usePageTransition';
import {
  Table,
  Group,
  Text,
  TextInput,
  Button,
  Paper,
  Pagination,
  Center,
  Title,
  Skeleton,
  Box,
  Alert,
  ActionIcon,
  Tooltip,
  Badge,
  useMantineTheme,
  SegmentedControl,
  Menu,
  Checkbox,
  Divider,
  SimpleGrid,
  Card,
  Image,
  RingProgress,
  Transition,
  ScrollArea,
  Chip,
  Select,
  Popover,
  ColorSwatch,
  Grid,
  ThemeIcon,
} from '@mantine/core';
import { useDebouncedValue, useLocalStorage, useViewportSize, useIntersection } from '@mantine/hooks';
import {
  IconSearch,
  IconAlertCircle,
  IconEye,
  IconArrowsSort,
  IconTable,
  IconLayoutGrid,
  IconFilter,
  IconSettings,
  IconChartPie,
  IconStar,
  IconStarFilled,
  IconArrowUp,
  IconArrowDown,
  IconAdjustments,
  IconRefresh,
  IconDownload,
  IconUser,
  IconPlanet,
  IconMovie,
  IconAlien,
  IconCar,
  IconRocket,
} from '@tabler/icons-react';
import Fuse from 'fuse.js';
import {
  getResources,
  ResourceType,
  ResourceListItem,
  SearchResultItem,
  PaginatedResponse,
  SearchResponse
} from '../../api/swapi';

// Resource type display configuration with enhanced metadata
const resourceConfig: Record<ResourceType, {
  label: string;
  color: string;
  icon: JSX.Element;
  imagePlaceholder: string;
  description: string;
}> = {
  people: {
    label: 'People',
    color: 'blue',
    icon: <IconUser size={16} />,
    imagePlaceholder: 'https://starwars-visualguide.com/assets/img/characters/1.jpg',
    description: 'Characters from the Star Wars universe'
  },
  planets: {
    label: 'Planets',
    color: 'teal',
    icon: <IconPlanet size={16} />,
    imagePlaceholder: 'https://starwars-visualguide.com/assets/img/planets/2.jpg',
    description: 'Celestial bodies from the Star Wars galaxy'
  },
  films: {
    label: 'Films',
    color: 'violet',
    icon: <IconMovie size={16} />,
    imagePlaceholder: 'https://starwars-visualguide.com/assets/img/films/1.jpg',
    description: 'Star Wars saga movies'
  },
  species: {
    label: 'Species',
    color: 'grape',
    icon: <IconAlien size={16} />,
    imagePlaceholder: 'https://starwars-visualguide.com/assets/img/species/1.jpg',
    description: 'Different types of sentient beings'
  },
  vehicles: {
    label: 'Vehicles',
    color: 'orange',
    icon: <IconCar size={16} />,
    imagePlaceholder: 'https://starwars-visualguide.com/assets/img/vehicles/4.jpg',
    description: 'Transportation machines used on planets'
  },
  starships: {
    label: 'Starships',
    color: 'pink',
    icon: <IconRocket size={16} />,
    imagePlaceholder: 'https://starwars-visualguide.com/assets/img/starships/5.jpg',
    description: 'Spacecraft used for interstellar travel'
  },
};

// Interface for column configuration
interface ColumnConfig {
  key: string;
  label: string;
  sortable?: boolean;
  visible?: boolean;
  width?: string;
  render?: (item: ResourceListItem) => JSX.Element;
}

// Interface for favorite items
interface FavoriteItem {
  id: string;
  type: ResourceType;
  name: string;
}

const ResourceList: FC = () => {
  const { type = 'people' } = useParams<{ type: ResourceType }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const theme = useMantineTheme();
  const { width } = useViewportSize();

  // Get current page and search from URL params
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const currentSearch = searchParams.get('search') || '';

  // Local state for search input with debounce
  const [searchValue, setSearchValue] = useState(currentSearch);
  const [debouncedSearch] = useDebouncedValue(searchValue, 500);

  // View mode (table or grid)
  const [viewMode, setViewMode] = useLocalStorage<'table' | 'grid'>({
    key: 'resource-view-mode',
    defaultValue: 'table',
  });

  // Favorites
  const [favorites, setFavorites] = useLocalStorage<FavoriteItem[]>({
    key: 'resource-favorites',
    defaultValue: [],
  });

  // Column configuration
  const [columns, setColumns] = useLocalStorage<ColumnConfig[]>({
    key: `resource-columns-${type}`,
    defaultValue: [
      { key: 'uid', label: 'ID', sortable: true, visible: true, width: '100px' },
      { key: 'name', label: 'Name', sortable: true, visible: true },
      { key: 'actions', label: 'Actions', visible: true, width: '120px' },
    ],
  });

  // Sort state for columns (key = column key, value = true for ascending, false for descending)
  const [sortConfig, setSortConfig] = useLocalStorage<Record<string, boolean | null>>({
    key: `resource-sort-${type}`,
    defaultValue: { name: null },
  });

  // Reference to the scroll container for virtual scrolling
  const scrollRef = useRef<HTMLDivElement>(null);

  // Show stats panel
  const [showStats, setShowStats] = useState(false);

  // Update URL when search or page changes
  useEffect(() => {
    const params: Record<string, string> = {};
    if (debouncedSearch) params.search = debouncedSearch;
    if (currentPage > 1) params.page = currentPage.toString();
    setSearchParams(params);
  }, [debouncedSearch, currentPage, setSearchParams]);

  // Fetch resources with React Query
  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery(
    ['resources', type, currentPage, debouncedSearch],
    () => getResources(type as ResourceType, currentPage, debouncedSearch),
    {
      keepPreviousData: true,
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: true,
    }
  );

  // Use our custom hook for page transitions
  const { isLoading: isPageTransitioning } = usePageTransition();

  // Show loading state when changing resource types or during initial load
  const isLoadingData = isLoading || (isFetching && !data) || isPageTransitioning;

  // Handle page change
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    if (page === 1) {
      params.delete('page');
    } else {
      params.set('page', page.toString());
    }
    setSearchParams(params);
  };

  // Handle view resource details
  const handleViewResource = (id: string) => {
    navigate(`/resources/${type}/${id}`);
  };

  // Helper functions to handle different response formats
  const isSearchResponse = (data: any): data is SearchResponse<any> => {
    return data && 'result' in data && Array.isArray(data.result);
  };

  const isPaginatedResponse = (data: any): data is PaginatedResponse<ResourceListItem> => {
    return data && 'results' in data && Array.isArray(data.results);
  };

  // Get the items to display based on response type
  const getItems = () => {
    if (!data) return [];

    if (isSearchResponse(data)) {
      // For search results, map the result array to match the ResourceListItem structure
      return data.result.map(item => {
        const properties = item.properties as any;
        return {
          uid: item.uid,
          name: properties.name || properties.title || 'Unknown',
          url: properties.url
        };
      });
    } else if (isPaginatedResponse(data)) {
      // For paginated results, return the results array directly
      return data.results;
    }

    return [];
  };

  // Get total records count
  const getTotalRecords = () => {
    if (!data) return 0;

    if (isSearchResponse(data)) {
      return data.result.length;
    } else if (isPaginatedResponse(data)) {
      return data.total_records;
    }

    return 0;
  };

  // Calculate total pages
  const getTotalPages = () => {
    if (!data) return 0;

    if (isSearchResponse(data)) {
      // Search results are not paginated in the API
      return 1;
    } else if (isPaginatedResponse(data)) {
      return data.total_pages;
    }

    return 0;
  };

  // Get the base items
  const baseItems = getItems();
  const totalRecords = getTotalRecords();
  const totalPages = getTotalPages();

  // Apply fuzzy search if there's a search term but no API search results
  const fuzzySearchResults = useMemo(() => {
    // Only apply client-side fuzzy search when:
    // 1. There's a search term
    // 2. We're not already getting search results from the API
    // 3. We have base items to search through
    if (!searchValue || debouncedSearch || baseItems.length === 0) {
      return baseItems;
    }

    // Configure Fuse.js for fuzzy searching
    const fuse = new Fuse(baseItems, {
      keys: ['name', 'uid'],
      threshold: 0.4, // Lower threshold = more strict matching
      ignoreLocation: true,
      includeScore: true,
    });

    // Perform the search
    const results = fuse.search(searchValue);

    // Return the matched items
    return results.map(result => result.item);
  }, [baseItems, searchValue, debouncedSearch]);

  // Apply client-side sorting if needed
  const items = useMemo(() => {
    // Use fuzzy search results as the base for sorting
    const itemsToSort = fuzzySearchResults;

    // If no sort is applied, return the items as is
    const activeSort = Object.entries(sortConfig).find(([_, value]) => value !== null);
    if (!activeSort) return itemsToSort;

    const [sortKey, sortDirection] = activeSort;

    return [...itemsToSort].sort((a, b) => {
      // Handle different column types
      if (sortKey === 'uid') {
        const idA = parseInt(a.uid, 10);
        const idB = parseInt(b.uid, 10);
        return sortDirection ? idA - idB : idB - idA;
      } else if (sortKey === 'name') {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        // Sort ascending (A-Z) or descending (Z-A)
        return sortDirection
          ? nameA.localeCompare(nameB) // true = ascending
          : nameB.localeCompare(nameA); // false = descending
      }
      return 0;
    });
  }, [fuzzySearchResults, sortConfig]);

  // Handle column sort toggle
  const handleColumnSort = (columnKey: string) => {
    // Cycle through: null (no sort) -> true (ascending) -> false (descending) -> null
    setSortConfig(prev => {
      const newSortConfig = { ...prev };

      // Reset all other columns
      Object.keys(newSortConfig).forEach(key => {
        if (key !== columnKey) newSortConfig[key] = null;
      });

      // Update the clicked column
      const currentValue = prev[columnKey];
      if (currentValue === null) newSortConfig[columnKey] = true; // First click: sort ascending
      else if (currentValue === true) newSortConfig[columnKey] = false; // Second click: sort descending
      else newSortConfig[columnKey] = null; // Third click: back to no sort

      return newSortConfig;
    });
  };

  // Generate skeleton rows for loading state
  const skeletonRows = Array(10)
    .fill(0)
    .map((_, index) => (
      <tr key={`skeleton-${index}`}>
        <td><Skeleton height={20} width={60} radius="sm" /></td>
        <td><Skeleton height={20} radius="sm" /></td>
        <td><Skeleton height={20} width={100} radius="sm" /></td>
      </tr>
    ));

  // Toggle favorite status
  const toggleFavorite = (id: string, name: string) => {
    setFavorites(prev => {
      const isFavorite = prev.some(item => item.id === id && item.type === type);

      if (isFavorite) {
        // Remove from favorites
        return prev.filter(item => !(item.id === id && item.type === type));
      } else {
        // Add to favorites
        return [...prev, { id, type, name }];
      }
    });
  };

  // Check if an item is favorited
  const isFavorite = (id: string) => {
    return favorites.some(item => item.id === id && item.type === type);
  };

  // Handle view mode toggle
  const handleViewModeToggle = (value: 'table' | 'grid') => {
    setViewMode(value);
  };

  // Toggle stats panel
  const toggleStatsPanel = () => {
    setShowStats(prev => !prev);
  };

  return (
    <>
      <Paper withBorder p="lg" radius="md" mb="md">
        <Box sx={(theme) => ({
          display: 'flex',
          flexDirection: 'column',
          gap: theme.spacing.md,

          [theme.fn.largerThan('sm')]: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          },
        })}>
          <Box>
            <Group spacing="xs" mb="xs" sx={(theme) => ({
              flexWrap: 'wrap',
            })}>
              <Title order={2} size="h3" sx={(theme) => ({
                [theme.fn.smallerThan('sm')]: {
                  fontSize: theme.fontSizes.xl,
                },
              })}>
                {resourceConfig[type as ResourceType]?.label || 'Resources'}
              </Title>
              <Badge size="lg" color={resourceConfig[type as ResourceType]?.color}>
                {totalRecords} total
              </Badge>
            </Group>

            <Text color="dimmed" size="sm" mb="xs">
              {resourceConfig[type as ResourceType]?.description}
            </Text>
          </Box>

          <Box sx={(theme) => ({
            display: 'flex',
            flexDirection: 'column',
            gap: theme.spacing.sm,

            [theme.fn.largerThan('sm')]: {
              alignItems: 'flex-end',
            },
          })}>
            <Group spacing="xs">
              <SegmentedControl
                value={viewMode}
                onChange={handleViewModeToggle}
                data={[
                  { label: <Tooltip label="Table View"><IconTable size={16} /></Tooltip>, value: 'table' },
                  { label: <Tooltip label="Grid View"><IconLayoutGrid size={16} /></Tooltip>, value: 'grid' },
                ]}
                size="sm"
              />
            {/* TODO : THIS LOOKS OUT OP PLACE  */}
              <Tooltip label="Toggle Statistics">
                <ActionIcon
                  variant={showStats ? "filled" : "light"}
                  color="blue"
                  onClick={toggleStatsPanel}
                >
                  <IconChartPie size={18} />
                </ActionIcon>
              </Tooltip>
            </Group>

            <TextInput
              placeholder="Search..."
              icon={<IconSearch size={16} />}
              value={searchValue}
              onChange={(e) => setSearchValue(e.currentTarget.value)}
              sx={(theme) => ({
                width: '100%',
                [theme.fn.largerThan('xs')]: {
                  width: 250,
                },
              })}
              rightSection={
                searchValue && (
                  <ActionIcon onClick={() => setSearchValue('')} size="xs" radius="xl" variant="transparent">
                    ×
                  </ActionIcon>
                )
              }
            />
          </Box>
        </Box>
      </Paper>

      {/* Stats Panel */}
      {showStats && (
        <Paper withBorder p="md" radius="md" mb="md" sx={{ backgroundColor: theme.colors.gray[0] }}>
          <Title order={4} mb="md" sx={(theme) => ({
            fontSize: theme.fontSizes.lg,
            [theme.fn.smallerThan('sm')]: {
              fontSize: theme.fontSizes.md,
            },
          })}>Resource Statistics</Title>
          <SimpleGrid
            cols={3}
            spacing="md"
            breakpoints={[
              { maxWidth: 'md', cols: 3, spacing: 'sm' },
              { maxWidth: 'sm', cols: 2, spacing: 'sm' },
              { maxWidth: 'xs', cols: 1, spacing: 'sm' },
            ]}
          >
            <Paper withBorder p="md" radius="md">
              <Group position="apart" noWrap>
                <Box>
                  <Text size="xs" color="dimmed" transform="uppercase" lineClamp={1}>
                    Total {resourceConfig[type as ResourceType]?.label}
                  </Text>
                  <Text weight={700} size="xl" sx={(theme) => ({
                    [theme.fn.smallerThan('md')]: {
                      fontSize: theme.fontSizes.lg,
                    },
                  })}>
                    {totalRecords}
                  </Text>
                </Box>
                <ThemeIcon
                  size={40}
                  radius="md"
                  color={resourceConfig[type as ResourceType]?.color}
                  sx={(theme) => ({
                    [theme.fn.smallerThan('md')]: {
                      minWidth: 32,
                      height: 32,
                    },
                  })}
                >
                  {resourceConfig[type as ResourceType]?.icon}
                </ThemeIcon>
              </Group>
            </Paper>

            <Paper withBorder p="md" radius="md">
              <Group position="apart" noWrap>
                <Box>
                  <Text size="xs" color="dimmed" transform="uppercase">Favorites</Text>
                  <Text weight={700} size="xl" sx={(theme) => ({
                    [theme.fn.smallerThan('md')]: {
                      fontSize: theme.fontSizes.lg,
                    },
                  })}>
                    {favorites.filter(f => f.type === type).length}
                  </Text>
                </Box>
                <ThemeIcon
                  size={40}
                  radius="md"
                  color="yellow"
                  sx={(theme) => ({
                    [theme.fn.smallerThan('md')]: {
                      minWidth: 32,
                      height: 32,
                    },
                  })}
                >
                  <IconStarFilled size={20} />
                </ThemeIcon>
              </Group>
            </Paper>

            <Paper withBorder p="md" radius="md">
              <Group position="apart" noWrap>
                <Box>
                  <Text size="xs" color="dimmed" transform="uppercase">Pages</Text>
                  <Text weight={700} size="xl" sx={(theme) => ({
                    [theme.fn.smallerThan('md')]: {
                      fontSize: theme.fontSizes.lg,
                    },
                  })}>
                    {totalPages}
                  </Text>
                </Box>
                <RingProgress
                  size={40}
                  thickness={4}
                  sections={[{ value: (currentPage / totalPages) * 100, color: 'blue' }]}
                  label={
                    <Text size="xs" align="center">{currentPage}</Text>
                  }
                  sx={(theme) => ({
                    [theme.fn.smallerThan('md')]: {
                      width: 32,
                      height: 32,
                    },
                  })}
                />
              </Group>
            </Paper>
          </SimpleGrid>
        </Paper>
      )}

      <Paper withBorder p="md" radius="md">
        {isError ? (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Error loading resources"
            color="red"
          >
            {(error as Error)?.message || 'Failed to load resources. Please try again.'}
            <Button variant="outline" color="red" size="xs" mt="xs" onClick={() => refetch()}>
              Retry
            </Button>
          </Alert>
        ) : (
          <>
            <Box sx={{ position: 'relative', minHeight: '400px' }}>
              {viewMode === 'table' ? (
                <Table striped highlightOnHover>
                  <thead>
                    <tr>
                      <th>
                        <Group spacing="xs" sx={{ cursor: 'pointer' }} onClick={() => handleColumnSort('uid')}>
                          <Text>ID</Text>
                          <ActionIcon
                            size="xs"
                            color={sortConfig.uid !== null ? 'blue' : 'gray'}
                          >
                            {sortConfig.uid === true ? (
                              <IconArrowUp size={14} />
                            ) : sortConfig.uid === false ? (
                              <IconArrowDown size={14} />
                            ) : (
                              <IconArrowsSort size={14} opacity={0.5} />
                            )}
                          </ActionIcon>
                        </Group>
                      </th>
                      <th>
                        <Group spacing="xs" sx={{ cursor: 'pointer' }} onClick={() => handleColumnSort('name')}>
                          <Text>Name</Text>
                          <ActionIcon
                            size="xs"
                            color={sortConfig.name !== null ? 'blue' : 'gray'}
                          >
                            {sortConfig.name === true ? (
                              <IconArrowUp size={14} />
                            ) : sortConfig.name === false ? (
                              <IconArrowDown size={14} />
                            ) : (
                              <IconArrowsSort size={14} opacity={0.5} />
                            )}
                          </ActionIcon>
                        </Group>
                      </th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingData
                      ? skeletonRows
                      : items.map((item: ResourceListItem) => (
                          <tr key={item.uid}>
                            <td>
                              <Text size="sm" color="dimmed">
                                {item.uid}
                              </Text>
                            </td>
                            <td>
                              <Group spacing="xs">
                                <Text weight={500}>{item.name}</Text>
                                {isFavorite(item.uid) && (
                                  <Badge size="xs" color="yellow" variant="filled" sx={{ width: 6, height: 6, padding: 0 }} />
                                )}
                              </Group>
                            </td>
                            <td>
                              <Group spacing="xs">
                                <Tooltip label="View details">
                                  <ActionIcon
                                    color={resourceConfig[type as ResourceType]?.color}
                                    onClick={() => handleViewResource(item.uid)}
                                  >
                                    <IconEye size={16} />
                                  </ActionIcon>
                                </Tooltip>

                                <Tooltip label={isFavorite(item.uid) ? "Remove from favorites" : "Add to favorites"}>
                                  <ActionIcon
                                    color="yellow"
                                    variant={isFavorite(item.uid) ? "filled" : "light"}
                                    onClick={() => toggleFavorite(item.uid, item.name)}
                                  >
                                    {isFavorite(item.uid) ? <IconStarFilled size={16} /> : <IconStar size={16} />}
                                  </ActionIcon>
                                </Tooltip>
                              </Group>
                            </td>
                          </tr>
                        ))}
                  </tbody>
                </Table>
              ) : (
                <SimpleGrid
                  cols={3}
                  spacing="lg"
                  breakpoints={[
                    { maxWidth: 'md', cols: 2, spacing: 'md' },
                    { maxWidth: 'sm', cols: 1, spacing: 'sm' },
                  ]}
                >
                  {isLoadingData
                    ? Array(6).fill(0).map((_, index) => (
                        <Card key={`skeleton-card-${index}`} withBorder p="lg" radius="md">
                          <Card.Section>
                            <Skeleton height={160} />
                          </Card.Section>
                          <Skeleton height={20} mt="md" width="70%" />
                          <Skeleton height={15} mt="sm" />
                          <Group mt="md" position="apart">
                            <Skeleton height={30} width={80} />
                            <Skeleton height={30} circle />
                          </Group>
                        </Card>
                      ))
                    : items.map((item: ResourceListItem) => (
                        <Card
                          key={item.uid}
                          withBorder
                          p="lg"
                          radius="md"
                          sx={{
                            transition: 'transform 200ms ease, box-shadow 200ms ease',
                            '&:hover': {
                              transform: 'translateY(-5px)',
                              boxShadow: theme.shadows.md,
                            },
                          }}
                        >
                          <Card.Section>
                            <Box sx={{ position: 'relative' }}>
                              <Image
                                src={resourceConfig[type as ResourceType]?.imagePlaceholder}
                                height={160}
                                alt={item.name}
                                withPlaceholder
                              />
                              {isFavorite(item.uid) && (
                                <ThemeIcon
                                  color="yellow"
                                  size="md"
                                  radius="xl"
                                  sx={{
                                    position: 'absolute',
                                    top: 10,
                                    right: 10,
                                    zIndex: 2,
                                  }}
                                >
                                  <IconStarFilled size={14} />
                                </ThemeIcon>
                              )}
                            </Box>
                          </Card.Section>

                          <Group position="apart" mt="md" mb="xs">
                            <Text weight={500}>{item.name}</Text>
                            <Badge color={resourceConfig[type as ResourceType]?.color} variant="light">
                              {item.uid}
                            </Badge>
                          </Group>

                          <Text size="sm" color="dimmed" mb="md">
                            {resourceConfig[type as ResourceType]?.description}
                          </Text>

                          <Group position="apart">
                            <Button
                              variant="light"
                              color={resourceConfig[type as ResourceType]?.color}
                              onClick={() => handleViewResource(item.uid)}
                              leftIcon={<IconEye size={16} />}
                            >
                              View
                            </Button>

                            <ActionIcon
                              color="yellow"
                              variant={isFavorite(item.uid) ? "filled" : "light"}
                              onClick={() => toggleFavorite(item.uid, item.name)}
                              size="lg"
                            >
                              {isFavorite(item.uid) ? <IconStarFilled size={18} /> : <IconStar size={18} />}
                            </ActionIcon>
                          </Group>
                        </Card>
                      ))
                  }
                </SimpleGrid>
              )}

              {/* Overlay loading state */}
              {isFetching && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: theme.colorScheme === 'dark'
                      ? 'rgba(0, 0, 0, 0.4)'
                      : 'rgba(255, 255, 255, 0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1,
                    backdropFilter: 'blur(2px)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Box sx={{ textAlign: 'center' }}>
                    <Skeleton height={30} width={150} mb="sm" />
                    <Text color="dimmed" size="sm">Loading resources...</Text>
                  </Box>
                </Box>
              )}

              {/* Empty state */}
              {!isLoadingData && items.length === 0 && (
                <Center py="xl">
                  <Box sx={{ textAlign: 'center' }}>
                    <Text size="lg" weight={500} mb="md">
                      No resources found
                    </Text>
                    <Text color="dimmed" size="sm" mb="md">
                      Try adjusting your search or filters
                    </Text>
                    {searchValue && (
                      <Button
                        variant="outline"
                        onClick={() => setSearchValue('')}
                        size="sm"
                      >
                        Clear search
                      </Button>
                    )}
                  </Box>
                </Center>
              )}
            </Box>

            {totalPages > 1 && (
              <>
                <Paper withBorder p="xs" radius="sm" mt="md" mb="xs" sx={{ backgroundColor: theme.colors.blue[0] }}>
                  <Text color="dimmed" size="xs" align="center">
                    <b>Note:</b> The SWAPI API has limited pagination support. Search results don't support pagination,
                    and some resource types may return incomplete data. This is a limitation of the external API, not the application.
                  </Text>
                </Paper>
                <Group position="center" mt="xs">
                  <Pagination
                    total={totalPages}
                    value={currentPage}
                    onChange={handlePageChange}
                    withEdges
                    sx={(theme) => ({
                      [theme.fn.smallerThan('sm')]: {
                        '.mantine-Pagination-control': {
                          minWidth: 30,
                          height: 30,
                          fontSize: theme.fontSizes.xs,
                        }
                      },
                      [theme.fn.smallerThan('xs')]: {
                        '.mantine-Pagination-control:not(.mantine-Pagination-active):not(:first-of-type):not(:last-of-type)': {
                          display: 'none',
                        }
                      }
                    })}
                  />
                </Group>
              </>
            )}
          </>
        )}
      </Paper>
    </>
  );
};

export default ResourceList;
