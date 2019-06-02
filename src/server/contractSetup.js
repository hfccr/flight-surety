/**
 * @author hfccr
 * */
import provide from './contractProvider';
import connectContracts from './connectContracts';
import Oracles from './oracles';
import Airlines from './airlines';
import Flights from './flights';
import eventListener from './eventListener';

const GAS = 6721975;

const sleep = async (ms) => {
  await new Promise(resolve => setTimeout(resolve, ms));
};

const setupAccounts = async (web3) => {
  const accounts = await web3.eth.getAccounts();
  web3.eth.defaultAccount = accounts[0];
  return accounts;
};

const setupListeners = (flightSuretyApp, flightSuretyData) => {
  eventListener(flightSuretyApp, flightSuretyData);
};

const setupOracles = async (flightSuretyApp, accounts) => {
  const oracles = new Oracles(flightSuretyApp, accounts, GAS);
  await oracles.setup();
  return oracles;
};

const setupAirlines = async (flightSuretyApp, flightSuretyData, accounts) => {
  const airlines = new Airlines(flightSuretyApp, flightSuretyData, accounts, GAS);
  await airlines.setup();
  return airlines;
};

const setupFlights = async (flightSuretyApp, accounts) => {
  const flights = new Flights(flightSuretyApp, accounts, GAS);
  await flights.setup();
  return flights;
};

const setup = async () => {
  const { flightSuretyApp, flightSuretyData, web3 } = provide();
  setupListeners(flightSuretyApp, flightSuretyData);
  const accounts = await setupAccounts(web3);
  await connectContracts(flightSuretyApp, flightSuretyData, accounts, GAS);
  const oracles = await setupOracles(flightSuretyApp, accounts);
  const airlines = await setupAirlines(flightSuretyApp, flightSuretyData, accounts);
  const flights = await setupFlights(flightSuretyApp, accounts);
  return {
    accounts,
    oracles,
    airlines,
    flights,
    flightSuretyApp,
    flightSuretyData,
    web3,
    GAS
  };
};

export default setup;
