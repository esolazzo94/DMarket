pragma solidity ^0.4.23;

import '../../node_modules/openzeppelin-solidity/contracts/payment/ConditionalEscrow.sol';
import './Market.sol';

contract MarketEscrow is ConditionalEscrow {
    
address public buyer;    
bytes32 private hashFile;
bytes32 private hashEncryptedFile;
address private marketAddress; 
uint256 private expiration;
address private payee;
uint256 private depositPayee;
uint256 private depositBuyer;
Market private marketIstance;
    
constructor(address addr) public {
    expiration = now + 86400;
    marketAddress = addr;
    depositPayee = 0;
    depositBuyer = 0;
    buyer = msg.sender;
    marketIstance = Market(marketAddress);
    }    
    
function setPayee(address p) public onlyPrimary() {
 payee = p;
}

function setFile(bytes32 hFile, bytes32 hEncryptedFile) public onlyPayee() payable {
    //bytes32 hFile = marketIstance.convert(hFileString);
    //bytes32 hEncryptedFile = marketIstance.convert(hEncryptedFileString);
    require(depositPayee == 0);
    hashFile = hFile;
    hashEncryptedFile = hEncryptedFile;
    depositPayee = msg.value;
}

function getHashAddress() public view onlyPrimary() returns(bytes32) {
    return hashEncryptedFile;
}

function depositFromBuyer() public payable onlyPrimary() {
    require(depositBuyer == 0);
    depositBuyer = msg.value;
}

function withdrawalAllowed(address payee) public view returns (bool) {
      
        address h = marketIstance.getEscrowAddress(hashFile,this.primary());
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

function blockUser(address payee) public onlyPrimary() {
 marketIstance.blockUser(payee,hashFile,this.primary());
}

function resetDeposit() private {
    depositPayee = 0;
    depositBuyer = 0;
}

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