pragma solidity ^0.4.23;

//import './MarketEscrow.sol';
import '../../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol';

contract Market {

address private owner;

address public children;

constructor() public {
  owner = msg.sender;
  productsCount = 0;
}


struct user {
  string publicKey;
  string name;
  string avatar;
  bytes32[] products;
  uint256 productsLenght;
  address[] purchaseLUT;
  uint256 purchaseLUTLenght;
  uint256 saleNumber;
  bool blocked;
}

mapping (address => user) public users;

function addUser(address userAddress, string key, string name, string avatar) public {
  require(msg.sender == userAddress);
  users[userAddress].publicKey = key;
  users[userAddress].name = name;
  users[userAddress].avatar = avatar;
  users[userAddress].blocked = false;
  users[userAddress].productsLenght = 0;  
  users[userAddress].purchaseLUTLenght = 0; 
  users[userAddress].saleNumber = 0;
}

function reloadUser(address userAddress, string key, string name, string avatar) public {
  require(msg.sender == userAddress);
  users[userAddress].publicKey = key;
  users[userAddress].name = name;
  users[userAddress].avatar = avatar;
}

function addUserPurchase(address escrowAddress,address userAddress) public  {
  users[userAddress].purchaseLUT.push(escrowAddress);
  users[userAddress].purchaseLUTLenght++;
}


function getUser(address userAddress) public view returns (string,string,string,bool,uint256,uint256,uint256) {
  return (users[userAddress].publicKey,users[userAddress].name,users[userAddress].avatar,users[userAddress].blocked,users[userAddress].productsLenght,users[userAddress].purchaseLUTLenght,users[userAddress].saleNumber);
}



function getUserProduct(address userAddress, uint256 index) public view returns(bytes32) {
  return users[userAddress].products[index];
}

function getUserPurchase(address userAddress, uint256 index) public view returns(address) {
  return users[userAddress].purchaseLUT[index];
}


function getOwner() public view returns (address) {
  return owner;
}
/*
function blockUser(address user, bytes32 product, address buyer) public {
  var requesterAddress = getEscrowAddress(product,buyer);
  if (msg.sender == requesterAddress) {
    users[user].blocked = true;
  }
}*/

struct product {
  string description;
  address seller;
  uint256 price;
  mapping (address => address) purchase;
  address[] purchaseLUT;
  uint256 purchaseLUTLenght;
}

mapping (bytes32 => product) public products;
mapping (uint => bytes32) private productsIndex; //doSomeStuff(accountBalances[accountIndex[i]]);
uint private  productsCount;

function getProductPurchase(bytes32 product, uint256 index) public view returns(address) {
  return products[product].purchaseLUT[index];
}

function getProductPrice(bytes32 product) public view returns(uint256) {
  return products[product].price;
}
/*
function purchase(bytes32 hashFile, address escrowAddress) {
  products[hashFile].purchase[msg.sender] = escrowAddress;
  products[hashFile].purchaseLUT.push(escrowAddress);
  products[hashFile].purchaseLUTLenght++;
  users[products[hashFile].seller].saleNumber++;
}*/

function purchase(bytes32 hashFile, address seller,address buyer) public {
  //require(msg.value == (price*2));
  address instanceEscrowAddress = new MarketEscrow(address(this),buyer,owner,hashFile); 
  /*MarketEscrow instanceEscrow = MarketEscrow(instanceEscrowAddress);
  instanceEscrow.setPayee(seller);
  instanceEscrow.depositFromBuyer.value(msg.value)();

  products[hashFile].purchase[msg.sender] = instanceEscrowAddress;
  products[hashFile].purchaseLUT.push(instanceEscrowAddress);
  products[hashFile].purchaseLUTLenght++;
  users[products[hashFile].seller].saleNumber++;*/

  addUserPurchase(instanceEscrowAddress,msg.sender);
}

function afterEscrow(bytes32 hashFile,address seller, address escrowAddress) public payable {
  require(msg.value == (products[hashFile].price*2));
  
  MarketEscrow instanceEscrow = MarketEscrow(escrowAddress);
  instanceEscrow.setPayee(seller);
  instanceEscrow.depositFromBuyer.value(msg.value)();

  products[hashFile].purchase[msg.sender] = escrowAddress;
  products[hashFile].purchaseLUT.push(escrowAddress);
  products[hashFile].purchaseLUTLenght++;
  users[products[hashFile].seller].saleNumber++;
}

function getEscrowAddress(bytes32 hashFile, address buyer) public view returns(address) {
  return products[hashFile].purchase[buyer];
}

/*function existProduct(string hashFile) public view returns (bool){
  if (products[hashFile].description == "") return false;
  else return true;
}*/

/*
function find(uint value) returns(uint) {
        uint i = 0;
        while (values[i] != value) {
            i++;
        }
        return i;
    }

    function removeByValue(uint value) {
        uint i = find(value);
        removeByIndex(i);
    }
 */


function addProduct(string description, bytes32 hashProduct, uint256 price) public /*payable*/ {
  //bytes32 hashProduct = convert(hashString);
  bytes memory EmptyStringTest = bytes(products[hashProduct].description); 
  if(EmptyStringTest.length == 0) {
    products[hashProduct].description = description;
    products[hashProduct].seller = msg.sender;
    products[hashProduct].price = price;
    users[msg.sender].productsLenght++;
    users[msg.sender].products.push(hashProduct);
    productsIndex[productsCount] = hashProduct;
    productsCount++;
  }
}
/*
function convert(string key) returns (bytes32 ret) {
    if (bytes(key).length > 32) {
      throw;
    }

    assembly {
      ret := mload(add(key, 32))
    }
  }*/
/*
function getProduct(bytes32 hashProduct) public returns(string,address,uint256,uint256) {
  //bytes32 hashProduct = convert(hashString);
  return (products[hashProduct].description,products[hashProduct].seller,products[hashProduct].price,products[hashProduct].purchaseLUTLenght);
}*/

function getProductCode(uint code) public returns(bytes32) {
  return productsIndex[code];
}

function getProductCode() public returns(uint) {
  return productsCount;
}

function deleteProduct(address user, bytes32 hashProduct, uint256 index) public {
  //bytes32 hashProduct = convert(hashString);
  if (msg.sender == user) {
    users[user].products[index] = users[user].products[users[user].products.length-1];
    delete users[user].products[users[user].products.length-1];
    users[user].products.length--;
    delete products[hashProduct];
    users[user].productsLenght--;
  }
}

//function deposit(address payee) public payable
/*
function unblockUser (address user) restricted public {
  users[user].blocked = false;
}*/

  
function kill() restricted public {
    selfdestruct(msg.sender);
  }

modifier restricted() {
    require(msg.sender == owner);
    _;
  }
}

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
address public contractMarketAddress;
address private admin;
    
constructor(address addr, address buyerAddress,address adminAddress,bytes32 hFile) public {
    _expiration = now + 86400;
    contractMarketAddress = addr;
    _depositSeller = 0;
    _depositBuyer = 0;
    buyer = buyerAddress;
    admin = adminAddress;
    hashFile = hFile;
    _marketIstance = Market(contractMarketAddress);
    price = _marketIstance.getProductPrice(hashFile);
    state = State.Contratto_creato;
    }    
    
function setPayee(address p) public onlyContract() {
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

function depositFromBuyer() public payable onlyContract() {
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

function withdraw(bytes32 hFile) public onlyBuyer() returns(bool) {
    if(hashFile == hFile){
        uint256 paymentSeller = _depositBuyer;
        uint256 paymentBuyer = _depositSeller;
        resetDeposit();
        payee.transfer(paymentSeller);
        msg.sender.transfer(paymentBuyer);
        state = State.Operazione_conclusa;
        return true;
    }
    else {
        state = State.Errore_nella_transazione;
        return false;
    }
    
  }

function refund(bytes32 hFile) public {
  require(msg.sender == admin);
  require(state == State.Errore_nella_transazione);
    if(hashFile == hFile){
        uint256 paymentSeller = _depositBuyer;
        uint256 paymentAdmin = _depositSeller;
        resetDeposit();
        payee.transfer(paymentSeller);
        admin.transfer(paymentAdmin);
        state = State.Operazione_conclusa;
    }
    else {
        uint256 paymentBuyer = _depositBuyer;
        paymentAdmin = _depositSeller;
        resetDeposit();
        buyer.transfer(paymentBuyer);
        admin.transfer(paymentAdmin);
        state = State.Operazione_conclusa;
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
 
 modifier onlyContract() {
    require(msg.sender == contractMarketAddress);
    _;
 }


}