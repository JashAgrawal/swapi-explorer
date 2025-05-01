# Star Wars Explorer

A React application that allows users to explore the Star Wars universe using the SWAPI (Star Wars API).

## Features

- **Authentication System**: Mock login system with protected routes
- **Resource Browsing**: View lists of Star Wars resources (people, planets, films, etc.)
- **Detailed Information**: Explore detailed information about each resource
- **Related Data**: Discover relationships between resources (e.g., a character's homeworld, films they appear in)
- **Search & Filter**: Find specific resources quickly
- **Responsive Design**: Works on all device sizes

## Tech Stack

- **React**: UI library
- **TypeScript**: Type safety
- **React Router**: Navigation and routing
- **Mantine UI**: Component library and styling
- **React Query**: Data fetching and caching
- **Zustand**: State management
- **SWAPI**: Star Wars API (https://swapi.tech)

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173`

## Usage

### Authentication

- Use the demo credentials:
  - Username: `demo`
  - Password: `password`

### Exploring Resources

- After logging in, you'll be taken to the dashboard
- Select a resource type (People, Planets, etc.) from the navigation
- Browse the list of resources
- Click on any resource to view detailed information
- Explore related resources through the tabs on the detail page

## Project Structure

```
src/
├── api/          # API service functions
├── components/   # Reusable UI components
├── pages/        # Page components
├── store/        # Zustand stores
├── theme/        # Mantine theme configuration
└── styles/       # Global styles
```

## Design Decisions

### Authentication

The application uses a mock authentication system with Zustand for state management. In a real-world application, this would be connected to a backend authentication service.

### Data Fetching

React Query is used for data fetching, providing:
- Automatic caching
- Background refetching
- Loading and error states
- Pagination support

### UI Design

The UI is built with Mantine components, providing:
- Consistent styling
- Responsive layouts
- Accessibility features
- Dark/light mode support

### State Management

Zustand is used for global state management due to its:
- Simplicity
- Small bundle size
- Built-in persistence middleware
- TypeScript support

## Future Improvements

- Add unit and integration tests
- Implement more advanced filtering options
- Add data visualization for statistics
- Implement a favorites system
- Add more detailed relationships between resources

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgements

- [SWAPI](https://swapi.tech) for providing the Star Wars API
- [Mantine](https://mantine.dev) for the UI components
- [React Query](https://tanstack.com/query) for data fetching
- [Zustand](https://github.com/pmndrs/zustand) for state management
