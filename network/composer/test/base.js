'use strict';

const AdminConnection = require('composer-admin').AdminConnection;
const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
const { BusinessNetworkDefinition, NetworkCardStoreManager, CertificateUtil, IdCard } = require('composer-common');

const path = require('path');

require('chai').should();

const utils = require('../src/utils.js');
const testUtils = require('../src/test-utils.js');
const constants = testUtils.constants;

describe('base', () => {
    let adminConnection;
    let businessNetworkConnection;
    const adminName = 'baseAdmin';
    const cardStore = NetworkCardStoreManager.getCardStore({
        type: 'composer-wallet-inmemory'
    });

    before(async () => {
        adminConnection = await testUtils.createAdminIdentity(cardStore, adminName);
    });

    beforeEach(async () => {
        await adminConnection.connect(adminName);
        businessNetworkConnection = await testUtils.deployNetwork(cardStore, adminConnection);
    });

    after(async () => {
        await testUtils.clearWallet(adminConnection);
        await adminConnection.disconnect();
    });

    describe('sellBatch()', () => {
        let events = [];
        beforeEach(async () => {
            const { producer, filler } = await testUtils.setupParticipants(adminConnection, businessNetworkConnection);
            let fac = businessNetworkConnection.getBusinessNetwork().getFactory();

            const owner = fac.newRelationship(constants.producerNamespace, 'WineProducer', constants.producerName);
            await testUtils.addGrapes(businessNetworkConnection, owner);
            await testUtils.addBulkWine(businessNetworkConnection, owner);

            businessNetworkConnection = await utils.connectParticipant(
                businessNetworkConnection,
                cardStore,
                constants.producerName
            );

            // record emitted events
            events = [];
            businessNetworkConnection.on('event', event => {
                events.push(event);
            });

            fac = businessNetworkConnection.getBusinessNetwork().getFactory();
            let tx = fac.newTransaction(constants.baseNamespace, 'sellBatch');
            tx.quantity = constants.bulkWineQuantity;
            tx.batch = fac.newRelationship(constants.producerNamespace, 'BulkWine', constants.bulkWineName);
            tx.buyer = fac.newRelationship(constants.fillerNamespace, 'Filler', constants.fillerName);

            await businessNetworkConnection.submitTransaction(tx);
        });

        it('should decrease the quantity of the original batch', async () => {
            const bulkwineRegistry = await businessNetworkConnection.getAssetRegistry(
                constants.producerNamespace + '.BulkWine'
            );
            const bw = await bulkwineRegistry.get(constants.bulkWineName);
            bw.quantity.should.equal(0);
        });
        it('should create a new batch for the new owner with the correct quantity', async () => {
            const bwRegistry = await businessNetworkConnection.getAssetRegistry(
                constants.producerNamespace + '.BulkWine'
            );
            const bw = await bwRegistry.getAll();
            const fillerOwnedWine = bw.filter(w => w.owner.$identifier === constants.fillerName);
            fillerOwnedWine.length.should.equal(1);
            fillerOwnedWine[0].quantity.should.equal(constants.bulkWineQuantity);
        });
    });

    describe('transformBatch()', () => {
        let events = [];

        beforeEach(async () => {
            const { filler } = await testUtils.setupParticipants(adminConnection, businessNetworkConnection);
            let fac = businessNetworkConnection.getBusinessNetwork().getFactory();

            const owner = fac.newRelationship(constants.fillerNamespace, 'Filler', constants.fillerName);
            await testUtils.addGrapes(businessNetworkConnection, owner);
            await testUtils.addBulkWine(businessNetworkConnection, owner);

            businessNetworkConnection = await utils.connectParticipant(
                businessNetworkConnection,
                cardStore,
                constants.fillerName
            );

            // record emitted events
            events = [];
            businessNetworkConnection.on('event', event => {
                events.push(event);
            });

            fac = businessNetworkConnection.getBusinessNetwork().getFactory();
            let tx = fac.newTransaction(constants.baseNamespace, 'transformBatch');
            tx.batch = fac.newRelationship(constants.producerNamespace, 'BulkWine', constants.bulkWineName);

            await businessNetworkConnection.submitTransaction(tx);
        });

        it('should create a new batch of the correct asset and size', async () => {
            const bottleRegistry = await businessNetworkConnection.getAssetRegistry(
                constants.fillerNamespace + '.BottledWine'
            );
            const bottledWine = await bottleRegistry.getAll();
            bottledWine.length.should.equal(1);
            bottledWine[0].quantity.should.equal(
                parseInt(constants.transformations.BulkWine.scaleFactor * constants.bulkWineQuantity)
            );
        });
        it('should consume the original batch', async () => {
            const bwRegistry = await businessNetworkConnection.getAssetRegistry(
                constants.producerNamespace + '.BulkWine'
            );
            const bulkWine = await bwRegistry.get(constants.bulkWineName);
            bulkWine.quantity.should.equal(0);
        });
        it('should emit a batchCreated event', () => {
            events.length.should.equal(1);
            const event = events[0];
            event.$type.should.equal('BatchTransformed');
        });
    });
});
