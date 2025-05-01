/**
 * Login Page Component
 * Handles user authentication with form validation
 */
import { FC, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  TextInput, 
  PasswordInput, 
  Paper, 
  Title, 
  Container, 
  Button, 
  Text, 
  Anchor, 
  Center, 
  Box, 
  Group,
  Alert
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertCircle } from '@tabler/icons-react';
import { useAuthStore } from '../../store/auth.store';

interface LocationState {
  from?: {
    pathname: string;
  };
}

const Login: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  
  // Redirect path after successful login (default to dashboard)
  const from = state?.from?.pathname || '/dashboard';
  
  // Auth store state and actions
  const { login, isAuthenticated, isLoading, error, clearError } = useAuthStore();

  // Form validation with Mantine's useForm
  const form = useForm({
    initialValues: {
      username: '',
      password: '',
    },
    validate: {
      username: (value) => (value.trim().length > 0 ? null : 'Username is required'),
      password: (value) => (value.length > 0 ? null : 'Password is required'),
    },
  });

  // Handle form submission
  const handleSubmit = async (values: { username: string; password: string }) => {
    await login(values.username, values.password);
  };

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  // Clear error when unmounting
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  return (
    <Container size={420} my={40}>
      <Title
        align="center"
        sx={(theme) => ({ 
          fontFamily: theme.fontFamily,
          fontWeight: 900,
        })}
      >
        Welcome to Star Wars Explorer!
      </Title>
      
      <Text color="dimmed" size="sm" align="center" mt={5}>
        Don't have an account yet?{' '}
        <Anchor size="sm" component="button">
          Create account
        </Anchor>
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        {error && (
          <Alert 
            icon={<IconAlertCircle size={16} />} 
            title="Authentication Error" 
            color="red" 
            mb="md"
          >
            {error}
          </Alert>
        )}

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput
            label="Username"
            placeholder="Your username"
            required
            {...form.getInputProps('username')}
          />
          
          <PasswordInput
            label="Password"
            placeholder="Your password"
            required
            mt="md"
            {...form.getInputProps('password')}
          />
          
          <Group position="apart" mt="lg">
            <Anchor component="button" size="sm">
              Forgot password?
            </Anchor>
          </Group>
          
          <Button 
            fullWidth 
            mt="xl" 
            type="submit" 
            loading={isLoading}
          >
            Sign in
          </Button>
        </form>

        <Box mt="md">
          <Center>
            <Text size="xs" color="dimmed">
              Demo credentials: username "demo" / password "password"
            </Text>
          </Center>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;
