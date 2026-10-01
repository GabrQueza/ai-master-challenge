import { Flex, Select } from '@chakra-ui/react';

export const Filters = ({ setFilters }: any) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev: any) => ({ ...prev, [name]: value }));
  };

  return (
    <Flex gap={4} wrap="wrap" bg="white" p={4} borderRadius="lg" shadow="sm">
      <Select placeholder="All Stages" name="deal_stage" onChange={handleChange} bg="white">
        <option value="Prospecting">Prospecting</option>
        <option value="Engaging">Engaging</option>
        <option value="Won">Won</option>
        <option value="Lost">Lost</option>
      </Select>
      
      <Select placeholder="All Regions" name="regional_office" onChange={handleChange} bg="white">
        <option value="East">East</option>
        <option value="West">West</option>
        <option value="Central">Central</option>
      </Select>
    </Flex>
  );
};
