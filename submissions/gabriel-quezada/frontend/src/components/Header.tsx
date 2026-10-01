import { SimpleGrid, Box, Stat, StatLabel, StatNumber } from '@chakra-ui/react';

type KpiStats = {
  totalPipelineValue: number;
  totalDeals: number;
  conversionRate: string;
  hotDealsCount: number;
};

export const Header = ({ stats }: { stats: KpiStats }) => {
  if (!stats) return null;

  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
      <Card
        title="Total Pipeline Value"
        value={`$${stats.totalPipelineValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
      />
      <Card title="Total Deals" value={stats.totalDeals} />
      <Card title="Win Rate" value={stats.conversionRate} />
      <Card title="Hot Deals (>75 pts)" value={stats.hotDealsCount} highlight />
    </SimpleGrid>
  );
};

const Card = ({ title, value, highlight }: { title: string; value: string | number; highlight?: boolean }) => (
  <Box
    p={5}
    shadow="md"
    borderWidth="1px"
    borderRadius="lg"
    bg="white"
    borderTop={highlight ? '4px solid' : 'none'}
    borderTopColor="orange.400"
  >
    <Stat>
      <StatLabel fontSize="md" color="gray.500">{title}</StatLabel>
      <StatNumber fontSize="2xl" fontWeight="bold" color={highlight ? 'orange.500' : 'gray.700'}>
        {value}
      </StatNumber>
    </Stat>
  </Box>
);
