'use strict';

const AWS = require( 'aws-sdk' );
const Multi_Data_Store = require( 'multidatastore' );
const S3_Driver = require( 'multidatastore-s3' );
const tape = require( 'tape-async' );

tape( 'S3 Driver', async t => {
    const mds = Multi_Data_Store.create();
    await mds.init( [ S3_Driver.create( {
        bucket: 'test',
        s3: {
            s3ForcePathStyle: true,
            accessKeyId: 'ACCESS_KEY_ID',
            secretAccessKey: 'SECRET_ACCESS_KEY',
            endpoint: new AWS.Endpoint( 'http://localhost:4569' ),
            sslEnabled: false
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
