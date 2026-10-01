import { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Container, Heading, VStack, useDisclosure, Spinner, Center } from '@chakra-ui/react';
import { Header } from './components/Header';
import { Filters } from './components/Filters';
import { PipelineTable } from './components/PipelineTable';
import { DealModal } from './components/DealModal';

export default function App() {
  const [stats, setStats] = useState<any>(null);
  const [pipeline, setPipeline] = useState<any[]>([]);
  const [filters, setFilters] = useState({});
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingPipeline, setLoadingPipeline] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingStats, setLoadingStats] = useState(true);
  
  const { isOpen, onOpen, onClose } = useDisclosure();

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const res = await fetch('http://localhost:3000/api/stats');
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchPipeline = useCallback(async (pageNum: number, isLoadMore: boolean) => {
    try {
      if (isLoadMore) setLoadingMore(true);
      else setLoadingPipeline(true);

      const queryParams = new URLSearchParams({ ...filters, page: pageNum.toString(), limit: '50' } as any).toString();
      const res = await fetch(`http://localhost:3000/api/pipeline?${queryParams}`);
      const data = await res.json();
      
      if (isLoadMore) {
        setPipeline(prev => [...prev, ...data.data]);
      } else {
        setPipeline(data.data);
      }
      setHasMore(pageNum < data.totalPages);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPipeline(false);
      setLoadingMore(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    setPage(1);
    fetchPipeline(1, false);
  }, [filters, fetchPipeline]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPipeline(nextPage, true);
  };

  const handleOpenDeal = useCallback((id: string) => {
    setSelectedDealId(id);
    onOpen();
  }, [onOpen]);

  return (
    <Box minH="100vh" bg="gray.50" py={8}>
      <Container maxW="container.xl">
        <VStack spacing={8} align="stretch">
          <Heading as="h1" size="xl" color="blue.700">
            Lead Scorer Dashboard
          </Heading>
          
          <Header stats={stats} />
          {loadingStats && !stats && (
             <Center><Spinner color="blue.500" /></Center>
          )}
          <Filters filters={filters} setFilters={setFilters} />
          <PipelineTable 
            data={pipeline} 
            onOpenDeal={handleOpenDeal} 
            loading={loadingPipeline}
            loadingMore={loadingMore}
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
          />
          
        </VStack>
      </Container>
      
      <DealModal isOpen={isOpen} onClose={onClose} dealId={selectedDealId} />
    </Box>
  );
}
