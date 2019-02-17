pragma solidity >=0.4.21 <0.6.0;

contract DappToken {
    string public name = "DappToken";
    string public symbol = "DAPP";
    string public standard = "Dapp Token v1.0";
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;

    constructor(uint256 _initialSupply) public {
        balanceOf[msg.sender] = _initialSupply;
        totalSupply = _initialSupply;
    }
}