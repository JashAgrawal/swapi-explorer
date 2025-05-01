/**
 * Error Page Component
 * Displayed when an unexpected error occurs in the application
 */
import { FC } from 'react';
import { 
  Container, 
  Title, 
  Text, 
  Button, 
  Group, 
  Stack,
  Paper,
  useMantineTheme,
  Code,
  Collapse,
} from '@mantine/core';
import { IconArrowLeft, IconHome, IconRefresh, IconBug } from '@tabler/icons-react';
import { useNavigate, useRouteError, isRouteErrorResponse } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { useState } from 'react';

const ErrorPage: FC = () => {
  const navigate = useNavigate();
  const theme = useMantineTheme();
  const { isAuthenticated } = useAuthStore();
  const [showDetails, setShowDetails] = useState(false);
  
  // Get the error from React Router
  const error = useRouteError();
  
  // Format the error message
  let errorMessage = 'An unexpected error occurred';
  let errorStatus = 'Error';
  let errorDetails = '';
  
  if (isRouteErrorResponse(error)) {
    // This is a React Router error response
    errorStatus = `${error.status}`;
    errorMessage = error.statusText || errorMessage;
    errorDetails = error.data?.message || JSON.stringify(error.data);
  } else if (error instanceof Error) {
    // This is a JavaScript Error object
    errorMessage = error.message;
    errorDetails = error.stack || '';
  } else if (typeof error === 'string') {
    // This is a string error
    errorMessage = error;
  } else if (error && typeof error === 'object') {
    // This is some other object
    errorMessage = JSON.stringify(error);
  }

  // Determine where to navigate back to based on authentication status
  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate(isAuthenticated ? '/dashboard' : '/');
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <Container size="md" py={80}>
      <Paper withBorder p="xl" radius="md" shadow="md">
        <Stack align="center" spacing="md">
          <IconBug size={56} color={theme.colors.red[6]} />
          
          <Title
            order={1}
            align="center"
            color="red"
            sx={(theme) => ({
              fontWeight: 900,
              [theme.fn.smallerThan('sm')]: {
                fontSize: 32,
              },
            })}
          >
            {errorStatus}
          </Title>

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
            Something went wrong
          </Title>

          <Text color="dimmed" align="center" size="lg">
            {errorMessage}
          </Text>

          <Group position="center" mt="md">
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
            <Button 
              variant="light"
              leftIcon={<IconRefresh size={16} />}
              onClick={handleRefresh}
              color="blue"
            >
              Refresh page
            </Button>
          </Group>

          {errorDetails && (
            <Stack spacing="xs" mt="md" style={{ width: '100%' }}>
              <Button 
                variant="subtle" 
                compact 
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? 'Hide' : 'Show'} technical details
              </Button>
              
              <Collapse in={showDetails}>
                <Code block style={{ whiteSpace: 'pre-wrap', textAlign: 'left' }}>
                  {errorDetails}
                </Code>
              </Collapse>
            </Stack>
          )}
        </Stack>
      </Paper>
    </Container>
  );
};

export default ErrorPage;
