import * as express from 'express';
import { SqlConfig } from './sqlConfig';
var sql = require("seriate");

const router = express.Router();

router.get('/', (req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.status(200).json({ working: true });
});

router.get('/test1/', (req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.status(200).json('test1 it is');
});

router.get('/test2/:someVar', (req: express.Request, res: express.Response, next: express.NextFunction) => {
    let someVarVal = req.params.someVar || 'MISSING';
    res.status(200).json({ someVarValue: someVarVal + '!' });
});

router.get('/testloader1/', (req: express.Request, res: express.Response, next: express.NextFunction) => {
    var queries = require( "../sql/sqlTest1" );
    res.status(200).json({file1Text: queries});
});

router.get('/sqltest1/', (req: express.Request, res: express.Response, next: express.NextFunction) => {
    setSqlConfigForServer(req)

    sql.execute( {
        query: "SELECT TOP 1 SomeColumn1 FROM dbo.SomeTable1"
    } ).then( function( results ) {
        console.log( results );
        res.status(200).json({ sqlValue: results });
    }, function( err ) {
        console.log( "Something bad happened:", err );
        res.status(500);
    } );
});

router.get('/sqltest2/:var1', (req: express.Request, res: express.Response, next: express.NextFunction) => {    
    setSqlConfigForServer(req)

    let var1Val = req.params.var1 || 'MISSING';    

    sql.execute( {
        query: "SELECT TOP 1 SomeColumn1 FROM dbo.SomeTable1 WHERE SomeColumn1 LIKE '%' + @someVal  + '%'",
        params: {
            someVal: {
                type: sql.NVARCHAR,
                val: var1Val,
            }
        }
    } ).then( function( results ) {
        console.log(results);
        res.status(200).json({ sqlValue: results });
    }, function( err ) {
        console.log( "Something bad happened:", err );
        res.status(500);
    } );
});

router.get('/sqlTest3/:var1', (req: express.Request, res: express.Response, next: express.NextFunction) => {
    let var1Val = req.params.var1 || 'MISSING';
    if (!var1Val || var1Val === 'MISSING' ) {
        res.status(400).json("missing required param var1Val");
        return
    }

    setSqlConfigForServer(req)

    let sqlTest1Sql = require( "../sql/sqlTest1" );

    console.log(sqlTest1Sql)

    sql.execute( {
        query: sqlTest1Sql,
        params: {
            var1: {
                type: sql.NVARCHAR,
                val: var1Val,
            }
        }
    } ).then( function( results ) {
        console.log('result:', results );
        res.status(200).json(results);
    }, function( err ) {
        console.log( "Something bad happened:", err );
        res.status(500);
    } );
});

router.post('/sqlTest4/:var1', (req: express.Request, res: express.Response, next: express.NextFunction) => {
    setSqlConfigForServer(req);

    let queryStringVar2Val = req.query.qsvar2;
    if (!queryStringVar2Val) {
        res.status(400).json('missing required parameter qsvar2');
        return
    }

    doSqlStuff(queryStringVar2Val, res);
});

var doSqlStuff = (queryStringVar2Val: string, res: express.Response) => {
    sql.execute(
        getFirstSqlCallRequestObject(queryStringVar2Val)
    ).then((firstSqlCallResponse) => {
        if (!firstSqlCallResponse || firstSqlCallResponse.length < 1 || !firstSqlCallResponse[0].SomeProperty) {
            res.status(500).json('bad!');
        }

        doSecondSqlCall(firstSqlCallResponse[0], res)
    }
    ,(err) => {
        console.log( "Something bad happened:", err );
        res.status(500);
    });
}

var getFirstSqlCallRequestObject = (queryStringVar2Val: string) => {
    let sqlTest1Sql = require( "../sql/sqlTest1" );
    return {
        query: sqlTest1Sql,
        params: {
            var1: {
                type: sql.NVARCHAR,
                val: queryStringVar2Val,
            }
        }
    }
}

var doSecondSqlCall = (firstSqlCallResponse: any, res: express.Response) => {
    sql.execute(
        getSecondSqlCallRequestObject(firstSqlCallResponse)
    ).then(( results ) => {
        console.log('takeCompanyDbSnapshot result: ', results);
        res.status(200).json(results);
    }, ( err ) => {
        console.log( "Something bad happened:", err );
        res.status(500);
    } );
}

var getSecondSqlCallRequestObject = (firstSqlCallResponse: any) => { 
    let sqlTest1Sql = require( "../sql/sqlTest1" );
    return {
        query: sqlTest1Sql,
        params: {
            var1: {
                type: sql.NVARCHAR,
                val: firstSqlCallResponse.var1Val,
            },
            someOtherVar2: {
                type: sql.NVARCHAR,
                val: firstSqlCallResponse.var2Val,
            }
        }
    }
}

var setSqlConfigForServer = (req: express.Request) => {
    let sqlConfig : SqlConfig = req.app.get('sqlConfig');
    sql.setDefaultConfig(sqlConfig);
}

export = router;