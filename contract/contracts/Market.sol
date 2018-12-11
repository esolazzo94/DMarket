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
  address[] purchaseLUT;
  uint256 purchaseLUTLenght;
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
}

function addUserPurchase(address escrowAddress) public {
  users[msg.sender].purchaseLUT.push(escrowAddress);
  users[msg.sender].purchaseLUTLenght++;
}


function getUser(address userAddress) public view returns (string,string,string,bool,uint256,uint256) {
  return (users[userAddress].publicKey,users[userAddress].name,users[userAddress].avatar,users[userAddress].blocked,users[userAddress].productsLenght,users[userAddress].purchaseLUTLenght);
}



function getUserProduct(address userAddress, uint256 index) returns(bytes32) {
  return users[userAddress].products[index];
}

function getUserPurchase(address userAddress, uint256 index) returns(address) {
  return users[userAddress].purchaseLUT[index];
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
mapping (uint => bytes32) private productsIndex; //doSomeStuff(accountBalances[accountIndex[i]]);
uint private  productsCount;

function getProductPurchase(bytes32 product, uint256 index) returns(address) {
  return products[product].purchaseLUT[index];
}

function getProductPrice(bytes32 product) returns(uint256) {
  return products[product].price;
}

function purchase(bytes32 hashFile, address escrowAddress) {
  products[hashFile].purchase[msg.sender] = escrowAddress;
  products[hashFile].purchaseLUT.push(escrowAddress);
  products[hashFile].purchaseLUTLenght++;
}

function getEscrowAddress(bytes32 hashFile, address buyer) returns(address) {
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

function convert(string key) returns (bytes32 ret) {
    if (bytes(key).length > 32) {
      throw;
    }

    assembly {
      ret := mload(add(key, 32))
    }
  }
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
