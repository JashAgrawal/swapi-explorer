/**
 * Application Shell Component
 * Provides the main layout for authenticated pages
 */
import { FC, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import usePageTransition from "../hooks/usePageTransition";
import {
  AppShell as MantineAppShell,
  Navbar,
  Header,
  Footer,
  Text,
  MediaQuery,
  Burger,
  useMantineTheme,
  Group,
  ActionIcon,
  Title,
  Box,
  Divider,
  NavLink,
  Avatar,
} from "@mantine/core";
import {
  IconUser,
  IconPlanet,
  IconMovie,
  IconAlien,
  IconCar,
  IconRocket,
  IconLogout,
  IconChevronRight,
  IconHome,
} from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";

const AppShell: FC = () => {
  const theme = useMantineTheme();
  const [opened, setOpened] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  // Use our custom hook for page transitions
  const { isLoading: isNavigating } = usePageTransition({
    minLoadingTime: 300,
    maxLoadingTime: 3000,
  });

  // Navigation items for the sidebar
  const navItems = [
    {
      icon: <IconUser size={16} />,
      color: "blue",
      label: "People",
      path: "/resources/people",
    },
    {
      icon: <IconPlanet size={16} />,
      color: "teal",
      label: "Planets",
      path: "/resources/planets",
    },
    {
      icon: <IconMovie size={16} />,
      color: "violet",
      label: "Films",
      path: "/resources/films",
    },
    {
      icon: <IconAlien size={16} />,
      color: "grape",
      label: "Species",
      path: "/resources/species",
    },
    {
      icon: <IconCar size={16} />,
      color: "orange",
      label: "Vehicles",
      path: "/resources/vehicles",
    },
    {
      icon: <IconRocket size={16} />,
      color: "pink",
      label: "Starships",
      path: "/resources/starships",
    },
  ];

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <MantineAppShell
      styles={{
        main: {
          background:
            theme.colorScheme === "dark"
              ? theme.colors.dark[8]
              : theme.colors.gray[0],
        },
      }}
      navbarOffsetBreakpoint="sm"
      asideOffsetBreakpoint="sm"
      navbar={
        <Navbar
          p="md"
          hiddenBreakpoint="sm"
          hidden={!opened}
          width={{ sm: 200, lg: 250 }}
        >
          <Navbar.Section grow>
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                label={item.label}
                icon={item.icon}
                rightSection={<IconChevronRight size={12} stroke={1.5} />}
                color={item.color}
                onClick={() => {
                  navigate(item.path);
                  setOpened(false);
                }}
                mb={8}
              />
            ))}
          </Navbar.Section>

          <Navbar.Section>
            <Divider my="sm" />
            <Group position="apart" px="xs" py="md">
              <Group spacing="sm">
                <Avatar color="blue" radius="xl">
                  {user?.name.charAt(0) || "U"}
                </Avatar>
                <Box>
                  <Text size="sm" weight={500}>
                    {user?.name || "User"}
                  </Text>
                  <Text color="dimmed" size="xs">
                    {user?.email || "user@example.com"}
                  </Text>
                </Box>
              </Group>

              <ActionIcon
                color="red"
                variant="subtle"
                onClick={handleLogout}
                title="Logout"
              >
                <IconLogout size={18} />
              </ActionIcon>
            </Group>
          </Navbar.Section>
        </Navbar>
      }
      header={
        <Header height={{ base: 50, md: 70 }} p="md">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              height: "100%",
              justifyContent: "space-between",
            }}
          >
            <Group>
              <MediaQuery largerThan="sm" styles={{ display: "none" }}>
                <Burger
                  opened={opened}
                  onClick={() => setOpened((o) => !o)}
                  size="sm"
                  color={theme.colors.gray[6]}
                  mr="xl"
                />
              </MediaQuery>

              <Link
                to={"/dashboard"}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <Title order={3}>Star Wars Explorer</Title>
              </Link>
            </Group>

            <Group>
              <Link to="/">
                <ActionIcon
                  variant="filled"
                  color="blue"
                  size="lg"
                  radius="md"
                  title="Home"
                >
                  <IconHome size={20} />
                </ActionIcon>
              </Link>
            </Group>
          </div>

          {/* Navigation loading indicator */}
          {isNavigating && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                right: 0,
                height: 3,
                width: 80,
                background: `linear-gradient(90deg,
                  ${theme.colors.blue[5]},
                  ${theme.colors.violet[5]},
                  ${theme.colors.pink[5]},
                  ${theme.colors.orange[5]})`,
                backgroundSize: "200% 100%",
                animation: "loading 1.5s infinite linear",
                borderRadius: "xl",
                "@keyframes loading": {
                  "0%": { backgroundPosition: "0% 0%" },
                  "100%": { backgroundPosition: "200% 0%" },
                },
              }}
            />
          )}

          {/* Global loading indicator */}
          {isNavigating && (
            <Box
              sx={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 3,
                background: `linear-gradient(90deg,
                  ${theme.colors.blue[5]},
                  ${theme.colors.violet[5]},
                  ${theme.colors.pink[5]},
                  ${theme.colors.orange[5]})`,
                backgroundSize: "200% 100%",
                animation: "loading 1.5s infinite linear",
                "@keyframes loading": {
                  "0%": { backgroundPosition: "0% 0%" },
                  "100%": { backgroundPosition: "200% 0%" },
                },
              }}
            />
          )}
        </Header>
      }
      footer={
        <Footer height={60} p="md">
          <Group position="apart" spacing="xl">
            <Text size="sm" color="dimmed">
              Star Wars Explorer - Built with React & Mantine
            </Text>
            <Text size="sm" color="dimmed">
              Data provided by SWAPI
            </Text>
          </Group>
        </Footer>
      }
    >
      <Box p="md" sx={{ position: "relative" }}>
        {/* Content loading overlay */}
        {isNavigating && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(255, 255, 255, 0.5)",
              backdropFilter: "blur(1px)",
              zIndex: 100,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "opacity 0.2s ease",
            }}
          >
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                border: `3px solid ${theme.colors.gray[2]}`,
                borderTopColor: theme.colors.blue[6],
                animation: "spin 1s infinite linear",
                "@keyframes spin": {
                  "0%": { transform: "rotate(0deg)" },
                  "100%": { transform: "rotate(360deg)" },
                },
              }}
            />
          </Box>
        )}
        <Outlet />
      </Box>
    </MantineAppShell>
  );
};

export default AppShell;
