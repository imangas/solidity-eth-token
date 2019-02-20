var DappToken = artifacts.require("./DappToken.sol");

contract('DappToken', function(accounts) {
    var tokenInstance;

    it('initializes contract with the correct values', () => {
        return DappToken.deployed().then( (instance) => {
            tokenInstance = instance;
            return tokenInstance.name();
        }).then((name) => {
            assert.equal(name, 'DappToken', 'has the correct name');
            return tokenInstance.symbol();
        }).then((symbol) => {
            assert.equal(symbol, 'DAPP', 'has the correct symbol');
            return tokenInstance.standard();
        }).then((standard) => {
            assert.equal(standard, 'Dapp Token v1.0', 'has the correct standard');
        })
    })

    it('allocates the initial supply ', () => {
        return DappToken.deployed().then( (instance) => {
            tokenInstance = instance;
            return tokenInstance.totalSupply();
        }).then((totalSupply) => {
            assert.equal(totalSupply.toNumber(), 1000000, 'sets the total suppl to 1M');
            return tokenInstance.balanceOf(accounts[0]);
        }).then((adminBalance) => {
            assert.equal(adminBalance.toNumber(), 1000000, 'it allocates the initial supply to the admin account')
        })
    })

    it('fails if balance is not enough', () => {
        return DappToken.deployed().then( (instance) => {
            tokenInstance = instance;
            return tokenInstance.transfer.call(accounts[1], 99999999999999999999999999999);
        }).then(assert.fail).catch((error) => {
            assert(error.message.indexOf('revert') >= 0, 'error message must contain revert');
        })
    })

    it('transfers token ownership', () => {
        return DappToken.deployed().then( (instance) => {
            tokenInstance = instance;
            return tokenInstance.transfer(accounts[1], 25000, {
                from: accounts[0]
            });
        }).then((receipt) => {
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Transfer', 'triggers one event');
            assert.equal(receipt.logs[0].args._from, accounts[0], 'triggers one event');
            assert.equal(receipt.logs[0].args._to, accounts[1], 'triggers one event');
            assert.equal(receipt.logs[0].args._value, 25000, 'triggers one event');
            return tokenInstance.balanceOf(accounts[1])
        }).then((balance) => {
            assert.equal(balance.toNumber(), 25000, 'adds the amount to the receiving account');
            return tokenInstance.balanceOf(accounts[0]);
        }).then((balance)=>{
            assert.equal(balance.toNumber(), (1000000-25000), 'deduce the amount from the sender account');
        })
    })

    it('approves tokens for deletaged transfer', ()=> {
        return DappToken.deployed().then( (instance) => {
            tokenInstance = instance;
            return tokenInstance.approve.call(accounts[1], 100);
        }).then((success) => {
            assert.equal(success, true, 'it returns true');
            return tokenInstance.approve(accounts[1], 100);
        }).then((receipt) => {
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Approval', 'should be the "Approval" event');
            assert.equal(receipt.logs[0].args._owner, accounts[0], 'logs the account the tokens are authorized by');
            assert.equal(receipt.logs[0].args._spender, accounts[1], 'logs the account the tokens are authorized to');
            assert.equal(receipt.logs[0].args._value, 100, 'logs the transfer amount');
            return tokenInstance.allowance(accounts[0], accounts[1] );
        }).then((allowance) => {
            assert.equal(allowance.toNumber(), 100, 'stores the allowance for delegate transfer');
        })
    })

    it('handles delegated token transfers ', () => {
        return DappToken.deployed().then( (instance) => {
            tokenInstance = instance;
            fromAccount = accounts[2];
            toAccount = accounts[3];
            spendingAccount = accounts[4];
            return tokenInstance.transfer(fromAccount, 100, {from: accounts[0]});
        }).then((receipt) => {
            return tokenInstance.approve(spendingAccount, 10, { from: fromAccount});
        }).then((receipt) => {
            // try to buy amount greater than the current balance
            return tokenInstance.transferFrom(fromAccount, toAccount, 99999, {from: spendingAccount});
        }).then(assert.fail).catch((error) => {
            // try to buy amount lesser than the current balance and greater than the approved (10)
            assert(error.message.indexOf('revert') >= 0, 'cannot transfer value larger than balance');
            return tokenInstance.transferFrom(fromAccount, toAccount, 20, {from: spendingAccount});
        }).then(assert.fail).catch((error) => {
            assert(error.message.indexOf('revert') >= 0, 'cannot transfer value larger than approved amount');
            return tokenInstance.transferFrom.call(fromAccount, toAccount, 10, {from: spendingAccount});
        }).then((success) => {
            assert.equal(success, true);
            return tokenInstance.transferFrom(fromAccount, toAccount, 10, {from: spendingAccount});
        }).then((receipt) => {
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Transfer', 'triggers one event');
            assert.equal(receipt.logs[0].args._from, accounts[0], 'triggers one event');
            assert.equal(receipt.logs[0].args._to, accounts[1], 'triggers one event');
            assert.equal(receipt.logs[0].args._value, 10, 'triggers one event');
            return tokenInstance.balanceOf(fromAccount);
        }).then((balance) => {
            assert.equal(balance.toNumber(), 90, 'deducts the amount from the sending account');
            return tokenInstance.balanceOf(toAccount);
        }).then((balance) => {
            assert.equal(balance.toNumber(), 10, 'adds the amount to the receiving account');
            return tokenInstance.allowance(fromAccount, spendingAccount);
        }).then((allowance) => {
            assert.equal(allowance.toNumber(), 0, 'deducts the amount from the allowance');
        })
    })
})