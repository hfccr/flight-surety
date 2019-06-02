pragma solidity ^0.5.8;

import "./FlightApp.sol";

/// @author hfccr
/// @title Manage app logic for flight data
contract InsuranceApp is FlightApp {

    uint256 public constant PREMIUM = 1 ether;
    uint256 private constant PAYOUT_PERCENT = 150;

    constructor(address payable dataContract)
      FlightApp(dataContract)
      public
    {
    }

    function buyInsurance (
        address airline,
        string memory flight,
        uint256 timestamp
    )
        public
        payable
        requireIsOperational
        requireFlightIsRegistered(
          getFlightKey(airline, flight, timestamp)
        )
        requireFlightIsNotLanded(
          getFlightKey(airline, flight, timestamp)
        )
        requireTravellerNotInsuredForFlight(
            getFlightKey(airline, flight, timestamp), msg.sender
        )
        paidNonZero
        returnExcess(PREMIUM)
    {
        uint256 amount = msg.value;
        dataContractAddress.transfer(PREMIUM);
        flightSuretyData.buy(
            getFlightKey(airline, flight, timestamp),
            msg.sender,
            amount,
            calculatePayout(amount)
        );
    }

    function isTravellerInsuredForFlight(
        address airline,
        string memory flight,
        uint256 timestamp,
        address traveller
    )
        public
        view
        returns (bool)
    {
        bytes32 flightKey = getFlightKey(
            airline,
            flight,
            timestamp
        );
        return flightSuretyData.isTravellerInsuredForFlight(
            flightKey,
            traveller
        );
    }

    function calculatePayout(uint256 amount)
        internal
        pure
        returns(uint256)
    {
        return amount.mul(PAYOUT_PERCENT).div(100);
    }

    function pay() public requireIsOperational {
        flightSuretyData.pay(msg.sender);
    }
}