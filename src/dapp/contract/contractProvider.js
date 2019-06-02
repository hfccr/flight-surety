/**
 * @author hfccr
 * */
import FlightSuretyApp from '../../../build/contracts/FlightSuretyApp.json';
import FlightSuretyData from '../../../build/contracts/FlightSuretyData.json';
import Config from './../config.json';
import Web3 from 'web3';

const GAS = 6721975;

const initWeb3 = async url => {
  let web3;
  // Modern dapp browsers...
  if (window.ethereum) {
    web3 = new Web3(ethereum);
    try {
      // Request account access if needed
      await ethereum.enable();
    } catch (error) {
      // User denied account access...
    }
  }
  // Legacy dapp browsers...
  else if (window.web3) {
    web3 = new Web3(web3.currentProvider);
  }
  // Non-dapp browsers...
  else {
    web3 = new Web3.providers.WebsocketProvider(
      config.url.replace('http', 'ws')
    );
  }
  return web3;
};

const initAccounts = async web3 => {
  const accounts = await web3.eth.getAccounts();
  return accounts;
};

const provide = async network => {
  let config = Config[network];
  let web3 = await initWeb3(config.url);
  let accounts = await initAccounts(web3);
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
    web3,
    accounts,
    GAS
  };
};

export default provide;
