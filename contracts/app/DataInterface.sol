pragma solidity ^0.5.8;

/// @author hfccr
/// @title Interface for data contract
contract DataInterface {
    function isOperational() public view returns(bool);
    function registerAirline(
        address newAirline,
        address registeringAirline
    )
        external;
    function isAirlineRegistered(address airline)
        external
        view
        returns(bool);
    function getRegisteredAirlineCount()
        public
        view
        returns (uint256);
    function fundAirline(address airline)
        external
        payable;
    function isAirlineFunded(address airline)
        external
        view
        returns(bool);
    function registerFlight(
        bytes32 flightKey,
        address airline,
        string calldata flight,
        uint256 timestamp,
        string calldata source,
        string calldata sink
    )
        external;
    function isFlightRegistered(bytes32 flightKey)
        public
        view
        returns (bool);
    function handleFlightStatusChange(
        bytes32 flightKey,
        uint8 statusCode
    )
        external;
    function getFlightStatusCode(bytes32 flightKey)
        public
        view
        returns(uint8);
    function isFlightLanded(bytes32 flightKey)
        public
        view
        returns (bool);
    function buy(
        bytes32 flightKey,
        address traveller,
        uint256 amount,
        uint256 payout
    )
        external
        payable;
    function pay(address traveller) external;
    function isTravellerInsuredForFlight(
        bytes32 flightKey,
        address traveller
    )
        external
        view
        returns (bool);
}
