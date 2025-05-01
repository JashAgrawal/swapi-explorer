/**
 * Not Found (404) Page Component
 * Displayed when a user navigates to a non-existent route
 */
import { FC } from 'react';
import { 
  Container, 
  Title, 
  Text, 
  Button, 
  Group, 
  Image,
  Stack,
  useMantineTheme
} from '@mantine/core';
import { IconArrowLeft, IconHome } from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';

const NotFound: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useMantineTheme();
  const { isAuthenticated } = useAuthStore();

  // Determine where to navigate back to based on authentication status
  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate(isAuthenticated ? '/dashboard' : '/');
  };

  return (
    <Container size="md" py={80}>
      <Stack align="center" spacing="xl">
        <Title
          order={1}
          align="center"
          sx={(theme) => ({
            fontSize: 48,
            fontWeight: 900,
            [theme.fn.smallerThan('sm')]: {
              fontSize: 32,
            },
          })}
        >
          404
        </Title>

        <Image
          src="https://media.giphy.com/media/3o7aD4GrHwn8vsGBTa/giphy.gif"
          alt="These aren't the droids you're looking for"
          width={300}
          height={200}
          fit="contain"
          sx={{ opacity: 0.8 }}
        />

        <Title
          order={2}
          align="center"
          sx={(theme) => ({
            fontWeight: 700,
            [theme.fn.smallerThan('sm')]: {
              fontSize: 24,
            },
          })}
        >
          These aren't the droids you're looking for
        </Title>

        <Text color="dimmed" align="center" size="lg">
          The page at <Text component="span" weight={700} color={theme.primaryColor}>{location.pathname}</Text> does not exist.
          You may have mistyped the address or the page may have moved.
        </Text>

        <Group position="center" mt="xl">
          <Button 
            variant="outline" 
            leftIcon={<IconArrowLeft size={16} />}
            onClick={handleGoBack}
          >
            Go back
          </Button>
          <Button 
            leftIcon={<IconHome size={16} />}
            onClick={handleGoHome}
          >
            Take me home
          </Button>
        </Group>
      </Stack>
    </Container>
  );
};

export default NotFound;
