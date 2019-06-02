/**
 * @author hfccr
 * */
const APP_CONTRACT_NAME = 'Flight Surety App';
const DATA_CONTRACT_NAME = 'Flight Surety Data';

const dataEvents = [
  'TravellerInsured',
  'TravellerCredited',
  'AccountWithdrawal',
  'FlightRegistered',
  'FlightStatusUpdated',
  'AirlineRegistered',
  'AirlineFunded',
  'CallerAuthorized',
  'CallerDeauthorized'
];

const appEvents = [
  'FlightStatusInfo',
  'OracleReport',
  'OracleRequest',
  'OracleRegistered'
];

const printResponse = (contractName, eventName, error, event) => {
  const failed = !!error;
  const response = failed ? {} : event.returnValues;
  console.log(
    `Contract: ${contractName} | Event: ${eventName} | Failure: ${failed}
    Response: ${JSON.stringify(response)}
    `
  );
};

const getHandler = (contractName, eventName) => {
  const handler = (error, event) => {
    printResponse(contractName, eventName, error, event);
  };
  return handler;
};

const registerHandlers = (contractName, contract, eventNames, handler) => {
  eventNames.forEach(eventName =>
    registerHandler(contractName, contract, eventName, handler)
  );
};

const registerHandler = (contractName, contract, eventName) => {
  const handler = getHandler(contractName, eventName);
  const event = contract.events[eventName];
  event({}, handler);
  console.log(`Event ${eventName} registered on ${contractName}`);
};

const eventListener = (appContract, dataContract) => {
  registerHandlers(APP_CONTRACT_NAME, appContract, appEvents);
  registerHandlers(DATA_CONTRACT_NAME, dataContract, dataEvents);
};

export default eventListener;
