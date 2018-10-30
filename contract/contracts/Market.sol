pragma solidity ^0.4.23;

contract Market {

address private owner;

address public children;

constructor() {
  owner = msg.sender;
  productsCount = 0;
}


struct user {
  string publicKey;
  string name;
  string avatar;
  bytes32[] products;
  uint256 productsLenght;
  bool blocked;
}

mapping (address => user) public users;

function addUser(address userAddress, string key, string name, string avatar) public {
  users[userAddress].publicKey = key;
  users[userAddress].name = name;
  users[userAddress].avatar = avatar;
  users[userAddress].blocked = false;
  users[userAddress].productsLenght = 0;  
}


function getUser(address userAddress) public view returns (string,string,string,bool,uint256) {
  return (users[userAddress].publicKey,users[userAddress].name,users[userAddress].avatar,users[userAddress].blocked,users[userAddress].productsLenght);
}



function getUserProduct(address userAddress, uint256 index) returns(bytes32) {
  return users[userAddress].products[index];
}

function getOwner() public view returns (address) {
  return owner;
}

function blockUser(address user, bytes32 product, address buyer) public {
  var requesterAddress = getEscrowAddress(product,buyer);
  if (msg.sender == requesterAddress) {
    users[user].blocked = true;
  }
}

struct product {
  string description;
  address seller;
  uint256 price;
  mapping (address => address) purchase;
  address[] purchaseLUT;
  uint256 purchaseLUTLenght;
}

mapping (bytes32 => product) public products;
mapping (uint => bytes32) productsIndex; //doSomeStuff(accountBalances[accountIndex[i]]);
uint productsCount;

function purchase(bytes32 hashFile, address escrowAddress) {
  products[hashFile].purchase[msg.sender] = escrowAddress;
  products[hashFile].purchaseLUT.push(msg.sender);
}

function getEscrowAddress(bytes32 hashFile, address buyer) returns(address) {
  return products[hashFile].purchase[buyer];
}

/*function existProduct(string hashFile) public view returns (bool){
  if (products[hashFile].description == "") return false;
  else return true;
}*/


function addProduct(string description, bytes32 hashProduct, uint256 price) public /*payable*/ {
  //bytes32 hashProduct = convert(hashString);
  bytes memory EmptyStringTest = bytes(products[hashProduct].description); 
  if(EmptyStringTest.length == 0) {
    products[hashProduct].description = description;
    products[hashProduct].seller = msg.sender;
    products[hashProduct].price = price;
    users[msg.sender].productsLenght++;
    users[msg.sender].products.push(hashProduct);
  }
}

function convert(string key) returns (bytes32 ret) {
    if (bytes(key).length > 32) {
      throw;
    }

    assembly {
      ret := mload(add(key, 32))
    }
  }

function getProduct(bytes32 hashProduct) public returns(string,address,uint256,uint256) {
  //bytes32 hashProduct = convert(hashString);
  return (products[hashProduct].description,products[hashProduct].seller,products[hashProduct].price,products[hashProduct].purchaseLUTLenght);
}

function deleteProduct(address user, bytes32 hashProduct, uint256 index) public {
  //bytes32 hashProduct = convert(hashString);
  for (uint i = index; i<users[user].products.length-1; i++){
      users[user].products[i] = users[user].products[i+1];
  }
  delete users[user].products[users[user].products.length-1];
  users[user].products.length--;
  delete products[hashProduct];
}

//function deposit(address payee) public payable

function unblockUser (address user) restricted public {
  users[user].blocked = false;
}

  
function kill() restricted public {
    selfdestruct(msg.sender);
  }

modifier restricted() {
    require(msg.sender == owner);
    _;
  }
}
