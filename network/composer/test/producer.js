'use strict';

const AdminConnection = require('composer-admin').AdminConnection;
const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
const { BusinessNetworkDefinition, NetworkCardStoreManager, CertificateUtil, IdCard } = require('composer-common');

const path = require('path');

require('chai').should();

const utils = require('../src/utils.js');
const testUtils = require('../src/test-utils.js');
const constants = testUtils.constants;

describe('Producer', () => {
    let adminConnection;
    let businessNetworkConnection;
    const adminName = 'producerAdmin';
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

    describe('CreateWine()', () => {
        let events = [];

        beforeEach(async () => {
            const { grower, vineyard, producer } = await testUtils.setupParticipants(
                adminConnection,
                businessNetworkConnection
            );
            let fac = businessNetworkConnection.getBusinessNetwork().getFactory();

            // create grapes
            const grapesOwner = fac.newRelationship(
                constants.producerNamespace,
                'WineProducer',
                constants.producerName
            );
            await testUtils.addGrapes(businessNetworkConnection, grapesOwner);

            // submit tx
            businessNetworkConnection = await utils.connectParticipant(
                businessNetworkConnection,
                cardStore,
                constants.producerName
            );
            events = [];
            businessNetworkConnection.on('event', event => {
                events.push(event);
            });
            fac = businessNetworkConnection.getBusinessNetwork().getFactory();
            const createWine = fac.newTransaction(constants.baseNamespace, 'transformBatch');
            createWine.batch = fac.newRelationship(constants.growerNamespace, 'Grapes', constants.grapesName);
            await businessNetworkConnection.submitTransaction(createWine);
        });

        it('should add a bulkWine asset with the correct year', async () => {
            const bwRegistry = await businessNetworkConnection.getAssetRegistry(
                constants.producerNamespace + '.BulkWine'
            );
            const bw = await bwRegistry.getAll();
            bw.length.should.equal(1);
            bw[0].year.should.equal(new Date(Date.now()).getFullYear());
        });

        it('should consume the grapes', async () => {
            const grapesRegistry = await businessNetworkConnection.getAssetRegistry(
                constants.growerNamespace + '.Grapes'
            );
            const grapes = await grapesRegistry.get(constants.grapesName);
            grapes.quantity.should.equal(0);
        });

        it('should emit a WineCreated event', async () => {
            events.length.should.equal(1);
            const event = events[0];
            event.$type.should.equal('BatchTransformed');
            event.batchTypeCreated.should.equal('BulkWine');
        });

        it('should refer to the correct bulkWine in the event', async () => {
            const bwRegistry = await businessNetworkConnection.getAssetRegistry(
                constants.producerNamespace + '.BulkWine'
            );
            const bw = await bwRegistry.getAll();
            events[0].newBatch.$identifier.should.equal(bw[0].$identifier);
        });
    });
});
