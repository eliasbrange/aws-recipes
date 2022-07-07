import { Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as ssm from 'aws-cdk-lib/aws-ssm';

export class ExportStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const table = new dynamodb.Table(this, 'Table', {
            partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
            billingMode: dynamodb.BillingMode.PROVISIONED,
        });

        new ssm.StringParameter(this, 'SSMParam', {
            parameterName: '/cdk/tableName',
            type: ssm.ParameterType.STRING,
            stringValue: table.tableName,
        });

        new CfnOutput(this, 'TableNameOutput', { value: table.tableName, exportName: 'CDKExportedTableName' });
    }
}
