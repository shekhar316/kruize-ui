import React from 'react';
import { Grid, GridItem, Card, CardBody } from '@patternfly/react-core';

interface MetricsOverviewProps {
  datasources: any[];
  experiments: any[];
}

const MetricsOverview: React.FC<MetricsOverviewProps> = ({ datasources, experiments }) => {
  return (
    <Grid hasGutter>
      <GridItem span={4}>
        <Card>
          <CardBody>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                Active Datasources
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1f2937' }}>
                {datasources.length}
              </div>
            </div>
          </CardBody>
        </Card>
      </GridItem>
      <GridItem span={4}>
        <Card>
          <CardBody>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                Total Experiments
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1f2937' }}>
                {experiments.length}
              </div>
            </div>
          </CardBody>
        </Card>
      </GridItem>
      <GridItem span={4}>
        <Card>
          <CardBody>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                Optimization Status
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#10b981' }}>
                Active
              </div>
            </div>
          </CardBody>
        </Card>
      </GridItem>
    </Grid>
  );
};

export { MetricsOverview };

// Made with Bob
