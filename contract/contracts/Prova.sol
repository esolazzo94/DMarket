pragma solidity ^0.4.23;

contract A {
    
    address public instance;
    uint public readed;
    
    function deployB() public payable {
        address instanceC = (new B).value(msg.value)(42); // deploy B with `msg.value` wei, and put `42` as argument in constructor
        instance = instanceC;
    }
    
    function test() public  {
    
        B contractB = B(instance);
        
        readed = contractB.getvalue();
        
    }
    
}

contract B {
    uint public num;
    constructor(uint _num) public payable {
        require(msg.value > 0); // value gets transferred from A when A deploys it
        num = _num; // num gets set to 42 when A deploys it
    }
    
    function getvalue() public returns(uint) {
        return num;
    }
    
}