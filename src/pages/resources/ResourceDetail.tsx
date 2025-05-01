/**
 * Resource Detail Component
 * Displays detailed information about a specific resource
 * with related data enrichment
 */
import { FC, useState } from 'react';
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
} from '@mantine/core';
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

// Resource type configuration
const resourceConfig: Record<ResourceType, {
  label: string;
  color: string;
  icon: JSX.Element;
}> = {
  people: { label: 'People', color: 'blue', icon: <IconUser size={16} /> },
  planets: { label: 'Planets', color: 'teal', icon: <IconPlanet size={16} /> },
  films: { label: 'Films', color: 'violet', icon: <IconMovie size={16} /> },
  species: { label: 'Species', color: 'grape', icon: <IconAlien size={16} /> },
  vehicles: { label: 'Vehicles', color: 'orange', icon: <IconCar size={16} /> },
  starships: { label: 'Starships', color: 'pink', icon: <IconRocket size={16} /> },
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

  // Validate resource type
  const validType = resourceConfig[type as ResourceType] ? type as ResourceType : 'people';

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

    return Object.entries(properties)
      .filter(([key]) => !excludeProps.includes(key))
      .map(([key, value]) => (
        <Grid.Col span={6} key={key}>
          <Paper p="xs" withBorder>
            <Text size="xs" color="dimmed" transform="uppercase">
              {key.replace('_', ' ')}
            </Text>
            <Text>
              {value || 'N/A'}
            </Text>
          </Paper>
        </Grid.Col>
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

      {/* Back button */}
      <Group mb="md">
        <Button
          variant="subtle"
          leftIcon={<IconArrowLeft size={16} />}
          onClick={handleBackToList}
        >
          Back to {config.label}
        </Button>
      </Group>

      {/* Main content */}
      <Paper withBorder p="md" radius="md">
        <Group position="apart" mb="xs">
          <Title order={2}>
            {getResourceName(properties)}
          </Title>
          <Badge size="lg" color={config.color}>
            {config.label}
          </Badge>
        </Group>

        <Text color="dimmed" mb="md">
          {data.result.description || `Detailed information about this ${validType.slice(0, -1)}.`}
        </Text>

        <Divider mb="md" />

        <Tabs value={activeTab} onTabChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="details" icon={<IconInfoCircle size={14} />}>
              Details
            </Tabs.Tab>
            {renderRelatedTabs()}
          </Tabs.List>

          <Tabs.Panel value="details" pt="xs">
            <Grid mt="md">
              {renderProperties()}
            </Grid>
          </Tabs.Panel>

          {/* Dynamic tabs for related resources */}
          {Object.keys(properties).map(key => (
            <Tabs.Panel key={key} value={key} pt="xs">
              {renderRelatedContent()}
            </Tabs.Panel>
          ))}
        </Tabs>
      </Paper>
    </>
  );
};

export default ResourceDetail;
