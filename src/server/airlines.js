/**
 * @author hfccr
 * */
import Config from './config.json';

const config = Config.localhost;
const flightInfo = config.flightInfo;
const firstAirline = config.firstAirline;

class Airline {
  constructor(flightSuretyApp, flightSuretyData, accounts, gas) {
    this.flightSuretyApp = flightSuretyApp;
    this.flightSuretyData = flightSuretyData;
    this.accounts = accounts;
    this.gas = gas;
  }

  setup = async () => {
    const fundingValue = await this._getFundingValue();
    await this._fundFirstAirline(fundingValue);
    await this._addAirlines(fundingValue);
  };

  _getFundingValue = async () => {
    return await this.flightSuretyApp.methods.AIRLINE_FUNDING().call();
  };

  _fundFirstAirline = async fundingValue => {
    await this._fundAirline(firstAirline, fundingValue);
  };

  _addAirlines = async fundingValue => {
    const airlines = flightInfo.airlines;
    for (const airline of airlines) {
      await this._addAirline(airline, fundingValue);
    }
  };

  _addAirline = async (airline, fundingValue) => {
    const airlineAddress = airline.address;
    if (this.accounts.indexOf(airlineAddress) < 0) {
      console.log(`Error: Airline address ${airlineAddress} not in accounts`);
      return false;
    }
    await this._registerAirline(airlineAddress);
    await this._fundAirline(airlineAddress, fundingValue);
  };

  _registerAirline = async airlineAddress => {
    const isRegistered = await this.flightSuretyData.methods
      .isAirlineRegistered(airlineAddress)
      .call({ from: airlineAddress });
    if (isRegistered) {
      console.log(`Airline ${airlineAddress} is already registered`);
      return;
    }
    await this.flightSuretyApp.methods
      .registerAirline(airlineAddress)
      .send({ from: firstAirline, gas: this.gas });
  };

  _fundAirline = async (airlineAddress, fundingValue) => {
    const isFunded = await this.flightSuretyData.methods
      .isAirlineFunded(airlineAddress)
      .call({ from: airlineAddress });
    if (isFunded) {
      console.log(`Airline ${airlineAddress} is already funded`);
      return;
    }
    try {
      await this.flightSuretyApp.methods
        .fundAirline()
        .send({ from: airlineAddress, value: fundingValue, gas: this.gas });
    } catch (e) {
      console.log(e);
      console.log(`Funding ${airlineAddress} failed`);
    }
  };
}

export default Airline;
