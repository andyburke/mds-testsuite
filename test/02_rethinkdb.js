'use strict';

const Multi_Data_Store = require( 'multidatastore' );
const Rethink_Driver = require( 'multidatastore-rethinkdb' );
const tape = require( 'tape-async' );

tape( 'Rethink Driver', async t => {
    const mds = await Multi_Data_Store.create();
    await mds.init( [ Rethink_Driver.create( {
        database: 'test',
        table: 'test'
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

    mds.stop();

    t.end();
} );
