/**
 * @author hfccr
 * */
import React from 'react';
import PropTypes from 'prop-types';
import FlightCard from './FlightCard.jsx';

class Flight extends React.Component {
  render () {
    const { flight } = this.props;
    const {
      name,
      timestamp,
      source,
      sink,
      airlineAddress,
      airlineName
    } = flight;
    return (
      <FlightCard flight={flight} />
    );
  }
}

Flight.propTypes = {
  flight: PropTypes.shape({
    name: PropTypes.string.isRequired,
    timestamp: PropTypes.number.isRequired,
    source: PropTypes.string.isRequired,
    sink: PropTypes.string.isRequired,
    airlineAddress: PropTypes.string.isRequired,
    airlineName: PropTypes.string.isRequired
  })
};

export default Flight;