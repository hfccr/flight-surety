pragma solidity ^0.5.8;

import "./DataInterface.sol";

/// @author hfccr
/// @title Provide data contract instance and modifiers
contract DataApi {
    DataInterface flightSuretyData;
    address payable dataContractAddress;

    constructor(address payable flightSuretyDataContractAddress) public {
        flightSuretyData = DataInterface(flightSuretyDataContractAddress);
        dataContractAddress = flightSuretyDataContractAddress;
    }

    modifier requireAirlineNotYetRegistered(address airline) {
        require(
            !flightSuretyData.isAirlineRegistered(airline),
            "Airline has already been registered"
        );
        _;
    }

    modifier requireIsAirlineRegistered(address airline) {
        require(
            flightSuretyData.isAirlineRegistered(airline),
            "Airline not registered"
        );
        _;
    }

    modifier requireIsAirlineFunded(address airline) {
        require(
            flightSuretyData.isAirlineFunded(airline),
            "Airline not funded"
        );
        _;
    }

    modifier requireFlightNotRegistered(bytes32 flightKey) {
        require(
            !flightSuretyData.isFlightRegistered(flightKey),
            "Flight is already registered"
        );
        _;
    }

    modifier requireFlightIsRegistered(bytes32 flightKey) {
        require(
            flightSuretyData.isFlightRegistered(flightKey),
            "Flight is not registered"
        );
        _;
    }

    modifier requireFlightIsNotLanded(bytes32 flightKey) {
        require(
            !flightSuretyData.isFlightLanded(flightKey),
            "Flight has not landed"
        );
        _;
    }

    modifier requireTravellerNotInsuredForFlight(
        bytes32 flightKey,
        address traveller
    )
    {
        require(
            !flightSuretyData.isTravellerInsuredForFlight(
                flightKey,
                traveller
            ),
            "Traveller is already insured for this flight"
        );
        _;
    }

    modifier requireIsOperational() {
        require(
            isOperational(),
            "Contract is currently not operational"
        );
        _;
    }

    function isOperational()
        public
        view
        returns(bool)
    {
        return flightSuretyData.isOperational();
    }

}
