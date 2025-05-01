/**
 * Skeleton Loader Component
 * Provides consistent loading states throughout the application
 */
import { FC } from 'react';
import { Skeleton, Paper, Grid, Box } from '@mantine/core';

interface SkeletonLoaderProps {
  type?: 'table' | 'card' | 'detail' | 'list';
  count?: number;
}

const SkeletonLoader: FC<SkeletonLoaderProps> = ({ 
  type = 'card', 
  count = 3 
}) => {
  // Table row skeletons
  if (type === 'table') {
    return (
      <>
        {Array(count).fill(0).map((_, index) => (
          <tr key={`skeleton-row-${index}`}>
            <td><Skeleton height={20} radius="sm" /></td>
            <td><Skeleton height={20} radius="sm" /></td>
            <td><Skeleton height={20} width={100} radius="sm" /></td>
          </tr>
        ))}
      </>
    );
  }

  // Card skeletons
  if (type === 'card') {
    return (
      <Grid>
        {Array(count).fill(0).map((_, index) => (
          <Grid.Col key={`skeleton-card-${index}`} span={4}>
            <Paper withBorder p="md" radius="md">
              <Skeleton height={30} width="70%" mb="md" />
              <Skeleton height={15} mb="sm" />
              <Skeleton height={15} mb="sm" />
              <Skeleton height={15} width="80%" mb="md" />
              <Skeleton height={36} width={100} mt="md" />
            </Paper>
          </Grid.Col>
        ))}
      </Grid>
    );
  }

  // Detail view skeleton
  if (type === 'detail') {
    return (
      <Box>
        <Skeleton height={40} width={250} mb="lg" />
        <Skeleton height={20} mb="xl" />
        
        <Grid>
          {Array(6).fill(0).map((_, index) => (
            <Grid.Col key={`skeleton-detail-${index}`} span={6}>
              <Paper p="xs" withBorder>
                <Skeleton height={12} width={80} mb="xs" />
                <Skeleton height={20} />
              </Paper>
            </Grid.Col>
          ))}
        </Grid>
      </Box>
    );
  }

  // List item skeletons
  if (type === 'list') {
    return (
      <>
        {Array(count).fill(0).map((_, index) => (
          <Paper key={`skeleton-list-${index}`} withBorder p="md" radius="md" mb="md">
            <Skeleton height={24} width="40%" mb="sm" />
            <Skeleton height={16} mb="xs" />
            <Skeleton height={16} width="70%" />
          </Paper>
        ))}
      </>
    );
  }

  // Default fallback
  return (
    <Box>
      <Skeleton height={40} mb="md" />
      <Skeleton height={20} mb="sm" />
      <Skeleton height={20} mb="sm" />
      <Skeleton height={20} width="70%" />
    </Box>
  );
};

export default SkeletonLoader;
