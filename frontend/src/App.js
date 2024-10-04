import React, { Component } from 'react';
import { getBottleData, getOwnershipHistory, getOrigins } from './controllers/trace';
import { Grid, Header } from 'semantic-ui-react';
import BottleInfo from './components/BottleInfo';
import Timeline from './components/Timeline';
import Vineyard from './components/Vineyard';
import { SearchInput, NotFoundMessage } from './components/search';

import 'semantic-ui-css/semantic.min.css';
import './App.css';

class App extends Component {
  state = {
    searchText: '',
    loading: false,
    bottleData: null,
    ownershipHistory: [],
    origins: [],
    couldNotFind: false,
  };

  handleChange = (_, { value }) => {
    this.setState({ searchText: value });
  };

  handleClick = async () => {
    const { searchText } = this.state;
    if (!searchText) return;

    this.setState({ loading: true, couldNotFind: false });

    try {
      const bottleData = await getBottleData(searchText);
      if (bottleData) {
        const [ownershipHistory, origins] = await Promise.all([
          getOwnershipHistory(searchText),
          getOrigins(bottleData),
        ]);

        this.setState({ bottleData, ownershipHistory, origins, loading: false });
      } else {
        this.setState({ couldNotFind: true, loading: false });
      }
    } catch {
      this.setState({ couldNotFind: true, loading: false });
    }
  };

  render() {
    const { searchText, loading, bottleData, ownershipHistory, origins, couldNotFind } = this.state;

    return (
      <div className="App">
        <Grid textAlign="center" style={{ height: '100%', margin: 0 }}>
          <Grid.Column>
            <Header as="h1" style={{ fontSize: '3rem', padding: '50px' }}>
              Wine Tracker
            </Header>
            <SearchInput onChange={this.handleChange} onClick={this.handleClick} loading={loading} />
            <NotFoundMessage render={couldNotFind} />
            <Grid columns={8} stackable style={{ marginTop: '30px' }}>
              <Grid.Column width={2} />
              <Grid.Column width={5}>
                <Timeline history={ownershipHistory} origins={origins} style={{ margin: '10px auto' }} />
              </Grid.Column>
              <Grid.Column width={1} />
              <Grid.Column width={7}>
                {bottleData && (
                  <>
                    <BottleInfo data={bottleData} style={{ margin: '10px auto' }} />
                    <Vineyard data={origins} />
                  </>
                )}
              </Grid.Column>
              <Grid.Column width={1} />
            </Grid>
          </Grid.Column>
        </Grid>
      </div>
    );
  }
}

export default App;
