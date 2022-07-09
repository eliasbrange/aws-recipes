import { Stack, StackProps, Fn } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as lambda from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apigwv2 from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';

export class ImportStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const tableNameFromOutput = Fn.importValue('CDKExportedTableName')
        const tableNameFromSSM = ssm.StringParameter.valueForStringParameter(this, '/cdk/tableName');

        const fn = new lambda.NodejsFunction(this, 'MyFunction', {
            entry: 'lib/app.ts',
            depsLockFilePath: 'yarn.lock',
            handler: 'lambdaHandler',
            environment: {
                TABLE_NAME_FROM_OUTPUT: tableNameFromOutput,
                TABLE_NAME_FROM_SSM: tableNameFromSSM,
            },
        });

        const param = ssm.StringParameter.fromStringParameterName(this, 'TableNameParam', '/cdk/tableName');
        param.grantRead(fn);

        const httpApi = new apigwv2.HttpApi(this, 'HttpApi');
        const integration = new HttpLambdaIntegration('Integration', fn);
        httpApi.addRoutes({
            path: '/hello',
            methods: [apigwv2.HttpMethod.GET],
            integration: integration,
        });
    }
}
