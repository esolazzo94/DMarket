pragma solidity ^0.4.23;

import '../../node_modules/openzeppelin-solidity/contracts/payment/ConditionalEscrow.sol';
import './Market.sol';

contract MarketEscrow is ConditionalEscrow {

enum State {CREATED,DEPOSIT_BUYER,LOADED_FILE,DEPOSIT_SELLER,FINISHED}
State state;
    
address public buyer;    
bytes32 public hashFile;
bytes32 private hashEncryptedFile;
string private addressEncryptedFile; // DA VALUTARE
address private marketAddress; 
uint256 private expiration;
address public payee;
uint256 private depositPayee;
uint256 private depositBuyer;
Market private marketIstance;
    
constructor(address addr,bytes32 hFile) public {
    expiration = now + 86400;
    marketAddress = addr;
    depositPayee = 0;
    depositBuyer = 0;
    buyer = msg.sender;
    hashFile = hFile;
    marketIstance = Market(marketAddress);
    state = State.CREATED;
    }    
    
function setPayee(address p) public onlyPrimary() {
 payee = p;
}

function setFile(bytes32 hFile, bytes32 hEncryptedFile) public onlyPayee() payable {
    //bytes32 hFile = marketIstance.convert(hFileString);
    //bytes32 hEncryptedFile = marketIstance.convert(hEncryptedFileString);
    require(depositPayee == 0);
    require(hashFile == hFile);
    hashEncryptedFile = hEncryptedFile;
    state = State.LOADED_FILE;
    depositPayee = msg.value;
    state = State.DEPOSIT_SELLER;
}

function getHashAddress() public view onlyPrimary() returns(bytes32) {
    return hashEncryptedFile;
}

function depositFromBuyer() public payable onlyPrimary() {
    require(depositBuyer == 0);
    depositBuyer = msg.value;
    state = State.DEPOSIT_BUYER;
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
    state = State.FINISHED;
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
        state = State.FINISHED;
        selfdestruct(msg.sender);
    }       
}

modifier onlyPayee() {
    require(msg.sender == payee);
    _;
  }


}