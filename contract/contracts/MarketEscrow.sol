pragma solidity ^0.4.23;

import '../../node_modules/openzeppelin-solidity/contracts/payment/ConditionalEscrow.sol';
import './Market.sol';

contract MarketEscrow is ConditionalEscrow {

enum State {Contratto_creato,In_attesa_del_venditore,Prodotto_disponibile,In_attesa_del_compratore,Operazione_conclusa}
State public state;
    
address public buyer;    
bytes32 public hashFile;
bytes32 private hashEncryptedFile; // DA VALUTARE
string public keyAddress;
string private addressEncryptedFile; 
address private marketAddress; 
uint256 private expiration;
address public payee;
uint256 private depositPayee;
uint256 private depositBuyer;
Market private marketIstance;

uint256 private _depositSeller;
    
constructor(address addr,bytes32 hFile) public {
    expiration = now + 86400;
    marketAddress = addr;
    depositPayee = 0;
    depositBuyer = 0;
    buyer = msg.sender;
    hashFile = hFile;
    marketIstance = Market(marketAddress);
    state = State.Contratto_creato;
    }    
    
function setPayee(address p) public onlyPrimary() {
 payee = p;
}

function setFile(bytes32 hFile, string hEncryptedFile, string key) public payable onlyPayee()  {
    //bytes32 hFile = marketIstance.convert(hFileString);
    //bytes32 hEncryptedFile = marketIstance.convert(hEncryptedFileString);
    /*require(hashFile == hFile);
    addressEncryptedFile = hEncryptedFile;
    keyAddress = key;
    deposit(msg.sender);
    state = State.Prodotto_disponibile;*/
    //require(hashFile == hFile);
    addressEncryptedFile = hEncryptedFile;
    keyAddress = key;
    uint256 amount = msg.value;
    _depositSeller = _depositSeller.add(amount);
    //deposit(msg.sender);
    //depositPayee = msg.value;
    state = State.Prodotto_disponibile;
}

function getHashAddress() public view onlyPrimary() returns(bytes32) {
    return hashEncryptedFile;
}

function depositFromBuyer() public payable onlyPrimary() {
    require(depositBuyer == 0);
    deposit(msg.sender);
    depositBuyer = depositsOf(msg.sender);
    state = State.In_attesa_del_venditore;
}

function depositFromSeller() public payable onlyPayee() {
    
    deposit(msg.sender);
    
    state = State.In_attesa_del_venditore;
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
    state = State.Operazione_conclusa;
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
        state = State.Operazione_conclusa;
        selfdestruct(msg.sender);
    }       
}

modifier onlyPayee() {
    require(msg.sender == payee);
    _;
  }


}