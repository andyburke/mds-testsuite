'use strict';

const Multi_Data_Store = require( 'multidatastore' );
const Postgres_Driver = require( 'multidatastore-postgres' );
const tape = require( 'tape-async' );

tape ( 'postgres: waiting for db to be ready', async t => {
    await new Promise( resolve => setTimeout( () => resolve(), 10000 ) );
    t.pass( 'waited for db to ready' );
    t.end();
} );

tape( 'postgres: put', async t => {
    const mds = await Multi_Data_Store.create();

    try {
        await mds.init( [ Postgres_Driver.create( {
            db: {
                user: 'postgres',
                database: 'postgres'
            },
            table: 'test',
            table_create_sql: 'CREATE TABLE IF NOT EXISTS test (id text, data text)',
            mapper: object => {
                return {
                    id: object.id,
                    data: object.test
                };
            },
            unmapper: result => {
                return {
                    id: result.id,
                    test: result.data
                };
            }
        } ) ] );

        await mds.put( {
            id: 'put',
            test: 'one'
        } );
        t.pass( 'put an object' );

        await mds.stop();

        t.end();
    }
    catch( ex ) {
        t.fail( ex );

        mds && await mds.stop();

        t.end();
    }
} );

tape( 'postgres: put (update)', async t => {
    const mds = await Multi_Data_Store.create();

    try {
        await mds.init( [ Postgres_Driver.create( {
            db: {
                user: 'postgres',
                database: 'postgres'
            },
            table: 'test',
            table_create_sql: 'CREATE TABLE IF NOT EXISTS test (id text, data text)',
            mapper: object => {
                return {
                    id: object.id,
                    data: object.test
                };
            },
            unmapper: result => {
                return {
                    id: result.id,
                    test: result.data
                };
            }
        } ) ] );

        await mds.put( {
            id: 'put (update)',
            test: 'one'
        } );
        t.pass( 'put the object (insert)' );

        await mds.put( {
            id: 'put (update)',
            test: 'bar'
        } );
        t.pass( 'put the object (update)' );

        const result = await mds.get( 'put (update)' );
        t.ok( result, 'got result from store' );
        t.equal( result && result.id, 'put (update)', 'id is correct' );
        t.equal( result && result.test, 'bar', 'content is correct' );

        await mds.stop();

        t.end();
    }
    catch( ex ) {
        t.fail( ex );

        mds && await mds.stop();

        t.end();
    }
} );

tape( 'postgres: get (readable)', async t => {
    const mds = await Multi_Data_Store.create();

    try {
        await mds.init( [ Postgres_Driver.create( {
            db: {
                user: 'postgres',
                database: 'postgres'
            },
            table: 'test',
            table_create_sql: 'CREATE TABLE IF NOT EXISTS test (id text, data text)',
            mapper: object => {
                return {
                    id: object.id,
                    data: object.test
                };
            },
            unmapper: result => {
                return {
                    id: result.id,
                    test: result.data
                };
            }
        } ) ] );

        await mds.put( {
            id: 'get (readable)',
            test: 'foo'
        } );
        t.pass( 'put the object (insert)' );

        const result = await mds.get( 'get (readable)' );
        t.ok( result, 'got result from store' );
        t.equal( result && result.id, 'get (readable)', 'id is correct' );
        t.equal( result && result.test, 'foo', 'content is correct' );

        await mds.stop();

        t.end();
    }
    catch( ex ) {
        t.fail( ex );

        mds && await mds.stop();

        t.end();
    }
} );

tape( 'postgres: get (unreadable)', async t => {
    const mds = await Multi_Data_Store.create();

    try {
        await mds.init( [ Postgres_Driver.create( {
            db: {
                user: 'postgres',
                database: 'postgres'
            },
            readable: false,
            table: 'test',
            table_create_sql: 'CREATE TABLE IF NOT EXISTS test (id text, data text)',
            mapper: object => {
                return {
                    id: object.id,
                    data: object.test
                };
            },
            unmapper: result => {
                return {
                    id: result.id,
                    test: result.data
                };
            }
        } ) ] );

        await mds.put( {
            id: 'get (unreadable)',
            test: 'foo'
        } );
        t.pass( 'put the object (insert)' );

        try {
            await mds.get( 'get (unreadable)' );
            t.fail( 'able to read from unreadable postgres instance' );
        }
        catch( ex ) {
            t.ok( ex, 'got exception trying to read from unreadable postgres instance' );
            t.equal( ex && ex.message, 'missing readable driver', 'got: missing readable driver' );
        }

        await mds.stop();

        t.end();
    }
    catch( ex ) {
        t.fail( ex );

        mds && await mds.stop();

        t.end();
    }
} );

tape( 'postgres: delete', async t => {
    const mds = await Multi_Data_Store.create();

    try {
        await mds.init( [ Postgres_Driver.create( {
            db: {
                user: 'postgres',
                database: 'postgres'
            },
            table: 'test',
            table_create_sql: 'CREATE TABLE IF NOT EXISTS test (id text, data text)',
            mapper: object => {
                return {
                    id: object.id,
                    data: object.test
                };
            },
            unmapper: result => {
                return {
                    id: result.id,
                    test: result.data
                };
            }
        } ) ] );

        await mds.put( {
            id: 'delete',
            test: 'foo'
        } );
        t.pass( 'put the object (insert)' );

        const result = await mds.get( 'delete' );
        t.ok( result, 'got result from store' );
        t.equal( result && result.id, 'delete', 'id is correct' );
        t.equal( result && result.test, 'foo', 'content is correct' );

        await mds.del( 'delete' );
        t.pass( 'deleted object' );

        try {
            const after_delete_result = await mds.get( 'delete' );
            t.notOk( after_delete_result, 'got non-existent result' );
        }
        catch( ex ) {
            t.fail( ex );
        }

        await mds.stop();

        t.end();
    }
    catch( ex ) {
        t.fail( ex );

        mds && await mds.stop();

        t.end();
    }
} );

tape( 'postgres: delete (ignore_delete)', async t => {
    const mds = await Multi_Data_Store.create();

    try {
        await mds.init( [ Postgres_Driver.create( {
            db: {
                user: 'postgres',
                database: 'postgres'
            },
            ignore_delete: true,
            table: 'test',
            table_create_sql: 'CREATE TABLE IF NOT EXISTS test (id text, data text)',
            mapper: object => {
                return {
                    id: object.id,
                    data: object.test
                };
            },
            unmapper: result => {
                return {
                    id: result.id,
                    test: result.data
                };
            }
        } ) ] );

        await mds.put( {
            id: 'delete (ignore_delete)',
            test: 'foo'
        } );
        t.pass( 'put the object (insert)' );

        const result = await mds.get( 'delete (ignore_delete)' );
        t.ok( result, 'got result from store' );
        t.equal( result && result.id, 'delete (ignore_delete)', 'id is correct' );
        t.equal( result && result.test, 'foo', 'content is correct' );

        await mds.del( 'delete (ignore_delete)' );
        t.pass( 'deleted object' );

        try {
            const after_delete_result = await mds.get( 'delete (ignore_delete)' );
            t.ok( after_delete_result, 'got result from store, even after delete' );
            t.equal( after_delete_result && after_delete_result.id, 'delete (ignore_delete)', 'id is correct' );
            t.equal( after_delete_result && after_delete_result.test, 'foo', 'content is correct' );
        }
        catch( ex ) {
            t.fail( ex );
        }

        await mds.stop();

        t.end();
    }
    catch( ex ) {
        t.fail( ex );

        mds && await mds.stop();

        t.end();
    }
} );

///////////////////////////////////
// different id field

tape( 'postgres: put (non-standard id_field)', async t => {
    const mds = await Multi_Data_Store.create();

    try {
        await mds.init( [ Postgres_Driver.create( {
            db: {
                user: 'postgres',
                database: 'postgres'
            },
            id_field: '_id',
            table: 'test_alternate_id',
            table_create_sql: 'CREATE TABLE IF NOT EXISTS test_alternate_id (_id text, data text)',
            mapper: object => {
                return {
                    _id: object.id,
                    data: object.test
                };
            },
            unmapper: result => {
                return {
                    id: result._id,
                    test: result.data
                };
            }
        } ) ] );

        await mds.put( {
            id: 'put (non-standard id_field)',
            test: 'foo'
        } );
        t.pass( 'put the object (insert)' );

        await mds.stop();

        t.end();
    }
    catch( ex ) {
        t.fail( ex );

        mds && await mds.stop();

        t.end();
    }
} );

tape( 'postgres: put (update) (non-standard id_field)', async t => {
    const mds = await Multi_Data_Store.create();

    try {
        await mds.init( [ Postgres_Driver.create( {
            db: {
                user: 'postgres',
                database: 'postgres'
            },
            id_field: '_id',
            table: 'test_alternate_id',
            table_create_sql: 'CREATE TABLE IF NOT EXISTS test_alternate_id (_id text, data text)',
            mapper: object => {
                return {
                    _id: object.id,
                    data: object.test
                };
            },
            unmapper: result => {
                return {
                    id: result._id,
                    test: result.data
                };
            }
        } ) ] );

        await mds.put( {
            id: 'put (update) (non-standard id_field)',
            test: 'foo'
        } );
        t.pass( 'put the object (insert)' );

        await mds.put( {
            id: 'put (update) (non-standard id_field)',
            test: 'bar'
        } );
        t.pass( 'put the object (update)' );

        const result = await mds.get( 'put (update) (non-standard id_field)' );
        t.ok( result, 'got result from store' );
        t.equal( result && result.id, 'put (update) (non-standard id_field)', 'id is correct' );
        t.equal( result && result.test, 'bar', 'content is correct' );

        await mds.stop();

        t.end();
    }
    catch( ex ) {
        t.fail( ex );

        mds && await mds.stop();

        t.end();
    }
} );

tape( 'postgres: get (readable) (non-standard id_field)', async t => {
    const mds = await Multi_Data_Store.create();

    try {
        await mds.init( [ Postgres_Driver.create( {
            db: {
                user: 'postgres',
                database: 'postgres'
            },
            id_field: '_id',
            table: 'test_alternate_id',
            table_create_sql: 'CREATE TABLE IF NOT EXISTS test_alternate_id (_id text, data text)',
            mapper: object => {
                return {
                    _id: object.id,
                    data: object.test
                };
            },
            unmapper: result => {
                return {
                    id: result._id,
                    test: result.data
                };
            }
        } ) ] );

        await mds.put( {
            id: 'get (readable) (non-standard id_field)',
            test: 'foo'
        } );
        t.pass( 'put the object (insert)' );

        const result = await mds.get( 'get (readable) (non-standard id_field)' );
        t.ok( result, 'got result from store' );
        t.equal( result && result.id, 'get (readable) (non-standard id_field)', 'id is correct' );
        t.equal( result && result.test, 'foo', 'content is correct' );

        await mds.stop();

        t.end();
    }
    catch( ex ) {
        t.fail( ex );

        mds && await mds.stop();

        t.end();
    }
} );

tape( 'postgres: get (unreadable) (non-standard id_field)', async t => {
    const mds = await Multi_Data_Store.create();

    try {
        await mds.init( [ Postgres_Driver.create( {
            db: {
                user: 'postgres',
                database: 'postgres'
            },
            readable: false,
            id_field: '_id',
            table: 'test_alternate_id',
            table_create_sql: 'CREATE TABLE IF NOT EXISTS test_alternate_id (_id text, data text)',
            mapper: object => {
                return {
                    _id: object.id,
                    data: object.test
                };
            },
            unmapper: result => {
                return {
                    id: result._id,
                    test: result.data
                };
            }
        } ) ] );

        await mds.put( {
            id: 'get (unreadable) (non-standard id_field)',
            test: 'foo'
        } );
        t.pass( 'put the object (insert)' );

        try {
            await mds.get( 'get (unreadable) (non-standard id_field)' );
            t.fail( 'able to read from unreadable postgres instance' );
        }
        catch( ex ) {
            t.ok( ex, 'got exception trying to read from unreadable postgres instance' );
            t.equal( ex && ex.message, 'missing readable driver', 'got: missing readable driver' );
        }

        await mds.stop();

        t.end();
    }
    catch( ex ) {
        t.fail( ex );

        mds && await mds.stop();

        t.end();
    }
} );

tape( 'postgres: delete (non-standard id_field)', async t => {
    const mds = await Multi_Data_Store.create();

    try {
        await mds.init( [ Postgres_Driver.create( {
            db: {
                user: 'postgres',
                database: 'postgres'
            },
            id_field: '_id',
            table: 'test_alternate_id',
            table_create_sql: 'CREATE TABLE IF NOT EXISTS test_alternate_id (_id text, data text)',
            mapper: object => {
                return {
                    _id: object.id,
                    data: object.test
                };
            },
            unmapper: result => {
                return {
                    id: result._id,
                    test: result.data
                };
            }
        } ) ] );

        await mds.put( {
            id: 'delete (non-standard id_field)',
            test: 'foo'
        } );
        t.pass( 'put the object (insert)' );

        const result = await mds.get( 'delete (non-standard id_field)' );
        t.ok( result, 'got result from store' );
        t.equal( result && result.id, 'delete (non-standard id_field)', 'id is correct' );
        t.equal( result && result.test, 'foo', 'content is correct' );

        await mds.del( 'delete (non-standard id_field)' );
        t.pass( 'deleted object' );

        try {
            const after_delete_result = await mds.get( 'delete (non-standard id_field)' );
            t.notOk( after_delete_result, 'got non-existent result' );
        }
        catch( ex ) {
            t.fail( ex );
        }

        await mds.stop();

        t.end();
    }
    catch( ex ) {
        t.fail( ex );

        mds && await mds.stop();

        t.end();
    }
} );

tape( 'postgres: delete (ignore_delete) (non-standard id_field)', async t => {
    const mds = await Multi_Data_Store.create();

    try {
        await mds.init( [ Postgres_Driver.create( {
            db: {
                user: 'postgres',
                database: 'postgres'
            },
            ignore_delete: true,
            id_field: '_id',
            table: 'test_alternate_id',
            table_create_sql: 'CREATE TABLE IF NOT EXISTS test_alternate_id (_id text, data text)',
            mapper: object => {
                return {
                    _id: object.id,
                    data: object.test
                };
            },
            unmapper: result => {
                return {
                    id: result._id,
                    test: result.data
                };
            }
        } ) ] );

        await mds.put( {
            id: 'delete (ignore_delete) (non-standard id_field)',
            test: 'foo'
        } );
        t.pass( 'put the object (insert)' );

        const result = await mds.get( 'delete (ignore_delete) (non-standard id_field)' );
        t.ok( result, 'got result from store' );
        t.equal( result && result.id, 'delete (ignore_delete) (non-standard id_field)', 'id is correct' );
        t.equal( result && result.test, 'foo', 'content is correct' );

        await mds.del( 'delete (ignore_delete) (non-standard id_field)' );
        t.pass( 'deleted object' );

        try {
            const after_delete_result = await mds.get( 'delete (ignore_delete) (non-standard id_field)' );
            t.ok( after_delete_result, 'got result from store, even after delete' );
            t.equal( after_delete_result && after_delete_result.id, 'delete (ignore_delete) (non-standard id_field)', 'id is correct' );
            t.equal( after_delete_result && after_delete_result.test, 'foo', 'content is correct' );
        }
        catch( ex ) {
            t.fail( ex );
        }

        await mds.stop();

        t.end();
    }
    catch( ex ) {
        t.fail( ex );

        mds && await mds.stop();

        t.end();
    }
} );