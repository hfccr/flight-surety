pragma solidity ^0.5.8;

import "./OracleUtil.sol";

/// @author hfccr
/// @title Manage oracle registration
contract OracleRegistration is OracleUtil {

    uint256 public constant REGISTRATION_FEE = 1 ether;

    struct Oracle {
        bool isRegistered;
        uint8[3] indexes;
    }

    mapping(address => Oracle) oracles;

    event OracleRegistered(
        address oracle,
        uint8 index1,
        uint8 index2,
        uint8 index3
    );

    function isRegisteredOracle(address oracleAddress)
        public
        view
        returns(bool)
    {
        return oracles[oracleAddress].isRegistered;
    }

    function registerOracle() external payable {
        require(
            msg.value >= REGISTRATION_FEE,
            "Registration fee not enough"
        );
        uint8[3] memory indexes = generateIndexes(msg.sender);
        oracles[msg.sender] = Oracle({
            isRegistered: true,
            indexes: indexes
        });
        emit OracleRegistered(
            msg.sender,
            indexes[0],
            indexes[1],
            indexes[2]
        );
    }

}