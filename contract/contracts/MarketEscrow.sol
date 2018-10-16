pragma solidity ^0.4.23;

import '../../node_modules/openzeppelin-solidity/contracts/payment/ConditionalEscrow.sol';
import './Market.sol';

contract MarketEscrow is ConditionalEscrow {
    
string private hashFile;
string private hashEncryptedFile;
address private marketAddress; 
uint256 private expiration;
address private payee;
uint256 private depositPayee;
uint256 private depositBuyer;
    
constructor(address addr){
    hashFile = 'null';
    expiration = now + 86400;
    marketAddress = addr;
    depositPayee = 0;
    depositBuyer = 0;
    }    
    
function setPayee(address p) public onlyPrimary() {
 payee = p;
}

function setFile(string hFile, string hEncryptedFile) onlyPayee() payable {
    require(depositPayee == 0);
    hashFile = hFile;
    hashEncryptedFile = hEncryptedFile;
    depositPayee = msg.value;
}

function getHashAddress() public onlyPrimary() returns(string) {
    return hashEncryptedFile;
}

function depositFromBuyer() public payable onlyPrimary() {
    require(depositBuyer == 0);
    depositBuyer = msg.value;
}

function withdrawalAllowed(address payee) public view returns (bool) {

        Market m = Market(marketAddress);
        
        address h = m.getEscrowAddress(hashFile,this.primary());
        //if(stringsEqual(hashFile,h)) return true;
        if (h == address(this)) {           
            return true;
        }
        else {          
            return false;
        }
    }

function withdraw(address payee) public onlyPrimary() {
    require(withdrawalAllowed(payee));
    payee.transfer(depositPayee);
    msg.sender.transfer(depositBuyer);
    resetDeposit();
    super.withdraw(payee);
  }

function resetDeposit() private {
    depositPayee = 0;
    depositBuyer = 0;
}


/*
function stringsEqual(string storage _a, string memory _b) internal returns (bool) {
		bytes storage a = bytes(_a);
		bytes memory b = bytes(_b);
		if (a.length != b.length)
			return false;
		// @todo unroll this loop
		for (uint i = 0; i < a.length; i ++)
			if (a[i] != b[i])
				return false;
		return true;
	}
*/

function refundBuyer(address payee) public onlyPrimary() {
    if (!withdrawalAllowed(payee)){
        //this.primary().transfer(depositPayee);
        msg.sender.transfer(depositPayee);
        msg.sender.transfer(depositBuyer);
        resetDeposit();
        msg.sender.transfer(depositsOf(payee));
        selfdestruct(msg.sender);
    }       
}

modifier onlyPayee() {
    require(msg.sender == payee);
    _;
  }


}