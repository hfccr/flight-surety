/**
 * @author hfccr
 * */
import Config from './config.json';

const config = Config.localhost;
const flightInfo = config.flightInfo;
const flights = flightInfo.flights;

class Flights {
  constructor(flightSuretyApp, accounts, gas) {
    this.flightSuretyApp = flightSuretyApp;
    this.accounts = accounts;
    this.gas = gas;
  }

  setup = async () => {
    this._registerFlights();
  };

  isFlightRegistered = async (airlineAddress, name, timestamp) => {
    let registered = false;
    try {
      registered = await this.flightSuretyApp.methods
        .isFlightRegistered(airlineAddress, name, timestamp)
        .call({ from: airlineAddress });
    } catch (e) {
      console.log(`Flight registeration check failed`);
    }
    return registered;
  };

  getFlightStatus = async (airlineAddress, name, timestamp) => {
    let status;
    try {
      status = await this.flightSuretyApp.methods
        .getFlightStatusCode(airlineAddress, name, timestamp)
        .call({ from: airlineAddress });
    } catch (e) {
      console.log(`Flight status fetch failed`);
    }
    return status;
  };

  _registerFlights = async () => {
    for (const flight of flights) {
      await this._registerFlight(flight);
    }
  };

  _registerFlight = async flight => {
    const {
      name,
      timestamp,
      source,
      sink,
      airlineAddress,
      airlineName
    } = flight;
    const isRegistered = await this.isFlightRegistered(airlineAddress, name, timestamp);
    if (isRegistered) {
      console.log(
        `Flight ${name} ${timestamp} ${airlineName} already registered`
      );
      return;
    }
    try {
      await this.flightSuretyApp.methods
        .registerFlight(name, timestamp, source, sink)
        .send({ from: airlineAddress, gas: this.gas });
    } catch (e) {
      console.log(e);
      console.log(
        `Flight ${name} ${timestamp} ${airlineName} registration failed`
      );
    }
  };
}

export default Flights;
