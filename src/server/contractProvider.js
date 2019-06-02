/**
 * @author hfccr
 * */
import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import FlightSuretyData from '../../build/contracts/FlightSuretyData.json';
import Config from './config.json';
import Web3 from 'web3';

const provide = () => {
  let config = Config.localhost;
  let web3 = new Web3(
    new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws'))
  );
  const flightSuretyApp = new web3.eth.Contract(
    FlightSuretyApp.abi,
    config.appAddress
  );
  const flightSuretyData = new web3.eth.Contract(
    FlightSuretyData.abi,
    config.dataAddress
  );
  return {
    flightSuretyApp,
    flightSuretyData,
    web3
  };
};

export default provide;