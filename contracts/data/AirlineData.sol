pragma solidity ^0.5.8;

import "./AppContractAuthorizable.sol";
import "../common/WithSafeMath.sol";

/// @author hfccr
/// @title Manage airline related data
contract AirlineData is AppContractAuthorizable, WithSafeMath {

    // State transition: UNKNOWN -> REGISTERED -> FUNDED
    enum AirlineState {
        // Unknown/default state
        UNKNOWN,
        // Registered but not funded
        REGISTERED,
        // Registered and funded
        FUNDED
    }

    // Airline info data structure
    struct Airline {
        AirlineState airlineState;
    }

    // All registered airlines
    mapping(address => Airline) public airlines;

    // An array of all registered airline addresses
    // For future parsing needs
    address[] public registeredAirlineAddresses;

    // The count of currently registered airlines
    uint256 private registeredAirlineCount = 0;

    // Airline data events
    event AirlineRegistered(address airline);
    event AirlineFunded(address airline);

    modifier requireIsAirlineRegisteredButNotFunded(address airline) {
        require(
            airlines[airline].airlineState == AirlineState.REGISTERED,
            "Airline is registered but not funded"
        );
        _;
    }

    modifier requireIsAirlineRegistered(address airline) {
        require(
            (airlines[airline].airlineState == AirlineState.REGISTERED) ||
            (airlines[airline].airlineState == AirlineState.FUNDED),
            "Airline is not yet registered"
        );
        _;
    }

    modifier requireIsAirlineFunded(address airline) {
        require(
            airlines[airline].airlineState == AirlineState.FUNDED,
            "Airline is not funded"
        );
        _;
    }

    constructor (address airline) public {
        airlines[airline] = Airline(AirlineState.REGISTERED);
        registeredAirlineAddresses.push(airline);
        registeredAirlineCount = registeredAirlineCount.add(1);
    }

    function registerAirline(
        address _newAirline,
        address _registeringAirline
    )
        external
        requireIsOperational
        requireIsCallerAuthorized
        requireIsAirlineFunded(_registeringAirline)
    {
        registeredAirlineCount = registeredAirlineCount.add(1);
        registeredAirlineAddresses.push(_newAirline);
        airlines[_newAirline] = Airline(AirlineState.REGISTERED);
        emit AirlineRegistered(_newAirline);
    }

    function isAirlineRegistered(address airline)
        public
        view
        returns(bool)
    {
        return (airlines[airline].airlineState == AirlineState.REGISTERED) ||
            (airlines[airline].airlineState == AirlineState.FUNDED);
    }

    function getRegisteredAirlineCount()
        public
        view
        returns (uint256)
    {
        return registeredAirlineCount;
    }

    function fundAirline(address airline)
        external
        payable
        requireIsOperational
        requireIsCallerAuthorized
    {
        airlines[airline].airlineState = AirlineState.FUNDED;
        emit AirlineFunded(airline);
    }

    function isAirlineFunded(address airline)
        public
        view
        returns(bool)
    {
        return airlines[airline].airlineState == AirlineState.FUNDED;
    }
}