pragma solidity ^0.5.8;

import "./AirlineData.sol";

/// @author hfccr
/// @title Manage flight related data for Flight Surety Insurance
contract FlightData is AirlineData {

    // State transition: UNKNNOWN -> REGISTERED
    enum FlightRegistrationState {
        UNKNOWN,
        REGISTERED
    }

    struct Flight {
        FlightRegistrationState registrationState;
        address airline;
        string flight;
        string source;
        string sink;
        uint256 timestamp;
        uint8 statusCode;
        bool hasStatusChanged;
    }

    mapping (bytes32 => Flight) public flights;
    bytes32[] public registeredFlights;

    event FlightRegistered(bytes32 flightKey);
    event FlightStatusUpdated(bytes32 flightKey, uint8 statusCode);

    modifier requireFlightNotRegistered(bytes32 flightKey) {
        require(
            !(
                flights[flightKey].registrationState ==
                FlightRegistrationState.REGISTERED),
            "Flight already registered"
        );
        _;
    }

    modifier requireFlightRegistered(bytes32 flightKey) {
        require(
            (
                flights[flightKey].registrationState ==
                FlightRegistrationState.REGISTERED
            ),
            "Flight not registered"
        );
        _;
    }

    modifier requireFlightNotLanded(bytes32 flightKey) {
        require(
            flights[flightKey].statusCode == 0,
            "Flight already landed"
        );
        _;
    }

    modifier requireFlightStatusUnchanged(bytes32 flightKey) {
        require(
            !flights[flightKey].hasStatusChanged,
            "Flight status already changed"
        );
        _;
    }

    constructor (address airline) AirlineData(airline) public {}

    function registerFlight(
        bytes32 flightKey,
        address airline,
        string memory flight,
        uint256 timestamp,
        string memory source,
        string memory sink
    )
        public
        payable
        requireIsOperational
        requireIsCallerAuthorized
        requireIsAirlineFunded(airline)
        requireFlightNotRegistered(flightKey)
    {
        flights[flightKey] = Flight(
            FlightRegistrationState.REGISTERED,
            airline,
            flight,
            source,
            sink,
            timestamp,
            0,
            false
        );
        registeredFlights.push(flightKey);
        emit FlightRegistered(flightKey);
    }

    function isFlightRegistered(bytes32 flightKey)
        public
        view
        returns (bool)
    {
        return (
            flights[flightKey].registrationState ==
            FlightRegistrationState.REGISTERED
        );
    }

    function getFlightStatusCode(bytes32 flightKey)
        public
        view
        returns (uint8)
    {
        return flights[flightKey].statusCode;
    }

    function getRegisteredFlightCount()
        public
        view
        returns (uint)
    {
        return registeredFlights.length;
    }

    function getNthFlightKey(uint256 n)
        public
        view
        returns (bytes32)
    {
        return registeredFlights[n];
    }

    function updateFlightStatus(
        bytes32 flightKey,
        uint8 statusCode
    )
        internal
        requireIsOperational
        requireIsCallerAuthorized
        requireFlightNotLanded(flightKey)
        requireFlightStatusUnchanged(flightKey)
    {
        flights[flightKey].statusCode = statusCode;
        flights[flightKey].hasStatusChanged = true;
        emit FlightStatusUpdated(flightKey, statusCode);
    }

    function isFlightLanded(bytes32 flightKey)
        public
        view
        returns (bool)
    {
        return flights[flightKey].statusCode != 0;
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