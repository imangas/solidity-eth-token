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
})