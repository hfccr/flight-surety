pragma solidity ^0.5.8;

import "./AirlineApp.sol";

/// @author hfccr
/// @title Manage application logic for flight data
contract FlightApp is AirlineApp {

    // Flight status codes
    uint8 private constant STATUS_CODE_UNKNOWN = 0;
    uint8 private constant STATUS_CODE_ON_TIME = 10;
    uint8 private constant STATUS_CODE_LATE_AIRLINE = 20;
    uint8 private constant STATUS_CODE_LATE_WEATHER = 30;
    uint8 private constant STATUS_CODE_LATE_TECHNICAL = 40;
    uint8 private constant STATUS_CODE_LATE_OTHER = 50;

    constructor(address payable dataContract)
      AirlineApp(dataContract)
      public
    {

    }

    function registerFlight(
        string calldata flight,
        uint256 timestamp,
        string calldata source,
        string calldata sink
    )
        external
        requireIsOperational
        requireIsAirlineFunded(msg.sender)
        requireFlightNotRegistered(
            getFlightKey(msg.sender, flight, timestamp)
        )
    {
        bytes32 flightKey = getFlightKey(
            msg.sender,
            flight,
            timestamp
        );
        flightSuretyData.registerFlight(
            flightKey,
            msg.sender,
            flight,
            timestamp,
            source,
            sink
        );
    }

    function isFlightRegistered(
        address airline,
        string memory flight,
        uint256 timestamp
    )
        public
        view
        returns (bool)
    {
        bytes32 flightKey = getFlightKey(airline, flight, timestamp);
        return flightSuretyData.isFlightRegistered(flightKey);
    }

    function getFlightStatusCode(
        address airline,
        string memory flight,
        uint256 timestamp

    )
        public
        view
        returns(uint8)
    {
        bytes32 flightKey = getFlightKey(airline, flight, timestamp);
        return flightSuretyData.getFlightStatusCode(flightKey);
    }

    function getFlightKey(
        address airline,
        string memory flight,
        uint256 timestamp
    )
        internal
        pure
        returns(bytes32)
    {
        return keccak256(
            abi.encodePacked(airline, flight, timestamp)
        );
    }

}