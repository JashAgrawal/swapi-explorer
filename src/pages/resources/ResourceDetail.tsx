/**
 * Resource Detail Component
 * Displays detailed information about a specific resource
 * with related data enrichment and interactive visualizations
 */
import { FC, useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import usePageTransition from '../../hooks/usePageTransition';
import {
  Paper,
  Title,
  Text,
  Group,
  Button,
  Grid,
  Skeleton,
  Alert,
  Divider,
  Badge,
  Tabs,
  Card,
  Box,
  Breadcrumbs,
  Anchor,
  ThemeIcon,
  Image,
  ActionIcon,
  Tooltip,
  ScrollArea,
  Affix,
  Transition,
  SimpleGrid,
  Progress,
  Timeline,
  ColorSwatch,
} from '@mantine/core';
import { useLocalStorage, useWindowScroll } from '@mantine/hooks';
import {
  IconArrowLeft,
  IconAlertCircle,
  IconInfoCircle,
  IconUser,
  IconPlanet,
  IconMovie,
  IconAlien,
  IconCar,
  IconRocket,
  IconStar,
  IconStarFilled,
  IconArrowUp,
  IconShare,
} from '@tabler/icons-react';
import {
  getResourceById,
  ResourceType,
  PersonProperties,
  PlanetProperties,
  FilmProperties,
  SpeciesProperties,
  VehicleProperties,
  StarshipProperties,
  getResourceByUrl,
} from '../../api/swapi';

// Interface for favorite items
interface FavoriteItem {
  id: string;
  type: ResourceType;
  name: string;
  timestamp: number;
}

// Interface for recently viewed items
interface RecentlyViewedItem {
  id: string;
  type: ResourceType;
  name: string;
  timestamp: number;
}

// Resource type configuration with enhanced metadata
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

// Helper to extract ID from URL
const extractIdFromUrl = (url: string): string => {
  const parts = url.split('/');
  return parts[parts.length - 1];
};

// Helper to extract resource type from URL
const extractTypeFromUrl = (url: string): ResourceType | null => {
  const parts = url.split('/');
  const type = parts[parts.length - 2];
  return resourceConfig[type as ResourceType] ? type as ResourceType : null;
};

// Related resource item component
interface RelatedItemProps {
  url: string;
  onNavigate: (type: ResourceType, id: string) => void;
}

const RelatedItem: FC<RelatedItemProps> = ({ url, onNavigate }) => {
  const type = extractTypeFromUrl(url);
  const id = extractIdFromUrl(url);

  const { data, isLoading, isFetching } = useQuery(
    ['resource', url],
    () => getResourceByUrl<any>(url),
    {
      enabled: !!url && !!type,
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    }
  );

  if (!type) return null;

  const config = resourceConfig[type];
  const name = data?.result?.properties?.name || data?.result?.properties?.title || 'Loading...';
  // Use our custom hook for page transitions
  const { isLoading: isPageTransitioning } = usePageTransition();
  const isLoadingData = isLoading || isFetching || isPageTransitioning;

  return (
    <Card
      withBorder
      p="xs"
      radius="md"
      mb="xs"
      sx={{
        position: 'relative',
        transition: 'transform 150ms ease, box-shadow 150ms ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        },
      }}
    >
      <Group>
        <ThemeIcon color={config.color} variant="light" size="md">
          {config.icon}
        </ThemeIcon>

        {isLoadingData ? (
          <Skeleton height={20} width={150} animate={true} />
        ) : (
          <Text size="sm" weight={500}>
            {name}
          </Text>
        )}

        <Button
          variant="subtle"
          compact
          ml="auto"
          onClick={() => onNavigate(type, id)}
          disabled={isLoadingData}
          loading={isFetching && !isLoading}
        >
          View
        </Button>
      </Group>

      {/* Subtle loading indicator for refetching */}
      {isFetching && !isLoading && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, transparent, rgba(34, 139, 230, 0.5), transparent)',
            backgroundSize: '200% 100%',
            animation: 'loading 1.5s infinite',
            '@keyframes loading': {
              '0%': { backgroundPosition: '100% 0' },
              '100%': { backgroundPosition: '-100% 0' },
            },
          }}
        />
      )}
    </Card>
  );
};

// Main component
const ResourceDetail: FC = () => {
  const { type = 'people', id } = useParams<{ type: ResourceType; id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string | null>('details');
  const [scroll, scrollTo] = useWindowScroll();

  // Favorites state
  const [favorites, setFavorites] = useLocalStorage<FavoriteItem[]>({
    key: 'resource-favorites',
    defaultValue: [],
  });

  // Recently viewed state
  const [recentlyViewed, setRecentlyViewed] = useLocalStorage<RecentlyViewedItem[]>({
    key: 'resource-recently-viewed',
    defaultValue: [],
  });

  // Validate resource type
  const validType = resourceConfig[type as ResourceType] ? type as ResourceType : 'people';

  // Add to recently viewed when component mounts or id/type changes
  useEffect(() => {
    if (id) {
      // Get the resource name (will be updated when data loads)
      const name = getResourceName(properties) || `${validType} ${id}`;

      setRecentlyViewed(prev => {
        // Remove this item if it already exists
        const filtered = prev.filter(item => !(item.id === id && item.type === validType));

        // Add to the beginning of the array with current timestamp
        return [
          { id, type: validType, name, timestamp: Date.now() },
          ...filtered,
        ].slice(0, 10); // Keep only the 10 most recent
      });
    }
  }, [id, validType]);

  // Fetch resource details
  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery(
    ['resource', validType, id],
    () => getResourceById(validType, id || ''),
    {
      enabled: !!id,
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: true,
    }
  );

  // Use our custom hook for page transitions
  const { isLoading: isPageTransitioning } = usePageTransition();

  // Show loading state when changing resources or during initial load
  const isLoadingData = isLoading || isFetching || isPageTransitioning;

  // Handle navigation to related resource
  const handleNavigateToRelated = (relatedType: ResourceType, relatedId: string) => {
    navigate(`/resources/${relatedType}/${relatedId}`);
  };

  // Handle back to list
  const handleBackToList = () => {
    navigate(`/resources/${validType}`);
  };

  // Check if current resource is favorited
  const isFavorite = useMemo(() => {
    return favorites.some(item => item.id === id && item.type === validType);
  }, [favorites, id, validType]);

  // Toggle favorite status
  const toggleFavorite = () => {
    if (!properties) return;

    const name = getResourceName(properties);

    setFavorites(prev => {
      if (isFavorite) {
        // Remove from favorites
        return prev.filter(item => !(item.id === id && item.type === validType));
      } else {
        // Add to favorites
        return [...prev, {
          id: id || '',
          type: validType,
          name,
          timestamp: Date.now()
        }];
      }
    });
  };

  // Scroll to top button visibility
  const showScrollToTop = scroll.y > 300;

  // Handle scroll to top
  const handleScrollToTop = () => scrollTo({ y: 0 });

  // Define a union type for all possible property types
  type AllResourceProperties = PersonProperties | PlanetProperties | FilmProperties |
                              SpeciesProperties | VehicleProperties | StarshipProperties;

  // Helper function to get name or title from any resource type
  const getResourceName = (props: AllResourceProperties | null): string => {
    if (!props) return 'Unknown';

    // Handle films which have 'title' instead of 'name'
    if ('title' in props) {
      return (props as FilmProperties).title;
    }

    // Handle all other resources which have 'name'
    if ('name' in props) {
      return (props as Exclude<AllResourceProperties, FilmProperties>).name;
    }

    return 'Unknown';
  };

  // Get resource properties based on type
  const getResourceProperties = (): AllResourceProperties | null => {
    if (!data?.result?.properties) return null;

    const properties = data.result.properties;

    switch (validType) {
      case 'people':
        return properties as PersonProperties;
      case 'planets':
        return properties as PlanetProperties;
      case 'films':
        return properties as FilmProperties;
      case 'species':
        return properties as SpeciesProperties;
      case 'vehicles':
        return properties as VehicleProperties;
      case 'starships':
        return properties as StarshipProperties;
      default:
        return properties as AllResourceProperties;
    }
  };

  const properties = getResourceProperties();
  const config = resourceConfig[validType];

  // Generate property list based on resource type
  const renderProperties = () => {
    if (!properties) return null;

    // Common properties to exclude from general display
    const excludeProps = ['created', 'edited', 'url', 'films', 'species', 'vehicles', 'starships', 'residents', 'people', 'pilots', 'characters', 'planets', 'homeworld'];

    // Format property value based on type
    const formatValue = (key: string, value: any): JSX.Element => {
      // Handle empty values
      if (!value) return <Text color="dimmed">N/A</Text>;

      // Format based on property name
      if (key.includes('date')) {
        // Format dates
        return <Text>{new Date(value).toLocaleDateString()}</Text>;
      } else if (key.includes('color')) {
        // Show colors with a swatch
        return (
          <Group spacing="xs">
            <ColorSwatch color={value} size={16} />
            <Text>{value}</Text>
          </Group>
        );
      } else if (typeof value === 'number' || !isNaN(Number(value))) {
        // Format numbers with commas
        const num = Number(value);
        if (!isNaN(num)) {
          // If it's a large number, format it
          if (num > 1000) {
            return (
              <Group position="apart" noWrap>
                <Text>{num.toLocaleString()}</Text>
                <Progress
                  value={Math.min(100, num / 1000000 * 100)}
                  size="sm"
                  style={{ width: 60 }}
                  color={config.color}
                />
              </Group>
            );
          }
        }
      }

      // Default text display
      return <Text>{value}</Text>;
    };

    return Object.entries(properties)
      .filter(([key]) => !excludeProps.includes(key))
      .map(([key, value]) => (
        <Card key={key} p="md" withBorder radius="md" shadow="sm">
          <Group position="apart" mb="xs">
            <Text size="xs" color="dimmed" transform="uppercase" weight={700}>
              {key.replace(/_/g, ' ')}
            </Text>
            {key === 'name' || key === 'title' ? (
              <Badge color={config.color} size="sm">Primary</Badge>
            ) : null}
          </Group>
          {formatValue(key, value)}
        </Card>
      ));
  };

  // Render related resources tabs
  const renderRelatedTabs = () => {
    if (!properties) return null;

    const tabs = [];

    // Add tabs based on resource type
    if ('films' in properties && Array.isArray(properties.films) && properties.films.length > 0) {
      tabs.push(
        <Tabs.Tab key="films" value="films" icon={<IconMovie size={14} />}>
          Films ({properties.films.length})
        </Tabs.Tab>
      );
    }

    if ('species' in properties && Array.isArray(properties.species) && properties.species.length > 0) {
      tabs.push(
        <Tabs.Tab key="species" value="species" icon={<IconAlien size={14} />}>
          Species ({properties.species.length})
        </Tabs.Tab>
      );
    }

    if ('vehicles' in properties && Array.isArray(properties.vehicles) && properties.vehicles.length > 0) {
      tabs.push(
        <Tabs.Tab key="vehicles" value="vehicles" icon={<IconCar size={14} />}>
          Vehicles ({properties.vehicles.length})
        </Tabs.Tab>
      );
    }

    if ('starships' in properties && Array.isArray(properties.starships) && properties.starships.length > 0) {
      tabs.push(
        <Tabs.Tab key="starships" value="starships" icon={<IconRocket size={14} />}>
          Starships ({properties.starships.length})
        </Tabs.Tab>
      );
    }

    if ('residents' in properties && Array.isArray(properties.residents) && properties.residents.length > 0) {
      tabs.push(
        <Tabs.Tab key="residents" value="residents" icon={<IconUser size={14} />}>
          Residents ({properties.residents.length})
        </Tabs.Tab>
      );
    }

    if ('people' in properties && Array.isArray(properties.people) && properties.people.length > 0) {
      tabs.push(
        <Tabs.Tab key="people" value="people" icon={<IconUser size={14} />}>
          People ({properties.people.length})
        </Tabs.Tab>
      );
    }

    if ('pilots' in properties && Array.isArray(properties.pilots) && properties.pilots.length > 0) {
      tabs.push(
        <Tabs.Tab key="pilots" value="pilots" icon={<IconUser size={14} />}>
          Pilots ({properties.pilots.length})
        </Tabs.Tab>
      );
    }

    if ('characters' in properties && Array.isArray(properties.characters) && properties.characters.length > 0) {
      tabs.push(
        <Tabs.Tab key="characters" value="characters" icon={<IconUser size={14} />}>
          Characters ({properties.characters.length})
        </Tabs.Tab>
      );
    }

    if ('planets' in properties && Array.isArray(properties.planets) && properties.planets.length > 0) {
      tabs.push(
        <Tabs.Tab key="planets" value="planets" icon={<IconPlanet size={14} />}>
          Planets ({properties.planets.length})
        </Tabs.Tab>
      );
    }

    if ('homeworld' in properties && properties.homeworld) {
      tabs.push(
        <Tabs.Tab key="homeworld" value="homeworld" icon={<IconPlanet size={14} />}>
          Homeworld
        </Tabs.Tab>
      );
    }

    return tabs;
  };

  // Render related resources content
  const renderRelatedContent = () => {
    if (!properties || !activeTab || activeTab === 'details') return null;

    // Handle homeworld (single item)
    if (activeTab === 'homeworld' && 'homeworld' in properties) {
      return (
        <Box mt="md">
          <RelatedItem
            url={properties.homeworld as string}
            onNavigate={handleNavigateToRelated}
          />
        </Box>
      );
    }

    // Handle arrays of related items
    // Use type assertion to safely access the property
    const relatedItems = properties[activeTab as keyof AllResourceProperties] as unknown as string[] | undefined;

    if (Array.isArray(relatedItems) && relatedItems.length > 0) {
      return (
        <Box mt="md">
          {relatedItems.map((url: string) => (
            <RelatedItem
              key={url}
              url={url}
              onNavigate={handleNavigateToRelated}
            />
          ))}
        </Box>
      );
    }

    return (
      <Text color="dimmed" mt="md">
        No related {activeTab} found.
      </Text>
    );
  };

  // Render breadcrumbs
  const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: config.label, href: `/resources/${validType}` },
    { title: getResourceName(properties), href: '#' },
  ];

  // Loading skeleton
  if (isLoadingData) {
    return (
      <>
        {/* Breadcrumbs skeleton */}
        <Box mb="md">
          <Skeleton height={20} width={300} />
        </Box>

        <Group mb="md">
          <Button
            variant="subtle"
            leftIcon={<IconArrowLeft size={16} />}
            onClick={handleBackToList}
            disabled={isLoading}
          >
            Back to list
          </Button>
        </Group>

        <Paper withBorder p="md" radius="md" sx={{ position: 'relative' }}>
          <Skeleton height={40} width={200} mb="md" />
          <Skeleton height={20} width="70%" mb="xl" />
          <Skeleton height={30} width={300} mb="md" />

          <Grid>
            {Array(8).fill(0).map((_, i) => (
              <Grid.Col span={6} key={i}>
                <Paper p="xs" withBorder>
                  <Skeleton height={12} width={80} mb="xs" />
                  <Skeleton height={20} />
                </Paper>
              </Grid.Col>
            ))}
          </Grid>

          {/* Show overlay if we're fetching but have existing data */}
          {!isLoading && isFetching && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
                backdropFilter: 'blur(2px)',
                borderRadius: 'md',
                transition: 'all 0.2s ease',
              }}
            >
              <Box sx={{ textAlign: 'center' }}>
                <Skeleton height={40} width={200} mb="sm" />
                <Text color="dimmed" size="sm">Loading resource details...</Text>
              </Box>
            </Box>
          )}
        </Paper>
      </>
    );
  }

  // Error state
  if (isError) {
    return (
      <>
        <Group mb="md">
          <Button
            variant="subtle"
            leftIcon={<IconArrowLeft size={16} />}
            onClick={handleBackToList}
          >
            Back to list
          </Button>
        </Group>

        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Error loading resource"
          color="red"
        >
          {(error as Error)?.message || 'Failed to load resource details. Please try again.'}
          <Button variant="outline" color="red" size="xs" mt="xs" onClick={() => refetch()}>
            Retry
          </Button>
        </Alert>
      </>
    );
  }

  // No data state
  if (!data || !properties) {
    return (
      <>
        <Group mb="md">
          <Button
            variant="subtle"
            leftIcon={<IconArrowLeft size={16} />}
            onClick={handleBackToList}
          >
            Back to list
          </Button>
        </Group>

        <Alert
          icon={<IconInfoCircle size={16} />}
          title="Resource not found"
          color="yellow"
        >
          The requested resource could not be found.
        </Alert>
      </>
    );
  }

  return (
    <>
      {/* Breadcrumbs */}
      <Breadcrumbs mb="md">
        {breadcrumbs.map((item, index) => (
          <Anchor
            key={index}
            href={item.href}
            onClick={(e) => {
              e.preventDefault();
              if (item.href !== '#') {
                navigate(item.href);
              }
            }}
          >
            {item.title}
          </Anchor>
        ))}
      </Breadcrumbs>

      {/* Back button and actions */}
      <Group position="apart" mb="md">
        <Button
          variant="subtle"
          leftIcon={<IconArrowLeft size={16} />}
          onClick={handleBackToList}
        >
          Back to {config.label}
        </Button>

        <Group spacing="xs">
          <Tooltip label={isFavorite ? "Remove from favorites" : "Add to favorites"}>
            <ActionIcon
              color="yellow"
              variant={isFavorite ? "filled" : "light"}
              onClick={toggleFavorite}
              size="lg"
              radius="md"
            >
              {isFavorite ? <IconStarFilled size={18} /> : <IconStar size={18} />}
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Share">
            <ActionIcon
              color="blue"
              variant="light"
              size="lg"
              radius="md"
              onClick={() => {
                // Copy current URL to clipboard
                navigator.clipboard.writeText(window.location.href);
                // In a real app, you would show a notification here
              }}
            >
              <IconShare size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>

      {/* Main content */}
      <Grid gutter="md">
        {/* Left column - Image and key info */}
        <Grid.Col lg={4} md={5} sm={12}>
          <Paper withBorder p="md" radius="md" mb="md">
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Box sx={(theme) => ({
                display: 'flex',
                flexDirection: 'column',
                [theme.fn.smallerThan('sm')]: {
                  flexDirection: 'row',
                  gap: theme.spacing.md,
                },
              })}>
                <Image
                  src={resourceConfig[validType].imagePlaceholder}
                  height={250}
                  alt={getResourceName(properties)}
                  radius="md"
                  withPlaceholder
                  mb="md"
                  sx={(theme) => ({
                    [theme.fn.smallerThan('sm')]: {
                      width: '40%',
                      height: 'auto',
                      minHeight: 150,
                      marginBottom: 0,
                    },
                  })}
                />

                <Box sx={(theme) => ({
                  [theme.fn.smallerThan('sm')]: {
                    flex: 1,
                  },
                })}>
                  <Group position="apart" mb="xs">
                    <Badge size="lg" color={config.color}>
                      {config.label}
                    </Badge>
                    <Text size="sm" color="dimmed">ID: {id}</Text>
                  </Group>

                  <Title order={3} mb="xs" sx={(theme) => ({
                    fontSize: theme.fontSizes.xl,
                    [theme.fn.smallerThan('sm')]: {
                      fontSize: theme.fontSizes.lg,
                    },
                  })}>
                    {getResourceName(properties)}
                  </Title>

                  <Text color="dimmed" mb="md" size="sm">
                    {data.result.description || `Detailed information about this ${validType.slice(0, -1)}.`}
                  </Text>
                </Box>
              </Box>

              {/* Recently viewed section */}
              {recentlyViewed.length > 1 && (
                <>
                  <Divider my="md" label="Recently Viewed" labelPosition="center" />
                  <ScrollArea
                    style={{ height: 150, flexGrow: 1 }}
                    offsetScrollbars
                    sx={(theme) => ({
                      [theme.fn.smallerThan('sm')]: {
                        height: 120,
                      },
                    })}
                  >
                    <Timeline active={0} bulletSize={24} lineWidth={2}>
                      {recentlyViewed
                        .filter(item => !(item.id === id && item.type === validType)) // Exclude current
                        .slice(0, 5) // Show only 5 most recent
                        .map((item) => (
                          <Timeline.Item
                            key={`${item.type}-${item.id}`}
                            bullet={resourceConfig[item.type].icon}
                            title={
                              <Text size="sm" weight={500} lineClamp={1}>
                                {item.name}
                              </Text>
                            }
                          >
                            <Group position="apart" noWrap>
                              <Text color="dimmed" size="xs">
                                {resourceConfig[item.type].label}
                              </Text>
                              <Button
                                variant="subtle"
                                compact
                                size="xs"
                                onClick={() => navigate(`/resources/${item.type}/${item.id}`)}
                              >
                                View
                              </Button>
                            </Group>
                          </Timeline.Item>
                        ))
                      }
                    </Timeline>
                  </ScrollArea>
                </>
              )}
            </Box>
          </Paper>
        </Grid.Col>

        {/* Right column - Details and related */}
        <Grid.Col lg={8} md={7} sm={12}>
          <Paper withBorder p="md" radius="md">
            <Tabs
              value={activeTab}
              onTabChange={setActiveTab}
              sx={(theme) => ({
                [theme.fn.smallerThan('xs')]: {
                  '.mantine-Tabs-tabLabel': {
                    fontSize: theme.fontSizes.xs,
                  }
                },
              })}
            >
              <Tabs.List
                sx={(theme) => ({
                  flexWrap: 'wrap',
                  [theme.fn.smallerThan('xs')]: {
                    gap: 5,
                  },
                })}
              >
                <Tabs.Tab value="details" icon={<IconInfoCircle size={14} />}>
                  Details
                </Tabs.Tab>
                {renderRelatedTabs()}
              </Tabs.List>

              <Tabs.Panel value="details" pt="xs">
                <SimpleGrid
                  cols={2}
                  spacing="md"
                  mt="md"
                  breakpoints={[
                    { maxWidth: 'md', cols: 2 },
                    { maxWidth: 'sm', cols: 1 }
                  ]}
                >
                  {renderProperties()}
                </SimpleGrid>
              </Tabs.Panel>

              {/* Dynamic tabs for related resources */}
              {Object.keys(properties).map(key => (
                <Tabs.Panel key={key} value={key} pt="xs">
                  {renderRelatedContent()}
                </Tabs.Panel>
              ))}
            </Tabs>
          </Paper>
        </Grid.Col>
      </Grid>

      {/* Scroll to top button */}
      <Affix position={{ bottom: 20, right: 20 }}>
        <Transition transition="slide-up" mounted={showScrollToTop}>
          {(transitionStyles) => (
            <ActionIcon
              color="blue"
              variant="filled"
              size="lg"
              radius="xl"
              style={transitionStyles}
              onClick={handleScrollToTop}
            >
              <IconArrowUp size={16} />
            </ActionIcon>
          )}
        </Transition>
      </Affix>
    </>
  );
};

export default ResourceDetail;
