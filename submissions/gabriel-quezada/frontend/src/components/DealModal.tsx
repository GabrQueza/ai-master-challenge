import { useEffect, useState } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter,
  Button, Text, Box, Progress, VStack, HStack, Badge, Divider, Spinner, Center
} from '@chakra-ui/react';

export const DealModal = ({ isOpen, onClose, dealId }: { isOpen: boolean, onClose: () => void, dealId: string | null }) => {
  const [deal, setDeal] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && dealId) {
      setLoading(true);
      fetch(`http://localhost:3000/api/deal/${dealId}`)
        .then(res => res.json())
        .then(data => {
          setDeal(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [isOpen, dealId]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay backdropFilter="blur(10px)" />
      <ModalContent>
        <ModalHeader>Deal Analysis: {dealId}</ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          {loading || !deal ? (
            <Center py={10}><Spinner size="xl" color="blue.500" /></Center>
          ) : (
            <VStack spacing={5} align="stretch">
              
              <Box p={4} bg="gray.50" borderRadius="md" borderWidth="1px">
                <HStack justify="space-between" mb={2}>
                  <Text fontWeight="bold" fontSize="lg">Overall Score</Text>
                  <Badge colorScheme={deal.score >= 75 ? 'green' : deal.score >= 40 ? 'yellow' : 'gray'} fontSize="lg" px={3} py={1}>
                    {deal.score} / 100
                  </Badge>
                </HStack>
                <Progress value={deal.score} colorScheme={deal.score >= 75 ? 'green' : deal.score >= 40 ? 'yellow' : 'gray'} size="lg" borderRadius="full" />
              </Box>

              <Divider />

              <Box>
                <Text fontWeight="bold" mb={3}>AI Score Breakdown</Text>
                
                <VStack spacing={3} align="stretch">
                  <ScoreBar label="Deal Stage" value={deal.score_breakdown?.stage} max={30} />
                  <ScoreBar label="Financial Valuation" value={deal.score_breakdown?.financial} max={40} />
                  <ScoreBar label="Time in Pipeline" value={deal.score_breakdown?.time} max={30} />
                </VStack>
              </Box>

              <Box p={3} bg="blue.50" borderLeft="4px solid" borderColor="blue.500" borderRadius="sm">
                <Text fontSize="sm" color="blue.800">
                  <strong>Explanation:</strong> {deal.score_breakdown?.explanation}
                </Text>
              </Box>

            </VStack>
          )}
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const ScoreBar = ({ label, value, max }: { label: string, value: number, max: number }) => (
  <Box>
    <HStack justify="space-between" mb={1}>
      <Text fontSize="sm" color="gray.600">{label}</Text>
      <Text fontSize="sm" fontWeight="bold">{value} / {max}</Text>
    </HStack>
    <Progress value={(value / max) * 100} size="sm" colorScheme="blue" borderRadius="full" />
  </Box>
);
