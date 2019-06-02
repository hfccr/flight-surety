pragma solidity ^0.5.8;

import "./Operable.sol";

/// @author hfccr
/// @title Provide access to authorized contracts
contract AppContractAuthorizable is Operable {

    mapping(address => bool) private authorizedAppContracts;

    modifier requireIsCallerAuthorized()
    {
        require(
            authorizedAppContracts[msg.sender] == true,
            "Caller is not an authorized app contract"
        );
        _;
    }

    event CallerAuthorized(address authorizedCaller);

    event CallerDeauthorized(address deauthorizedCaller);

    function isAuth(address contractAddress)
        public
        view
        returns (bool)
    {
        return authorizedAppContracts[contractAddress];
    }

    function authorizeCaller(address contractAddress)
        external
        requireContractOwner
    {
        authorizedAppContracts[contractAddress] = true;
        emit CallerAuthorized(contractAddress);
    }

    function deauthorizeCaller(address contractAddress)
        external
        requireContractOwner
    {
        delete authorizedAppContracts[contractAddress];
        emit CallerDeauthorized(contractAddress);
    }

    function isCallerAuthorized(address contractAddress)
        public
        view
        returns(bool)
    {
        return authorizedAppContracts[contractAddress];
    }

    function testAuthorization()
        public
        view
        requireIsCallerAuthorized
        returns(bool)
    {
        return true;
    }

}