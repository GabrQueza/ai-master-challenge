import { Table, Thead, Tbody, Tr, Th, Td, Badge, Box, Button } from '@chakra-ui/react';

export const PipelineTable = ({ data, onOpenDeal }: { data: any[], onOpenDeal: (id: string) => void }) => {
  const getScoreColor = (score: number) => {
    if (score >= 75) return 'green';
    if (score >= 40) return 'yellow';
    return 'gray';
  };

  return (
    <Box bg="white" shadow="md" borderRadius="lg" overflowX="auto">
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
              <Td isNumeric>${parseFloat(deal.close_value || 0).toLocaleString()}</Td>
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
  );
};
