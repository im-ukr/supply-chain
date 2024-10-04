import React from 'react';
import PropTypes from 'prop-types';
import { Step, Icon } from 'semantic-ui-react';
import { parseDate } from '../controllers/api';

const Timeline = ({ origins, history }) => {
  if (!history || history.length === 0) return null;

  const stepsData = [
    {
      icon: 'dollar',
      title: 'Sold to Consumer',
      description: parseDate(history[1]?.timestamp),
    },
    {
      icon: 'truck',
      title: 'Sold to Retailer',
      description: parseDate(history[0]?.[0]?.timestamp),
    },
    {
      icon: 'truck',
      title: 'Sold to Distributor',
      description: parseDate(history[0]?.[1]?.timestamp),
    },
    {
      icon: 'filter',
      title: 'Bottled',
      description: parseDate(origins?.bulkToBottled?.timestamp),
    },
    {
      icon: 'theme',
      title: 'Produced',
      description: parseDate(origins?.grapesToBulk?.timestamp),
    },
    {
      icon: 'leaf',
      title: 'Harvested',
      description: parseDate(origins?.grapesData?.harvestDate),
    },
  ];

  return (
    <Step.Group fluid vertical style={{ textAlign: 'center' }}>
      {stepsData.map((step, index) => (
        <Step key={index}>
          <Icon name={step.icon} />
          <Step.Content>
            <Step.Title>{step.title}</Step.Title>
            <Step.Description>{step.description || 'N/A'}</Step.Description>
          </Step.Content>
        </Step>
      ))}
    </Step.Group>
  );
};

Timeline.propTypes = {
  origins: PropTypes.shape({
    bulkToBottled: PropTypes.shape({
      timestamp: PropTypes.string,
    }),
    grapesToBulk: PropTypes.shape({
      timestamp: PropTypes.string,
    }),
    grapesData: PropTypes.shape({
      harvestDate: PropTypes.string,
    }),
  }).isRequired,
  history: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.arrayOf(
        PropTypes.shape({
          timestamp: PropTypes.string,
        })
      ),
      PropTypes.shape({
        timestamp: PropTypes.string,
      }),
    ])
  ).isRequired,
};

export default Timeline;
