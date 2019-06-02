/**
 * Offer a cookie to Neo
 * @author hfccr
 */

const ORACLE_COUNT = 24;
const STATUS_CODES = [10, 20, 30, 40, 50];
class Oracles {
  constructor(flightSuretyApp, accounts, gas) {
    this.flightSuretyApp = flightSuretyApp;
    this.accounts = accounts;
    this.registrationFee = 0;
    this.considerForOracles = [];
    this.oracleAccounts = [];
    this.oracleIndexCache = {};
    this.gas = gas;
  }

  setup = async () => {
    this.considerForOracles = this._getAccountsForOracles(this.accounts);
    this.registrationFee = await this._getRegistrationFee();
    this.oracleAccounts = await this._registerAccountsAsOracles(
      this.considerForOracles
    );
  };

  fulfilRequestByAllOracles = async (airline, flight, timestamp) => {
    await this._generateFlightStatusRequest(airline, flight, timestamp);
    for (const account of this.oracleAccounts) {
      await this._fulfilRequestByOracle(account, airline, flight, timestamp);
    }
  };

  _generateFlightStatusRequest = async (airline, flight, timestamp) => {
    try {
      await this.flightSuretyApp.methods
        .fetchFlightStatus(airline, flight, timestamp)
        .send({ from: airline });
      console.log(`Flight status change request generated`);
    } catch (e) {
      console.log(`Could not open flight status request`);
    }
  };

  _fulfilRequestByOracle = async (account, airline, flight, timestamp) => {
    const statusCode = this._getRandomStatusCode();
    const indexes = await this._getOracleIndexes(account);
    await this._submitResponsesForAllIndexes(
      account,
      indexes,
      airline,
      flight,
      timestamp,
      statusCode
    );
  };

  _getRandomStatusCode = () => {
    const count = STATUS_CODES.length;
    return STATUS_CODES[Math.floor(Math.random() * count)];
  };

  _getOracleIndexes = async account => {
    let indexes = this.oracleIndexCache[account];
    if (indexes === undefined) {
      try {
        indexes = await this.flightSuretyApp.methods
          .getMyIndexes()
          .call({ from: account });
        this.oracleIndexCache[account] = indexes;
      } catch (e) {
        indexes = [];
      }
    }
    return indexes;
  };

  _submitResponsesForAllIndexes = async (
    account,
    indexes,
    airline,
    flight,
    timestamp,
    statusCode
  ) => {
    for (const index of indexes) {
      await this._submitResponse(
        account,
        index,
        airline,
        flight,
        timestamp,
        statusCode
      );
    }
  };

  _submitResponse = async (
    account,
    index,
    airline,
    flight,
    timestamp,
    statusCode
  ) => {
    let success = true;
    try {
      await this.flightSuretyApp.methods
        .submitOracleResponse(index, airline, flight, timestamp, statusCode)
        .send({ from: account, gas: this.gas });
      console.log(`Oracle ${account} used status code ${statusCode}`);
    } catch (e) {
      success = false;
    }
    return success;
  };

  _getAccountsForOracles = accounts => {
    return accounts.slice(1, ORACLE_COUNT + 1);
  };

  _getRegistrationFee = async () => {
    return await this.flightSuretyApp.methods.REGISTRATION_FEE().call();
  };

  _registerAccountAsOracle = async (account, registrationFee) => {
    let success;
    const isOracle = await this.flightSuretyApp.methods
      .isRegisteredOracle(account)
      .call({
        from: account
      });
    if (isOracle) {
      console.log(`Oracle ${account} is already an oracle`);
      return true;
    }
    try {
      await this.flightSuretyApp.methods.registerOracle().send({
        from: account,
        value: registrationFee,
        gas: this.gas
      });
      success = true;
    } catch (e) {
      console.log(`Oracle registration for ${account} failed`);
      console.log(e);
      success = false;
    }
    return success;
  };

  _registerAccountsAsOracles = async oracleAccounts => {
    const registrationFee = this.registrationFee;
    const oraclesUsed = [];
    for (const account of oracleAccounts) {
      const success = await this._registerAccountAsOracle(
        account,
        registrationFee
      );
      if (success) {
        oraclesUsed.push(account);
      }
    }
    return oraclesUsed;
  };
}

export default Oracles;
