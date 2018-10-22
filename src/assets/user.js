var globalweb3;

var publicKey;

var marketContractAddress = '0x115ff25b669825bb8209ff9dcd5863d96ffc8c79';
var defaultAddress = '0x273231D0669268e0D7Fce9C80b302b1F007224B0' ;
var buyerAddress = "0x1765960eEC68672800cefAa13A887438F37c523A";

/*function getABI(){
    var request = new XMLHttpRequest();
    request.open('GET', "./contract/build/contracts/Users.json", true);

    request.onload = function() {
    if (request.status >= 200 && request.status < 400) {
    // Success!
    var data = JSON.parse(request.responseText);
    } else {
    // We reached our target server, but it returned an error

  }
};

request.onerror = function() {
  // There was a connection error of some sort
};

request.send();
}*/

var abiMarket = [
  {
    "constant": true,
    "inputs": [],
    "name": "children",
    "outputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "userAddress",
        "type": "address"
      },
      {
        "name": "key",
        "type": "string"
      }
    ],
    "name": "addUser",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "userAddress",
        "type": "address"
      }
    ],
    "name": "getUserPublicKey",
    "outputs": [
      {
        "name": "",
        "type": "string"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "getOwner",
    "outputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "hashFile",
        "type": "string"
      },
      {
        "name": "escrowAddress",
        "type": "address"
      }
    ],
    "name": "purchase",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "hashFile",
        "type": "string"
      },
      {
        "name": "buyer",
        "type": "address"
      }
    ],
    "name": "getEscrowAddress",
    "outputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "description",
        "type": "string"
      },
      {
        "name": "hashProduct",
        "type": "string"
      },
      {
        "name": "price",
        "type": "uint256"
      }
    ],
    "name": "addProduct",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "hashProduct",
        "type": "string"
      }
    ],
    "name": "getProduct",
    "outputs": [
      {
        "name": "",
        "type": "string"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [],
    "name": "kill",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }
];


var abiEscrow = [
  {
    "constant": false,
    "inputs": [
      {
        "name": "recipient",
        "type": "address"
      }
    ],
    "name": "transferPrimary",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "primary",
    "outputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "payee",
        "type": "address"
      }
    ],
    "name": "depositsOf",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "payee",
        "type": "address"
      }
    ],
    "name": "deposit",
    "outputs": [],
    "payable": true,
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "name": "addr",
        "type": "address"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "payee",
        "type": "address"
      },
      {
        "indexed": false,
        "name": "weiAmount",
        "type": "uint256"
      }
    ],
    "name": "Deposited",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "payee",
        "type": "address"
      },
      {
        "indexed": false,
        "name": "weiAmount",
        "type": "uint256"
      }
    ],
    "name": "Withdrawn",
    "type": "event"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "p",
        "type": "address"
      }
    ],
    "name": "setPayee",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "hFile",
        "type": "string"
      },
      {
        "name": "hEncryptedFile",
        "type": "string"
      }
    ],
    "name": "setFile",
    "outputs": [],
    "payable": true,
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [],
    "name": "getHashAddress",
    "outputs": [
      {
        "name": "",
        "type": "string"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [],
    "name": "depositFromBuyer",
    "outputs": [],
    "payable": true,
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "payee",
        "type": "address"
      }
    ],
    "name": "withdrawalAllowed",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "payee",
        "type": "address"
      }
    ],
    "name": "withdraw",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "payee",
        "type": "address"
      }
    ],
    "name": "refundBuyer",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }
];


async function registerUser() {/*
    connect.requestCredentials({
        requested: ['name'],
        notifications: true 
      })
      .then((credentials) => {*/

        
        if (typeof window.web3 !== 'undefined') {
            this.web3Provider = window.web3.currentProvider;
          } else {
            this.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
          }
      
        globalweb3 = new Web3(this.web3Provider);

        /*fetch('contract/build/contracts/Market.json')
            .then(function(response) {
                console.log(response)
          });*/

        const marketContract = globalweb3.eth.contract(abiMarket);
	      marketInstance = marketContract.at(marketContractAddress);

        globalweb3.defaultAccount = defaultAddress;


        var publicKey = await createKeyPair();
                marketInstance.addUser.sendTransaction(defaultAddress,publicKey,{ from: defaultAddress},function(error,result){
                console.log(error,"Transaction "+result);
            });
        
            /*marketInstance.getPublicKey.call(defaultAddress,function(error,result){
                console.log(error,result);
            }); */       
/*
        statusInstance.getOwner.call(function(error,result){
            console.log(error,result);
        });*/
      //})   
}

var marketInstance;

function connectUser(){

  /*const StatusContract = globalweb3.eth.contract(abiU);
	const statusInstance = StatusContract.at(userContractAddress);*/

	const marketContract = globalweb3.eth.contract(abiMarket);
	marketInstance = marketContract.at(marketContractAddress);
	

  marketInstance.getUserPublicKey.call(defaultAddress,function(error,result){
        if (result!=="") {
            console.log(error,"Connesso con "+result);
            var div = document.getElementById("logged");
			div.style.visibility = "visible";

			/*marketInstance.depositBuyer.call("a",{from:defaultAddress,gas : 2200000,value: 1000000000000000000},function(error,result){
        console.log(error,"Escrow "+result);

        marketInstance.check.call({from:defaultAddress,gas : 2200000},function(error,result){
          console.log(error,"Deposito Utente "+result);
        });

      });*/      
            
        }
        else console.log("Non sei registrato");
    });

  }

  
  function registraProdotto(){

    //globalweb3.eth.abi.encodeFunctionCall({name: 'addProduct', type: 'function',inputs: [{type: 'string', name: 'description'},{type: 'string', name: 'hashProduct'},{type: 'uint256', name: 'price'}]},['a','QmfLe5wSF79ohubE9SAumR6cY8sdH11AMfjVrgxAXJxUu8','1500000000000000']);
    marketInstance.addProduct.sendTransaction("a","QmfLe5wSF79ohubE9SAumR6cY8sdH11AMfjVrgxAXJxUu8",'1500000000000000',{ from: defaultAddress, gas:3000000 },function(error,result){
        if(!error) {
          marketInstance.getProduct.call("QmfLe5wSF79ohubE9SAumR6cY8sdH11AMfjVrgxAXJxUu8", function(error,result){
            console.log("Descrizione prodotto "+result);
          });

        }

        else console.log("Errore Registrazione");
         
      });
  }

  function acquistaProdotto(){

    
    var escrowContract = globalweb3.eth.contract(abiEscrow);
    var contractAddress;

    var escrowIstance = escrowContract.new(marketContractAddress,
      {
          from: buyerAddress,
          gas: 4712388,
          gasPrice: 9000000000,
          data:"0x60806040523480156200001157600080fd5b506040516020806200132783398101806040528101908080519060200190929190505050336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506040805190810160405280600481526020017f6e756c6c0000000000000000000000000000000000000000000000000000000081525060029080519060200190620000c292919062000127565b5062015180420160058190555080600460006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506000600781905550600060088190555050620001d6565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f106200016a57805160ff19168380011785556200019b565b828001600101855582156200019b579182015b828111156200019a5782518255916020019190600101906200017d565b5b509050620001aa9190620001ae565b5090565b620001d391905b80821115620001cf576000816000905550600101620001b5565b5090565b90565b61114180620001e66000396000f3006080604052600436106100af576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680632348238c146100b4578063410459ad146100f757806351cff8d91461013a5780635db53f8b1461017d5780635f71f31714610187578063685ca194146101ca578063a1478ed014610225578063c6dbdf61146102c7578063e3a9db1a1461031e578063f340fa0114610375578063fa285e4c146103ab575b600080fd5b3480156100c057600080fd5b506100f5600480360381019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919050505061043b565b005b34801561010357600080fd5b50610138600480360381019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050610515565b005b34801561014657600080fd5b5061017b600480360381019080803573ffffffffffffffffffffffffffffffffffffffff1690602001909291905050506105b4565b005b6101856106c9565b005b34801561019357600080fd5b506101c8600480360381019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919050505061073e565b005b3480156101d657600080fd5b5061020b600480360381019080803573ffffffffffffffffffffffffffffffffffffffff1690602001909291905050506108ad565b604051808215151515815260200191505060405180910390f35b6102c5600480360381019080803590602001908201803590602001908080601f0160208091040260200160405190810160405280939291908181526020018383808284378201915050505050509192919290803590602001908201803590602001908080601f0160208091040260200160405190810160405280939291908181526020018383808284378201915050505050509192919290505050610b21565b005b3480156102d357600080fd5b506102dc610bc7565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b34801561032a57600080fd5b5061035f600480360381019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050610bf0565b6040518082815260200191505060405180910390f35b6103a9600480360381019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050610c39565b005b3480156103b757600080fd5b506103c0610d80565b6040518080602001828103825283818151815260200191508051906020019080838360005b838110156104005780820151818401526020810190506103e5565b50505050905090810190601f16801561042d5780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614151561049657600080fd5b600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff16141515156104d257600080fd5b806000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050565b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614151561057057600080fd5b80600660006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050565b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614151561060f57600080fd5b610618816108ad565b151561062357600080fd5b8073ffffffffffffffffffffffffffffffffffffffff166108fc6007549081150290604051600060405180830381858888f1935050505015801561066b573d6000803e3d6000fd5b503373ffffffffffffffffffffffffffffffffffffffff166108fc6008549081150290604051600060405180830381858888f193505050501580156106b4573d6000803e3d6000fd5b506106bd610e7d565b6106c681610e8f565b50565b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614151561072457600080fd5b600060085414151561073557600080fd5b34600881905550565b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614151561079957600080fd5b6107a2816108ad565b15156108aa573373ffffffffffffffffffffffffffffffffffffffff166108fc6007549081150290604051600060405180830381858888f193505050501580156107f0573d6000803e3d6000fd5b503373ffffffffffffffffffffffffffffffffffffffff166108fc6008549081150290604051600060405180830381858888f19350505050158015610839573d6000803e3d6000fd5b50610842610e7d565b3373ffffffffffffffffffffffffffffffffffffffff166108fc61086583610bf0565b9081150290604051600060405180830381858888f19350505050158015610890573d6000803e3d6000fd5b503373ffffffffffffffffffffffffffffffffffffffff16ff5b50565b6000806000600460009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1691508173ffffffffffffffffffffffffffffffffffffffff16630bf4472760023073ffffffffffffffffffffffffffffffffffffffff1663c6dbdf616040518163ffffffff167c0100000000000000000000000000000000000000000000000000000000028152600401602060405180830381600087803b15801561095957600080fd5b505af115801561096d573d6000803e3d6000fd5b505050506040513d602081101561098357600080fd5b81019080805190602001909291905050506040518363ffffffff167c010000000000000000000000000000000000000000000000000000000002815260040180806020018373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001828103825284818154600181600116156101000203166002900481526020019150805460018160011615610100020316600290048015610a7a5780601f10610a4f57610100808354040283529160200191610a7a565b820191906000526020600020905b815481529060010190602001808311610a5d57829003601f168201915b50509350505050602060405180830381600087803b158015610a9b57600080fd5b505af1158015610aaf573d6000803e3d6000fd5b505050506040513d6020811015610ac557600080fd5b810190808051906020019092919050505090503073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff161415610b155760019250610b1a565b600092505b5050919050565b600660009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16141515610b7d57600080fd5b6000600754141515610b8e57600080fd5b8160029080519060200190610ba4929190611070565b508060039080519060200190610bbb929190611070565b50346007819055505050565b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b6000600160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050919050565b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16141515610c9657600080fd5b349050610ceb81600160008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054610eaf90919063ffffffff16565b600160008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508173ffffffffffffffffffffffffffffffffffffffff167f2da466a7b24304f47e87fa2e1e5a81b9831ce54fec19055ce277ca2f39ba42c4826040518082815260200191505060405180910390a25050565b60606000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16141515610ddd57600080fd5b60038054600181600116156101000203166002900480601f016020809104026020016040519081016040528092919081815260200182805460018160011615610100020316600290048015610e735780601f10610e4857610100808354040283529160200191610e73565b820191906000526020600020905b815481529060010190602001808311610e5657829003601f168201915b5050505050905090565b60006007819055506000600881905550565b610e98816108ad565b1515610ea357600080fd5b610eac81610ed0565b50565b6000808284019050838110151515610ec657600080fd5b8091505092915050565b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16141515610f2d57600080fd5b600160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050803073ffffffffffffffffffffffffffffffffffffffff163110151515610f9257fe5b6000600160008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508173ffffffffffffffffffffffffffffffffffffffff166108fc829081150290604051600060405180830381858888f1935050505015801561101d573d6000803e3d6000fd5b508173ffffffffffffffffffffffffffffffffffffffff167f7084f5476618d8e60b11ef0d7d3f06914655adb8793e28ff7f018d4c76d505d5826040518082815260200191505060405180910390a25050565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f106110b157805160ff19168380011785556110df565b828001600101855582156110df579182015b828111156110de5782518255916020019190600101906110c3565b5b5090506110ec91906110f0565b5090565b61111291905b8082111561110e5760008160009055506001016110f6565b5090565b905600a165627a7a7230582009f755856f606e9c25f5e6d47729abd67541c9955a71c93454ceaef1704764df0029",
      }, function (e, contract){
          if(e)
              console.log('Errore: ' + e)
          else
              console.log('Contract: ' + JSON.stringify(contract) + '\n------------------------------------------------------------------')
          if (typeof contract.address !== 'undefined') {
              console.log('Contract mined! address: ' + contract.address + '\ntransactionHash: ' + contract.transactionHash);
              contractAddress= contract.address;

              contract.setPayee.sendTransaction(defaultAddress,{from:buyerAddress,gas : 2200000 },function(error,result){
                if(error) console.log(error);
              });

              contract.deposit.sendTransaction(defaultAddress,{from:buyerAddress,gas : 2200000, value:2000000000000000000},function(error,result){
                if(!error){
                  marketInstance.purchase.sendTransaction("QmfLe5wSF79ohubE9SAumR6cY8sdH11AMfjVrgxAXJxUu8",contractAddress,{from:buyerAddress});
                  contract.depositFromBuyer.sendTransaction({from:buyerAddress,gas : 2200000, value:20000000000000000});
                }
              });
              var depositEvent = contract.Deposited();
              depositEvent.watch(function(error, result){
                if (!error)
                    {
                        console.log("Deposito avvenuto");
                    }
            });
          }
      });

  }

  function caricaProdotto(){
       var contractAddress;
      marketInstance.getEscrowAddress.call("QmfLe5wSF79ohubE9SAumR6cY8sdH11AMfjVrgxAXJxUu8","0x1765960eEC68672800cefAa13A887438F37c523A", function(error,result){
        
        const escrowContract = globalweb3.eth.contract(abiEscrow);
        var escrowInstance = escrowContract.at(result);
        
        escrowInstance.setFile.sendTransaction("QmfLe5wSF79ohubE9SAumR6cY8sdH11AMfjVrgxAXJxUu8","indirizzo",{ from: defaultAddress, gas:3000000, value:20000000000000000 }, function(error,result){
            if(error) console.log(error);

        });

    });

  }

  //Contract Balance globalweb3.fromWei(globalweb3.eth.getBalance("0x418320E83228f47D9D3b9BFBE89C5677cB63b97e").toString(),'ether')

  function completaAcquisto() {
    marketInstance.getEscrowAddress.call("QmfLe5wSF79ohubE9SAumR6cY8sdH11AMfjVrgxAXJxUu8",buyerAddress, function(error,result){
    
      const escrowContract = globalweb3.eth.contract(abiEscrow);
      var escrowInstance = escrowContract.at(result);

      escrowInstance.getHashAddress.call({ from: buyerAddress},function(error,result){

        if(result == 'indirizzo') {

          escrowInstance.withdraw.sendTransaction(defaultAddress,{ from: buyerAddress, gas:3000000 },function(error,result) {

            if (!error) console.log("Acquisto Completato");
            else {

              escrowInstance.refundBuyer.sendTransaction(defaultAddress,{ from: buyerAddress, gas:3000000 },function(error,result) {
    
                if (!error) console.log("Rimborso Completato");
                else  console.log(error);
    
            });
          } 

        });
      }
        

      });
    });

  }