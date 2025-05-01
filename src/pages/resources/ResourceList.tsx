/**
 * Resource List Component
 * Displays a paginated table of resources with search and filtering
 */
import { FC, useState, useEffect, useMemo } from 'react';
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
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import {
  IconSearch,
  IconAlertCircle,
  IconEye,
  IconArrowsSort,
} from '@tabler/icons-react';
import {
  getResources,
  ResourceType,
  ResourceListItem,
  SearchResultItem,
  PaginatedResponse,
  SearchResponse
} from '../../api/swapi';

// Resource type display configuration
const resourceConfig: Record<ResourceType, { label: string; color: string }> = {
  people: { label: 'People', color: 'blue' },
  planets: { label: 'Planets', color: 'teal' },
  films: { label: 'Films', color: 'violet' },
  species: { label: 'Species', color: 'grape' },
  vehicles: { label: 'Vehicles', color: 'orange' },
  starships: { label: 'Starships', color: 'pink' },
};

const ResourceList: FC = () => {
  const { type = 'people' } = useParams<{ type: ResourceType }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const theme = useMantineTheme();

  // Get current page and search from URL params
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const currentSearch = searchParams.get('search') || '';

  // Local state for search input with debounce
  const [searchValue, setSearchValue] = useState(currentSearch);
  const [debouncedSearch] = useDebouncedValue(searchValue, 500);

  // Sort state for name column (null = no sort, true = ascending, false = descending)
  const [nameSort, setNameSort] = useState<boolean | null>(null);

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

  // Apply client-side sorting if needed
  const items = useMemo(() => {
    if (nameSort === null) return baseItems;

    return [...baseItems].sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();

      // Sort ascending (A-Z) or descending (Z-A)
      return nameSort
        ? nameA.localeCompare(nameB) // true = ascending
        : nameB.localeCompare(nameA); // false = descending
    });
  }, [baseItems, nameSort]);

  // Handle name column sort toggle
  const handleNameSort = () => {
    // Cycle through: null (no sort) -> true (ascending) -> false (descending) -> null
    setNameSort(prev => {
      if (prev === null) return true; // First click: sort ascending
      if (prev === true) return false; // Second click: sort descending
      return null; // Third click: back to no sort
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

  return (
    <>
      <Group position="apart" mb="md">
        <Title order={2}>
          {resourceConfig[type as ResourceType]?.label || 'Resources'}
          <Badge ml="xs" size="lg" color={resourceConfig[type as ResourceType]?.color}>
            {totalRecords} total
          </Badge>
        </Title>

        <TextInput
          placeholder="Search..."
          icon={<IconSearch size={16} />}
          value={searchValue}
          onChange={(e) => setSearchValue(e.currentTarget.value)}
          sx={{ width: 250 }}
          rightSection={
            searchValue && (
              <ActionIcon onClick={() => setSearchValue('')} size="xs" radius="xl" variant="transparent">
                ×
              </ActionIcon>
            )
          }
        />
      </Group>

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
              <Table striped highlightOnHover>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>
                      <Group spacing="xs" sx={{ cursor: 'pointer' }} onClick={handleNameSort}>
                        <Text>Name</Text>
                        <ActionIcon
                          size="xs"
                          color={nameSort !== null ? 'blue' : 'gray'}
                        >
                          {nameSort === true ? (
                            <IconArrowsSort size={14} style={{ transform: 'rotate(180deg)' }} />
                          ) : nameSort === false ? (
                            <IconArrowsSort size={14} />
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
                            <Text weight={500}>{item.name}</Text>
                          </td>
                          <td>
                            <Tooltip label="View details">
                              <ActionIcon
                                color={resourceConfig[type as ResourceType]?.color}
                                onClick={() => handleViewResource(item.uid)}
                              >
                                <IconEye size={16} />
                              </ActionIcon>
                            </Tooltip>
                          </td>
                        </tr>
                      ))}
                </tbody>
              </Table>

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
