import React, { useEffect, useState } from 'react';
import { List, ListItem } from '@patternfly/react-core';
import { TrendingDownIcon, DollarSignIcon } from 'lucide-react';
import { getRecommendationsURL } from '@app/CentralConfig';

interface SavingsOpportunitiesProps {
  experiments: any[];
}

const SavingsOpportunities: React.FC<SavingsOpportunitiesProps> = ({ experiments }) => {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        const response = await fetch(getRecommendationsURL());
        const data = await response.json();
        
        if (data && Array.isArray(data)) {
          const topOpportunities = data
            .filter(rec => rec.recommendations)
            .slice(0, 5);
          setOpportunities(topOpportunities);
        }
      } catch (error) {
        console.error('Error fetching savings opportunities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunities();
  }, [experiments]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading opportunities...</div>;
  }

  if (opportunities.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
        No savings opportunities available yet
      </div>
    );
  }

  return (
    <div style={{ padding: '0.5rem' }}>
      <List isPlain>
        {opportunities.map((opp, index) => (
          <ListItem key={index} style={{ 
            padding: '1rem', 
            marginBottom: '0.75rem',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                flexShrink: 0
              }}>
                <TrendingDownIcon size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: '#1f2937', marginBottom: '0.25rem' }}>
                  {opp.experiment_name || 'Unnamed Experiment'}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  {opp.kubernetes_objects?.[0]?.name || 'Workload optimization available'}
                </div>
              </div>
            </div>
          </ListItem>
        ))}
      </List>
    </div>
  );
};

export { SavingsOpportunities };

// Made with Bob
