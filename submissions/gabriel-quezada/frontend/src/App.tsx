import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Container,
  Heading,
  Stack,
  useDisclosure,
  Spinner,
  Center,
} from "@chakra-ui/react";
import { Header } from "./components/Header";
import { Filters } from "./components/Filters";
import { PipelineTable } from "./components/PipelineTable";
import { DealModal } from "./components/DealModal";

export default function App() {
  // All filtered data (no pagination) — used exclusively for KPI computation
  const [allFilteredData, setAllFilteredData] = useState<any[]>([]);
  // Paginated data for the table
  const [pipeline, setPipeline] = useState<any[]>([]);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingPipeline, setLoadingPipeline] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingKpis, setLoadingKpis] = useState(true);

  const { isOpen, onOpen, onClose } = useDisclosure();

  // Fetch ALL filtered items (no limit) for accurate KPI calculation
  const fetchAllFiltered = useCallback(async () => {
    try {
      setLoadingKpis(true);
      const queryParams = new URLSearchParams({
        ...filters,
        limit: "99999",
      } as any).toString();
      const res = await fetch(
        `http://localhost:3000/api/pipeline?${queryParams}`,
      );
      const data = await res.json();
      setAllFilteredData(data.data ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingKpis(false);
    }
  }, [filters]);

  // Fetch paginated data for the visible table
  const fetchPipeline = useCallback(
    async (pageNum: number, isLoadMore: boolean) => {
      try {
        if (isLoadMore) setLoadingMore(true);
        else setLoadingPipeline(true);

        const queryParams = new URLSearchParams({
          ...filters,
          page: pageNum.toString(),
          limit: "50",
        } as any).toString();
        const res = await fetch(
          `http://localhost:3000/api/pipeline?${queryParams}`,
        );
        const data = await res.json();

        if (isLoadMore) {
          setPipeline((prev) => [...prev, ...data.data]);
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
    },
    [filters],
  );

  // Re-fetch both whenever filters change
  useEffect(() => {
    setPage(1);
    fetchAllFiltered();
    fetchPipeline(1, false);
  }, [filters, fetchAllFiltered, fetchPipeline]);

  // ── KPI computation via useMemo ──────────────────────────────────────────
  const kpis = useMemo(() => {
    const totalDeals = allFilteredData.length;
    const wonDeals = allFilteredData.filter(
      (d) => d.deal_stage === "Won",
    ).length;
    const conversionRate =
      totalDeals > 0
        ? ((wonDeals / totalDeals) * 100).toFixed(2) + "%"
        : "0.00%";
    const totalPipelineValue = allFilteredData.reduce(
      (sum, d) => sum + (parseFloat(d.close_value) || 0),
      0,
    );
    // Hot Deals: ONLY active (Engaging | Prospecting) deals with score > 75
    // Won/Lost are closed — they don't need prioritization focus
    const ACTIVE_STAGES = new Set(["Engaging", "Prospecting"]);
    const hotDealsCount = allFilteredData.filter(
      (d) => ACTIVE_STAGES.has(d.deal_stage) && (d.score ?? 0) > 75,
    ).length;

    return {
      totalDeals,
      wonDeals,
      conversionRate,
      totalPipelineValue,
      hotDealsCount,
    };
  }, [allFilteredData]);
  // ────────────────────────────────────────────────────────────────────────

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPipeline(nextPage, true);
  };

  const handleOpenDeal = useCallback(
    (id: string) => {
      setSelectedDealId(id);
      onOpen();
    },
    [onOpen],
  );

  return (
    <Box
      display="flex"
      flexDirection="column"
      h="100vh"
      minH="600px"
      bg="gray.50"
      overflow="hidden"
    >
      {/* Sticky top section */}
      <Box
        as="header"
        bg="white"
        borderBottomWidth="1px"
        borderColor="gray.200"
        shadow="sm"
        flexShrink={0}
        zIndex={10}
      >
        <Container maxW="container.xl" py={4}>
          <Stack spacing={4}>
            <Heading as="h1" size="lg" color="blue.700">
              Lead Scorer Dashboard
            </Heading>
            {loadingKpis && allFilteredData.length === 0 ? (
              <Center py={2}>
                <Spinner color="blue.500" size="sm" />
              </Center>
            ) : (
              <Header stats={kpis} />
            )}
            <Filters filters={filters} setFilters={setFilters} />
          </Stack>
        </Container>
      </Box>

      {/* Scrollable table area */}
      <Box flex={1} overflowY="auto" px={4} py={4} minH="300px">
        <Container maxW="container.xl">
          <PipelineTable
            data={pipeline}
            onOpenDeal={handleOpenDeal}
            loading={loadingPipeline}
            loadingMore={loadingMore}
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
          />
        </Container>
      </Box>

      <DealModal isOpen={isOpen} onClose={onClose} dealId={selectedDealId} />
    </Box>
  );
}
