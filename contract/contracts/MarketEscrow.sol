pragma solidity ^0.4.23;

//import '../../node_modules/openzeppelin-solidity/contracts/payment/ConditionalEscrow.sol';
import '../../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol';
import './Market.sol';

contract MarketEscrow /*is ConditionalEscrow*/ {

using SafeMath for uint256;

enum State {Contratto_creato,In_attesa_del_venditore,Prodotto_disponibile,Errore_nella_transazione,Operazione_conclusa}
State public state;
    
 
bytes32 public hashFile;

string public keyAddress;
string public addressEncryptedFile; 
string public nameFile; 
address private _marketAddress; 
uint256 private _expiration;

uint256 private depositPayee;
uint256 private depositBuyer;
Market private _marketIstance;

uint256 private _depositSeller;
uint256 private _depositBuyer;
uint256 public price;

address public payee;
address public buyer;
    
constructor(address addr,bytes32 hFile) public {
    _expiration = now + 86400;
    _marketAddress = addr;
    _depositSeller = 0;
    _depositBuyer = 0;
    buyer = msg.sender;
    hashFile = hFile;
    _marketIstance = Market(_marketAddress);
    price = _marketIstance.getProductPrice(hashFile);
    state = State.Contratto_creato;
    }    
    
function setPayee(address p) public onlyBuyer() {
 payee = p;
}

function setFile(bytes32 hFile, string hEncryptedFile, string key, string name) public payable onlyPayee()  {
    //bytes32 hFile = marketIstance.convert(hFileString);
    //bytes32 hEncryptedFile = marketIstance.convert(hEncryptedFileString);
    /*require(hashFile == hFile);
    addressEncryptedFile = hEncryptedFile;
    keyAddress = key;
    deposit(msg.sender);
    state = State.Prodotto_disponibile;*/
    require(hashFile == hFile);
    require(msg.value == price);
    addressEncryptedFile = hEncryptedFile;
    keyAddress = key;
    nameFile = name;
    uint256 amount = msg.value;
    _depositSeller = _depositSeller.add(amount);
    //deposit(msg.sender);
    //depositPayee = msg.value;
    state = State.Prodotto_disponibile;
}
/*
function getHashAddress() public view returns(bytes32) {
    return hashEncryptedFile;
}*/

function depositFromBuyer() public payable onlyBuyer() {
    /*require(depositBuyer == 0);
    deposit(msg.sender);
    depositBuyer = depositsOf(msg.sender);*/
    require(msg.value == 2*price);
    uint256 amount = msg.value;
    _depositBuyer = _depositBuyer.add(amount);
    state = State.In_attesa_del_venditore;
}
/*
function depositFromSeller() public payable onlyPayee() {
    
    deposit(msg.sender);
    
    state = State.In_attesa_del_venditore;
}*/
/*
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
}*/

function withdraw(bytes32 hFile) public onlyBuyer() {
    if(hashFile == hFile){
        uint256 paymentSeller = _depositBuyer;
        uint256 paymentBuyer = _depositSeller;
        resetDeposit();
        payee.transfer(paymentSeller);
        msg.sender.transfer(paymentBuyer);
        state = State.Operazione_conclusa;
    }
    else {
        state = State.Errore_nella_transazione;
    }
    
  }

  function resetDeposit() private {
    _depositSeller = 0;
    _depositBuyer = 0;
}

modifier onlyPayee() {
    require(msg.sender == payee);
    _;
  }

modifier onlyBuyer() {
    require(msg.sender == buyer);
    _;
 }


}