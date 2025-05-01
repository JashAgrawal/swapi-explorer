/**
 * Dashboard Component
 * Main landing page after authentication
 */
import { FC } from 'react';
import { 
  Title, 
  Text, 
  SimpleGrid, 
  Paper, 
  ThemeIcon, 
  Group, 
  Button,
  useMantineTheme
} from '@mantine/core';
import { 
  IconUser, 
  IconPlanet, 
  IconMovie, 
  IconAlien, 
  IconCar, 
  IconRocket,
  IconArrowRight
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';

// Resource category definition
interface ResourceCategory {
  title: string;
  icon: JSX.Element;
  color: string;
  description: string;
  path: string;
}

const Dashboard: FC = () => {
  const navigate = useNavigate();
  const theme = useMantineTheme();
  const { user } = useAuthStore();

  // Resource categories with icons and descriptions
  const categories: ResourceCategory[] = [
    {
      title: 'People',
      icon: <IconUser size={24} />,
      color: 'blue',
      description: 'Explore characters from the Star Wars universe',
      path: '/resources/people',
    },
    {
      title: 'Planets',
      icon: <IconPlanet size={24} />,
      color: 'teal',
      description: 'Discover planets and their characteristics',
      path: '/resources/planets',
    },
    {
      title: 'Films',
      icon: <IconMovie size={24} />,
      color: 'violet',
      description: 'Browse all Star Wars films and their details',
      path: '/resources/films',
    },
    {
      title: 'Species',
      icon: <IconAlien size={24} />,
      color: 'grape',
      description: 'Learn about the various species in the galaxy',
      path: '/resources/species',
    },
    {
      title: 'Vehicles',
      icon: <IconCar size={24} />,
      color: 'orange',
      description: 'Explore vehicles used for transportation',
      path: '/resources/vehicles',
    },
    {
      title: 'Starships',
      icon: <IconRocket size={24} />,
      color: 'pink',
      description: 'Discover starships used for space travel',
      path: '/resources/starships',
    },
  ];

  return (
    <>
      <Title order={2} mb="md">
        Welcome, {user?.name || 'Explorer'}!
      </Title>
      
      <Text color="dimmed" mb="xl">
        Explore the Star Wars universe by selecting a category below.
      </Text>
      
      <SimpleGrid
        cols={3}
        spacing="lg"
        breakpoints={[
          { maxWidth: 'md', cols: 2, spacing: 'md' },
          { maxWidth: 'sm', cols: 1, spacing: 'sm' },
        ]}
      >
        {categories.map((category) => (
          <Paper
            key={category.title}
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
            <ThemeIcon 
              color={category.color} 
              size={40} 
              radius="md"
              mb="md"
            >
              {category.icon}
            </ThemeIcon>
            
            <Title order={4} mb="xs">
              {category.title}
            </Title>
            
            <Text size="sm" color="dimmed" mb="md">
              {category.description}
            </Text>
            
            <Group position="right">
              <Button
                variant="subtle"
                color={category.color}
                onClick={() => navigate(category.path)}
                rightIcon={<IconArrowRight size={16} />}
              >
                Explore
              </Button>
            </Group>
          </Paper>
        ))}
      </SimpleGrid>
    </>
  );
};

export default Dashboard;
