import { memo } from 'react';
import { Table, Thead, Tbody, Tr, Th, Td, Badge, Box, Button, Center, Skeleton, Stack } from '@chakra-ui/react';

type PipelineTableProps = {
  data: any[];
  onOpenDeal: (id: string) => void;
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
};

export const PipelineTable = memo(({ data, onOpenDeal, loading, loadingMore, hasMore, onLoadMore }: PipelineTableProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 75) return 'green';
    if (score >= 40) return 'yellow';
    return 'gray';
  };

  if (loading && data.length === 0) {
    return (
      <Stack spacing={4}>
        <Skeleton height="40px" />
        <Skeleton height="40px" />
        <Skeleton height="40px" />
        <Skeleton height="40px" />
      </Stack>
    );
  }

  return (
    <Box>
      <Box bg="white" shadow="md" borderRadius="lg" overflowX="auto" mb={4}>
        <Table variant="simple">
          <Thead bg="gray.50">
            <Tr>
              <Th>ID</Th>
              <Th>Account</Th>
              <Th>Sales Agent</Th>
              <Th>Stage</Th>
              <Th isNumeric>Value</Th>
              <Th>Score</Th>
              <Th></Th>
            </Tr>
          </Thead>
          <Tbody>
            {data.map((deal) => (
              <Tr key={deal.opportunity_id} _hover={{ bg: 'gray.50' }}>
                <Td fontWeight="medium">{deal.opportunity_id}</Td>
                <Td>{deal.account}</Td>
                <Td>{deal.sales_agent}</Td>
                <Td>
                  <Badge colorScheme={deal.deal_stage === 'Won' ? 'blue' : deal.deal_stage === 'Lost' ? 'red' : 'purple'}>
                    {deal.deal_stage}
                  </Badge>
                </Td>
                <Td isNumeric>${parseFloat(deal.close_value || '0').toLocaleString()}</Td>
                <Td>
                  <Badge colorScheme={getScoreColor(deal.score)} px={2} py={1} borderRadius="md" fontSize="sm">
                    {deal.score} pts
                  </Badge>
                </Td>
                <Td>
                  <Button size="sm" colorScheme="blue" variant="ghost" onClick={() => onOpenDeal(deal.opportunity_id)}>
                    Analyze
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
      
      {hasMore && (
        <Center my={6}>
          <Button 
            onClick={onLoadMore} 
            isLoading={loadingMore} 
            loadingText="Carregando..."
            colorScheme="blue" 
            variant="outline"
          >
            Carregar mais dados
          </Button>
        </Center>
      )}
    </Box>
  );
});

