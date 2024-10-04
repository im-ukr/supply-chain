import React from 'react';
import PropTypes from 'prop-types';
import { Header, Segment, Grid } from 'semantic-ui-react';

const BottleInfo = ({ data }) => {
  if (!data || Object.keys(data).length === 0) return null;

  return (
    <div>
      <Header as="h1">
        {data.year} {data.name}
      </Header>
      <Segment basic style={{ textAlign: 'left' }}>
        <Grid columns={2} style={{ fontSize: '1.1rem' }}>
          <Grid.Row>
            <Grid.Column textAlign="right" width={4}>
              <strong>Strength:</strong>
            </Grid.Column>
            <Grid.Column>{data.alcoholPercentage}%</Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column textAlign="right" width={4}>
              <strong>Additives:</strong>
            </Grid.Column>
            <Grid.Column>None</Grid.Column>
          </Grid.Row>
        </Grid>
      </Segment>
    </div>
  );
};

BottleInfo.propTypes = {
  data: PropTypes.shape({
    year: PropTypes.string,
    name: PropTypes.string,
    alcoholPercentage: PropTypes.number,
  }).isRequired,
};

export default BottleInfo;
