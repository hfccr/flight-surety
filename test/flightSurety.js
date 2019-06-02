/**
 * @author hfccr
 * */
const Test = require('../config/testConfig.js');
const web3 = require('web3');

contract('Flight Surety Tests', async accounts => {
  let config;
  let dataContract;
  let appContract;
  let testAddresses;
  let firstAirline;
  let owner;
  const timestamp = Math.floor(Date.now() / 1000);
  const flight = {
    name: 'flight1',
    source: 'source1',
    sink: 'sink1'
  };

  before('setup contract', async () => {
    config = await Test.Config(accounts);
    await config.flightSuretyData.authorizeCaller(
      config.flightSuretyApp.address
    );
    dataContract = config.flightSuretyData;
    appContract = config.flightSuretyApp;
    testAddresses = config.testAddresses;
    owner = config.owner;
    firstAirline = config.firstAirline;
  });

  describe('Contract ownership', () => {
    it('Data contract has correct contract owner', async () => {
      const contractOwner = await dataContract.contractOwner.call();
      assert.equal(contractOwner, owner, 'Data contract has incorrect owner');
    });

    it('App contract has correct contract owner', async () => {
      const contractOwner = await appContract.contractOwner.call();
      assert.equal(contractOwner, owner, 'App contract has incorrect owner');
    });
  });

  describe('Contract operability switch', () => {
    it('Correct initial operational status', async () => {
      const status = await dataContract.isOperational.call();
      assert.equal(status, true, 'Incorrect initial operational status value');
    });

    it('Non owner cannot change operational status', async () => {
      let denied = false;
      try {
        await dataContract.setOperatingStatus(false, {
          from: testAddresses[0]
        });
      } catch (e) {
        denied = true;
      }
      assert.equal(denied, true, 'Non owner can change operational status');
    });

    it('Owner can change operating status to false', async () => {
      let denied = false;
      try {
        await dataContract.setOperatingStatus(false, {
          from: owner
        });
      } catch (e) {
        denied = true;
      }
      assert.equal(denied, false, 'Owner cannot change operating status');
    });

    it('False operating status blocks dependant calls', async () => {
      let reverted = false;
      try {
        await dataContract.testOperatingStatus.call();
      } catch (e) {
        reverted = true;
      }
      assert.equal(reverted, true, 'False operating status blocks calls');
    });

    it('Owner can revert operating status to true', async () => {
      let denied = false;
      try {
        await dataContract.setOperatingStatus(true, {
          from: owner
        });
      } catch (e) {
        denied = true;
      }
      assert.equal(denied, false, 'Owner cannot change operating status');
    });
  });

  describe('App contract authorization on data contract', () => {
    it('App contract is authorized', async () => {
      let status = await dataContract.isAuth.call(appContract.address);
      assert.equal(
        status,
        true,
        'App contract is not authorized on data contract'
      );
    });

    it('Unknown address is not authorized', async () => {
      let status = await dataContract.isAuth.call(testAddresses[0]);
      assert.equal(
        status,
        false,
        'Unknown address is not authorized on data contract'
      );
    });

    it('Non auth address cannot call authorized data contract function', async () => {
      let reverted = false;
      try {
        await dataContract.testAuthorization.call({
          from: testAddresses[0]
        });
      } catch (e) {
        reverted = true;
      }
      assert.equal(
        reverted,
        true,
        'Unknown address cal call authorized data contract function'
      );
    });
  });

  describe('Airline management', () => {
    const secondAirline = accounts[2];
    const thirdAirline = accounts[3];
    const fourthAirline = accounts[4];
    const fifthAirline = accounts[5];
    const sixthAirline = accounts[6];
    const unregisteredAirline = accounts[7];

    it('Unregistered airline cannot deposit fund', async () => {
      const airlineFunding = await appContract.AIRLINE_FUNDING.call();
      let revert = false;
      try {
        await appContract.fundAirline({
          from: unregisteredAirline,
          value: airlineFunding.toString()
        });
      } catch (e) {
        revert = true;
      }
      assert.equal(revert, true, 'Unregistered airline can deposit fund');
    });

    it('Registered airline can deposit fund', async () => {
      const airlineFunding = await appContract.AIRLINE_FUNDING.call();
      let revert = false;
      try {
        await appContract.fundAirline({
          from: firstAirline,
          value: airlineFunding.toString()
        });
      } catch (e) {
        revert = true;
      }
      assert.equal(revert, false, 'Airline funding failed');
      let result = await dataContract.isAirlineFunded(firstAirline);
      assert.equal(result, true, 'Registered airline cannot deposit fund');
    });

    describe('Below multiparty count behaviour', () => {
      it('Funded airline can register other airlines', async () => {
        let revert = false;
        try {
          await appContract.registerAirline(secondAirline, {
            from: firstAirline
          });
          await appContract.registerAirline(thirdAirline, {
            from: firstAirline
          });
          await appContract.registerAirline(fourthAirline, {
            from: firstAirline
          });
        } catch (e) {
          revert = true;
        }
        assert.equal(revert, false, 'New airline registration failed');
        let secondAirlineResult = await dataContract.isAirlineRegistered(
          secondAirline
        );
        let thirdAirlineResult = await dataContract.isAirlineRegistered(
          thirdAirline
        );
        let fourthAirlineResult = await dataContract.isAirlineRegistered(
          fourthAirline
        );
        assert.equal(
          secondAirlineResult,
          true,
          'Funded airline should be able to register second airlines'
        );
        assert.equal(
          thirdAirlineResult,
          true,
          'Funded airline should be able to register third airlines'
        );
        assert.equal(
          fourthAirlineResult,
          true,
          'Funded airline should be able to register fourth airlines'
        );
      });

      it('Registered airlines can be funded', async () => {
        const airlineFunding = await appContract.AIRLINE_FUNDING.call();
        await appContract.fundAirline({
          from: secondAirline,
          value: airlineFunding.toString()
        });
        await appContract.fundAirline({
          from: thirdAirline,
          value: airlineFunding.toString()
        });
        let secondAirlineResult = await dataContract.isAirlineFunded(
          secondAirline
        );
        let thirdAirlineResult = await dataContract.isAirlineFunded(
          thirdAirline
        );
        assert.equal(
          secondAirlineResult,
          true,
          'Registered airline cannot deposit fund'
        );
        assert.equal(
          thirdAirlineResult,
          true,
          'Registered airline cannot deposit fund'
        );
      });
    });

    describe('Above multiparty count behaviour', () => {
      it('Airline needs multiparty consensus for registration', async () => {
        let registrationStatus;

        await appContract.registerAirline(fifthAirline, {
          from: firstAirline
        });
        registrationStatus = await dataContract.isAirlineRegistered(
          fifthAirline
        );
        assert.equal(
          registrationStatus,
          false,
          'Multiparty consensus failed at first registration attempt'
        );

        await appContract.registerAirline(fifthAirline, {
          from: secondAirline
        });
        registrationStatus = await dataContract.isAirlineRegistered(
          fifthAirline
        );
        assert.equal(
          registrationStatus,
          true,
          'Multiparty consensus cannot be achieved at registration attempt'
        );
      });
      it('Airline cannot register the same airline again', async () => {
        let revert = false;
        await appContract.registerAirline(sixthAirline, {
          from: firstAirline
        });
        try {
          await appContract.registerAirline(sixthAirline, {
            from: firstAirline
          });
        } catch (e) {
          revert = true;
        }
        assert.equal(
          revert,
          true,
          'Airline cannot register the same airline twice'
        );
      });
    });
  });

  describe('Flight management', () => {
    const nonFundedAirline = accounts[4];
    const unregisteredAirline = accounts[8];

    it('Unregistered airline cannot register a flight', async () => {
      let revert = false;
      try {
        result = await appContract.registerFlight(
          flight.name,
          timestamp,
          flight.source,
          flight.sink,
          { from: unregisteredAirline }
        );
      } catch (e) {
        revert = true;
      }
      assert.equal(revert, true, 'Registered airline can register flight');
    });

    it('Registered but non funded airline cannot register a flight', async () => {
      let revert = false;
      try {
        result = await appContract.registerFlight(
          flight.name,
          timestamp,
          flight.source,
          flight.sink,
          { from: nonFundedAirline }
        );
      } catch (e) {
        revert = true;
      }
      assert.equal(
        revert,
        true,
        'Registered but not funded airline can register flight'
      );
    });

    it('Funded airline can register a flight', async () => {
      await appContract.registerFlight(
        flight.name,
        timestamp,
        flight.source,
        flight.sink,
        { from: firstAirline }
      );
      let result = false;
      result = await appContract.isFlightRegistered(
        firstAirline,
        flight.name,
        timestamp,
        { from: firstAirline }
      );
      assert.equal(result, true, 'Funded airline cannot register a flight');
    });
    it('Already registered flight cannot be re registered', async () => {
      let revert = false;
      try {
        await appContract.registerFlight(
          flight.name,
          timestamp,
          flight.source,
          flight.sink,
          { from: firstAirline }
        );
      } catch (e) {
        revert = true;
      }
      assert.equal(
        revert,
        true,
        'Already registered flight can be re registered'
      );
    });
  });

  describe('Insurance management', () => {
    const traveller1 = accounts[9];
    const traveller2 = accounts[10];
    const unregisteredFlight = {
      name: 'frodo',
      source: 'shire',
      sink: 'mordor'
    };

    describe('Insurance purchase', () => {
      it('Insurance can be bought for a registered flight that has not landed', async () => {
        await appContract.buyInsurance(firstAirline, flight.name, timestamp, {
          from: traveller1,
          value: web3.utils.toWei('1', 'ether')
        });
        const result = await appContract.isTravellerInsuredForFlight(
          firstAirline,
          flight.name,
          timestamp,
          traveller1
        );
        assert.equal(
          result,
          true,
          'Insurance cannot be bought for a not landed registered flight'
        );
      });

      it('Insurance can be bought only once for a flight', async () => {
        let revert = false;
        try {
          await appContract.buyInsurance(firstAirline, flight.name, timestamp, {
            from: traveller1,
            value: web3.utils.toWei('1', 'ether')
          });
        } catch (e) {
          revert = true;
        }
        assert.equal(
          revert,
          true,
          'Multiple insurance purchases for the same flight allowed'
        );
      });

      it('Unregistered flight cannot be insured', async () => {
        let revert = false;
        try {
          result = await appContract.buyInsurance(
            firstAirline,
            unregisteredFlight.name,
            timestamp,
            { from: traveller1, value: web3.utils.toWei('1', 'ether') }
          );
        } catch (e) {
          revert = true;
        }
        assert.equal(
          revert,
          true,
          'Unregistered flight insurance function did not revert'
        );
        const result = await appContract.isTravellerInsuredForFlight(
          firstAirline,
          unregisteredFlight.name,
          timestamp,
          traveller1
        );
        assert.equal(result, false, 'Unregistered flight can be insured');
      });
    });

    describe('Insurance claim', () => {
      it('Payout cannot be claimed by a non purchaser', async () => {
        let revert = false;
        try {
          await appContract.pay({
            from: traveller2
          });
        } catch (e) {
          revert = true;
        }
        assert.equal(revert, true, 'Non purchaser can claim payouts');
      });
      it('Payout cannot be claimed if the flight has not landed', async () => {
        let revert = false;
        try {
          await appContract.pay({
            from: traveller1
          });
        } catch (e) {
          revert = true;
        }
        assert.equal(
          revert,
          true,
          'Purchaser cannot claim payout for non landed flights'
        );
      });
    });
  });
});
