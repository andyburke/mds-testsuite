'use strict';

const Multi_Data_Store = require( 'multidatastore' );
const B2_Driver = require( 'multidatastore-b2' );
const tape = require( 'tape-async' );

tape( 'B2 Driver', async t => {

    const account_id = process.env.B2_ACCOUNT_ID;
    const application_key = process.env.B2_APPLICATION_KEY;

    if ( !account_id || !application_key ) {
        t.skip( 'skipping test, missing account id/application key' );
        t.end();
        return;
    }

    const mds = Multi_Data_Store.create();
    await mds.init( [ B2_Driver.create( {
        bucket: 'test-mds',
        b2: {
            accountId: account_id,
            applicationKey: application_key
        }
    } ) ] );

    const test_object = {
        id: 'foo',
        value: 'bar'
    };

    await mds.put( test_object );
    t.pass( 'put test object' );

    const returned_object = await mds.get( 'foo' );

    t.deepEqual( returned_object, test_object, 'got back appropriate object' );

    await mds.del( 'foo' );
    t.pass( 'deleted test object' );

    const deleted_object = await mds.get( 'foo' );

    t.notOk( deleted_object, 'once deleted, cannot get object from store' );

    t.end();
} );
