import { createObjectCsvWriter as createCsvWriter } from 'csv-writer';
import { CloudWatchLogsClient, DescribeLogGroupsCommand, LogGroup } from '@aws-sdk/client-cloudwatch-logs';
import { IExecutableTaskConfig } from '../../config/config';
import { log } from 'console';
import { ExecutableScript } from '../../models/abstract_script';

export class RetrieveLogGroups extends ExecutableScript {
    constructor(executable_config: IExecutableTaskConfig) {
        super(executable_config);
    }

    async execute(): Promise<any> {
        const results: any[] = [];

        // Get the aws sso credentials and region
        const cloudwatchLogsClient = new CloudWatchLogsClient({
            credentials: {
                accessKeyId: this.executable_config.roleCredentials.roleCredentials?.accessKeyId!,
                secretAccessKey: this.executable_config.roleCredentials.roleCredentials?.secretAccessKey!,
                sessionToken: this.executable_config.roleCredentials.roleCredentials?.sessionToken,
                accountId: this.executable_config.account,
            },
            region: this.executable_config.region,
        });

        // Utilze nextToken to paginate and get an array of all logGroups
        try {
            let nextToken: string | undefined;
            do {
                const command = new DescribeLogGroupsCommand({
                    nextToken,
                });
                const response = await cloudwatchLogsClient.send(command);
                const logGroups: LogGroup[] = response.logGroups || [];

                logGroups.forEach((logGroup) => {
                    results.push({
                        accountName: this.executable_config.accountName,
                        accountId: this.executable_config.account,
                        region: this.executable_config.region,
                        logGroupArn: logGroup.arn,
                        logGroupName: logGroup.logGroupName,
                        creationTime: logGroup.creationTime ? new Date(logGroup.creationTime).toISOString() : null,
                        retentionInDays: logGroup.retentionInDays || 'Never Expire',
                        storedBytes: logGroup.storedBytes || 0,
                    });
                });

                nextToken = response.nextToken;
            } while (nextToken);
        } catch (error) {
            log(`Error retrieving log groups for region ${this.executable_config.region}: ${error}`);
        }

        // Write results to CSV
        const csvWriter = createCsvWriter({
            path: `csv_output/cw_log_groups_${new Date().getMonth()}-${new Date().getDate()}.csv`,
            append: true,
            alwaysQuote: true,
            header: [
                { id: 'accountName', title: 'AccountName' },
                { id: 'accountId', title: 'AccountId' },
                { id: 'region', title: 'Region' },
                { id: 'logGroupName', title: 'logGroupName' },
                { id: 'logGroupArn', title: 'logGroupArn' },
                { id: 'creationTime', title: 'Creation Time' },
                { id: 'retentionInDays', title: 'Retention Period' },
                { id: 'storedBytes', title: 'Stored Bytes' },
            ],
        });

        await csvWriter.writeRecords(results);
        log('Cloud Watch Log Group details written to CSV');
    }
}
