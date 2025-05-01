/**
 * Landing Page Component
 * Public entry point for the application
 */
import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Title,
  Text,
  Container,
  Group,
  Paper,
  Box,
  Center,
  useMantineTheme,
} from '@mantine/core';
import { IconLogin, IconRocket, IconUser, IconPlanet } from '@tabler/icons-react';
import { useAuthStore } from '../../store/auth.store';

const Landing: FC = () => {
  const navigate = useNavigate();
  const theme = useMantineTheme();
  const { isAuthenticated } = useAuthStore();

  // Handle navigation based on authentication status
  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <Container size="lg" py={40}>
      {/* Hero section */}
      <Box
        sx={{
          position: 'relative',
          backgroundImage: 'linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          padding: '3rem',
          borderRadius: theme.radius.md,
          marginBottom: '2rem',
        }}
      >
        <Box
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            alignItems: 'flex-start',
            paddingBottom: '2rem',
            zIndex: 1,
            position: 'relative',
          }}
        >
          <Title
            sx={{
              color: theme.white,
              fontSize: 48,
              fontWeight: 900,
              lineHeight: 1.1,
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
              '@media (max-width: 768px)': {
                fontSize: 32,
              },
            }}
          >
            Explore the Star Wars Universe
          </Title>
          <Text
            size="xl"
            mt="xl"
            sx={{
              color: theme.white,
              maxWidth: 600,
              textShadow: '0 1px 5px rgba(0, 0, 0, 0.15)',
              '@media (max-width: 768px)': {
                maxWidth: '100%',
                fontSize: theme.fontSizes.sm,
              },
            }}
          >
            Discover characters, planets, starships and more from the Star Wars galaxy.
            A comprehensive database powered by the Star Wars API.
          </Text>
          <Group mt={30}>
            <Button
              size="lg"
              radius="md"
              onClick={handleGetStarted}
              leftIcon={isAuthenticated ? <IconRocket size={20} /> : <IconLogin size={20} />}
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
            </Button>
          </Group>
        </Box>
      </Box>

      {/* Features section */}
      <Container>
        <Title order={2} align="center" mb="xl">
          Features
        </Title>

        <Group position="center" grow>
          <Paper
            p="md"
            radius="md"
            withBorder
            sx={{
              transition: 'transform 200ms ease, box-shadow 200ms ease',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: theme.shadows.md,
              },
            }}
          >
            <Center mb="md">
              <IconUser size={32} color={theme.colors.blue[6]} />
            </Center>
            <Title order={4} align="center" mb="xs">
              Characters
            </Title>
            <Text align="center" color="dimmed" size="sm">
              Explore detailed profiles of all Star Wars characters
            </Text>
          </Paper>

          <Paper
            p="md"
            radius="md"
            withBorder
            sx={{
              transition: 'transform 200ms ease, box-shadow 200ms ease',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: theme.shadows.md,
              },
            }}
          >
            <Center mb="md">
              <IconPlanet size={32} color={theme.colors.teal[6]} />
            </Center>
            <Title order={4} align="center" mb="xs">
              Planets
            </Title>
            <Text align="center" color="dimmed" size="sm">
              Discover planets from across the galaxy
            </Text>
          </Paper>

          <Paper
            p="md"
            radius="md"
            withBorder
            sx={{
              transition: 'transform 200ms ease, box-shadow 200ms ease',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: theme.shadows.md,
              },
            }}
          >
            <Center mb="md">
              <IconRocket size={32} color={theme.colors.pink[6]} />
            </Center>
            <Title order={4} align="center" mb="xs">
              Starships
            </Title>
            <Text align="center" color="dimmed" size="sm">
              Learn about the iconic vessels of Star Wars
            </Text>
          </Paper>
        </Group>

        <Center mt={50}>
          <Button
            variant="outline"
            size="lg"
            radius="md"
            onClick={handleGetStarted}
          >
            {isAuthenticated ? 'Continue to Dashboard' : 'Sign In to Explore'}
          </Button>
        </Center>
      </Container>
    </Container>
  );
};

export default Landing;
