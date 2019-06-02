/**
 * @author hfccr
 * */
const addFlightStatusChangeApi = (app, contractSetupPromise) => {
  const validate = (airline, flight, timestampString) => {
    let error = false;
    let errorMessage = '';
    const timestamp = parseInt(timestampString);
    if (airline === undefined || airline === '') {
      error = true;
      errorMessage = 'Airline is required';
    } else if (flight === undefined || flight === '') {
      error = true;
      errorMessage = 'Flight is required';
    } else if (isNaN(timestamp)) {
      error = true;
      errorMessage = 'Timestamp is missing or not a number';
    }
    return { error, errorMessage };
  };

  app.get('/api/flight/status', async (req, res) => {
    const airline = req.query.airline;
    const flight = req.query.flight;
    const timestampString = req.query.timestamp;
    let { error, errorMessage } = validate(airline, flight, timestampString);
    let registered = false;
    let status = 'FAILED STATUS CHECK';
    if (!error) {
      const timestamp = parseInt(timestampString);
      const contractTools = await contractSetupPromise;
      const flights = contractTools.flights;
      registered = await flights.isFlightRegistered(airline, flight, timestamp);
      if (registered) {
        status = await flights.getFlightStatus(airline, flight, timestamp);
      }
    }
    res.json({ error, errorMessage, registered, status });
  });

  app.get('/api/flight/status/change/', async (req, res) => {
    const airline = req.query.airline;
    const flight = req.query.flight;
    const timestampString = req.query.timestamp;
    let { error, errorMessage } = validate(airline, flight, timestampString);
    let success;
    if (!error) {
      const timestamp = parseInt(timestampString);
      const contractTools = await contractSetupPromise;
      const oracles = contractTools.oracles;
      await oracles.fulfilRequestByAllOracles(airline, flight, timestamp);
      error = false;
      success = true;
    }
    res.json({ error, errorMessage });
  });
};

export default addFlightStatusChangeApi;
