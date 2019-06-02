pragma solidity ^0.5.8;

import "../../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

/// @author hfccr
/// Provide uint256 safemath for children
contract WithSafeMath {

    // Make sure uint256 math operations are safe
    // from overflow and underflow
    using SafeMath for uint256;

}
