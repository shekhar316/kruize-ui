import React, { useEffect, useState } from 'react';
import { Table, Thead, Tr, Th, Tbody, Td } from '@patternfly/react-table';
import { Badge, Button } from '@patternfly/react-core';
import { getRecommendationsURL } from '@app/CentralConfig';
import { CheckCircleIcon, ExclamationCircleIcon } from '@patternfly/react-icons';

interface RecommendationsListProps {
  experiments: any[];
}

const RecommendationsList: React.FC<RecommendationsListProps> = ({ experiments }) => {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await fetch(getRecommendationsURL());
        const data = await response.json();
        
        if (data && Array.isArray(data)) {
          setRecommendations(data.slice(0, 10));
        }
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [experiments]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading recommendations...</div>;
  }

  if (recommendations.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
        No recommendations available. Create experiments to generate recommendations.
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <Table aria-label="Recommendations table" variant="compact">
        <Thead>
          <Tr>
            <Th>Experiment Name</Th>
            <Th>Workload</Th>
            <Th>Container</Th>
            <Th>Status</Th>
            <Th>Potential Savings</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {recommendations.map((rec, index) => (
            <Tr key={index}>
              <Td>{rec.experiment_name || '-'}</Td>
              <Td>{rec.kubernetes_objects?.[0]?.name || '-'}</Td>
              <Td>{rec.kubernetes_objects?.[0]?.containers?.[0]?.container_name || '-'}</Td>
              <Td>
                {rec.recommendations ? (
                  <Badge icon={<CheckCircleIcon />} style={{ backgroundColor: '#10b981' }}>
                    Available
                  </Badge>
                ) : (
                  <Badge icon={<ExclamationCircleIcon />} style={{ backgroundColor: '#f59e0b' }}>
                    Pending
                  </Badge>
                )}
              </Td>
              <Td>-</Td>
              <Td>
                <Button variant="link" size="sm">View Details</Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </div>
  );
};

export { RecommendationsList };

// Made with Bob
