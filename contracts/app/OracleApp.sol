pragma solidity ^0.5.8;

import "./InsuranceApp.sol";
import "./OracleRegistration.sol";

/// @author hfccr
/// @title Manage requests and responses
contract OracleApp is OracleRegistration, InsuranceApp {

    // Number of oracles that must respond for valid status
    uint256 private constant MIN_RESPONSES = 3;

    // Track all oracle responses
    // Key = hash(index, flight, timestamp)
    mapping(bytes32 => ResponseInfo) private oracleResponses;

    // Model for responses from oracles
    struct ResponseInfo {
        // Account that requested status
        address requester;
        // If open, oracle responses are accepted
        bool isOpen;
        // Mapping key is the status code reported
        // This lets us group responses and identify
        // the response that majority of the oracles
        mapping(uint8 => address[]) responses;
    }

    // Event fired each time an oracle submits a response
    event FlightStatusInfo(
        address airline,
        string flight,
        uint256 timestamp,
        uint8 statusCode
    );

    event OracleReport(
        address airline,
        string flight,
        uint256 timestamp,
        uint8 statusCode
    );

    // Event fired when flight status request is submitted
    // Oracles track this and if they have a matching index
    // they fetch data and submit a response
    event OracleRequest(
        uint8 index,
        address airline,
        string flight,
        uint256 timestamp
    );

    constructor(address payable dataContract)
        InsuranceApp(dataContract)
        public
    {
    }

    // Generate a request for oracles to fetch flight information
    function fetchFlightStatus(
        address airline,
        string calldata flight,
        uint256 timestamp
    )
        external
    {
        uint8 index = getRandomIndex(msg.sender);
        bytes32 key = keccak256(
            abi.encodePacked(index, airline, flight, timestamp)
        );
        oracleResponses[key] = ResponseInfo({
            requester: msg.sender,
            isOpen: true
        });
        emit OracleRequest(index, airline, flight, timestamp);
    }

   /**
    * @dev Called after oracle has updated flight status
    *
    */
    function processFlightStatus(
        address airline,
        string memory flight,
        uint256 timestamp,
        uint8 statusCode
    )
        internal
    {
        bytes32 flightKey = getFlightKey(
            airline,
            flight,
            timestamp
        );
        flightSuretyData.handleFlightStatusChange(
            flightKey,
            statusCode
        );
    }

    function getMyIndexes()
        external
        view
        returns(uint8[3] memory)
    {
        require(
            oracles[msg.sender].isRegistered,
            "Not registered a FlightSurety oracle"
        );
        return oracles[msg.sender].indexes;
    }

    // Called by oracle when a response is available to an outstanding request
    // For the response to be accepted, there must be a pending request that is open
    // and matches one of the three Indexes randomly assigned to the oracle at the
    // time of registration (i.e. uninvited oracles are not welcome)
    function submitOracleResponse(
        uint8 index,
        address airline,
        string calldata flight,
        uint256 timestamp,
        uint8 statusCode
    )
        external
    {
        require(
            (oracles[msg.sender].indexes[0] == index) ||
            (oracles[msg.sender].indexes[1] == index) ||
            (oracles[msg.sender].indexes[2] == index),
            "Index does not match oracle request"
        );
        bytes32 key = keccak256(
            abi.encodePacked(index, airline, flight, timestamp)
        );
        require(
            oracleResponses[key].isOpen,
            "Flight or timestamp do not match oracle request"
        );
        oracleResponses[key].responses[statusCode].push(msg.sender);
        // Information isn't considered verified until at least MIN_RESPONSES
        // oracles respond with the *** same *** information
        emit OracleReport(airline, flight, timestamp, statusCode);
        if (
            oracleResponses[key].responses[statusCode].length >=
            MIN_RESPONSES
        ) {
            emit FlightStatusInfo(airline, flight, timestamp, statusCode);
            // Handle flight status as appropriate
            processFlightStatus(airline, flight, timestamp, statusCode);
        }
    }

}
