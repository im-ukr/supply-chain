import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Accordion, Icon, Header, Grid } from 'semantic-ui-react';
import Map from './Map';
import { parseId } from '../controllers/api';

class Vineyard extends Component {
  state = { open: true };

  handleClick = () => {
    this.setState(prevState => ({ open: !prevState.open }));
  };

  render() {
    const { data } = this.props;
    if (!data || Object.keys(data).length === 0) return null;

    return (
      <div style={{ marginTop: '20px' }}>
        <Accordion>
          <Accordion.Title active={this.state.open} onClick={this.handleClick}>
            <Header as="h1">
              <Icon name="dropdown" />
              Grapes grown at {parseId(data.grapesData?.vineyard)}
            </Header>
          </Accordion.Title>
          <Accordion.Content active={this.state.open} style={{ textAlign: 'left' }}>
            <Grid columns={2} divided="vertically" style={{ fontSize: '1.1rem' }}>
              <Grid.Row>
                <Grid.Column textAlign="right" width={5}>
                  <strong>Altitude:</strong>
                </Grid.Column>
                <Grid.Column>{data.vineyard.altitude}m</Grid.Column>
              </Grid.Row>
              <Grid.Row>
                <Grid.Column textAlign="right" width={5}>
                  <strong>Region:</strong>
                </Grid.Column>
                <Grid.Column>{data.vineyard.region}</Grid.Column>
              </Grid.Row>
              <Grid.Row>
                <Grid.Column textAlign="right" width={5}>
                  <strong>Grape:</strong>
                </Grid.Column>
                <Grid.Column>{data.grapesData?.species}</Grid.Column>
              </Grid.Row>
            </Grid>
            <Map location={[data.vineyard.location.latitude, data.vineyard.location.longitude]} />
          </Accordion.Content>
        </Accordion>
      </div>
    );
  }
}

Vineyard.propTypes = {
  data: PropTypes.shape({
    vineyard: PropTypes.shape({
      altitude: PropTypes.number,
      region: PropTypes.string,
      location: PropTypes.shape({
        latitude: PropTypes.number,
        longitude: PropTypes.number,
      }).isRequired,
    }).isRequired,
    grapesData: PropTypes.shape({
      vineyard: PropTypes.string,
      species: PropTypes.string,
    }).isRequired,
  }).isRequired,
};

export default Vineyard;
