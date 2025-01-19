import { createObjectCsvWriter as createCsvWriter } from 'csv-writer';
import { IAMClient, ListUsersCommand, ListAccessKeysCommand, GetAccessKeyLastUsedCommand } from '@aws-sdk/client-iam';
import { IExecutableTaskConfig } from '../../config/config';
import { log } from 'console';
import { ExecutableScript } from '../../models/abstract_script';
export class RetrieveIAMUsers extends ExecutableScript {
    constructor(executable_config: IExecutableTaskConfig) {
        super(executable_config);
    }
    async execute(): Promise<any> {
        console.log('here');
        const results: any[] = [];
        const inactiveThreshold = new Date();
        inactiveThreshold.setUTCDate(inactiveThreshold.getUTCDate() - 180); // 180 days threshold
        //IAM USERS ARE GLOBAL, LOGIC NEEDS TO CHANGE
        const iamClient = new IAMClient({
            credentials: {
                accessKeyId: this.executable_config.roleCredentials.roleCredentials?.accessKeyId!,
                secretAccessKey: this.executable_config.roleCredentials.roleCredentials?.secretAccessKey!,
                sessionToken: this.executable_config.roleCredentials.roleCredentials?.sessionToken,
                accountId: this.executable_config.account,
            },
            region: this.executable_config.region,
        });
        try {
            // Paginate through IAM users
            let Marker: string | undefined;
            do {
                const command = new ListUsersCommand({
                    Marker,
                });
                const response = await iamClient.send(command);
                const users = response.Users || [];
                for (const user of users) {
                    // Calculate LastActivity
                    const userName = user.UserName || '';
                    const passwordLastUsed = user.PasswordLastUsed ? new Date(user.PasswordLastUsed) : null;
                    let lastActivity = passwordLastUsed;
                    const accessKeysResponse = await iamClient.send(new ListAccessKeysCommand({ UserName: userName }));
                    for (const key of accessKeysResponse.AccessKeyMetadata || []) {
                        const accessKeyId = key.AccessKeyId || '';
                        const keyLastUsedResponse = await iamClient.send(
                            new GetAccessKeyLastUsedCommand({ AccessKeyId: accessKeyId })
                        );
                        const keyLastUsedDate = keyLastUsedResponse.AccessKeyLastUsed?.LastUsedDate
                            ? new Date(keyLastUsedResponse.AccessKeyLastUsed.LastUsedDate)
                            : null;
                        if (!lastActivity || (keyLastUsedDate && keyLastUsedDate > lastActivity)) {
                            lastActivity = keyLastUsedDate;
                        }
                    }
                    // Check if the user is inactive
                    if (!lastActivity || lastActivity < inactiveThreshold) {
                        results.push({
                            accountName: this.executable_config.accountName,
                            accountId: this.executable_config.account,
                            userName: user.UserName,
                            lastActivity: lastActivity ? lastActivity.toISOString() : 'Never Active',
                        });
                    }
                }
                Marker = response.Marker;
            } while (Marker);
        } catch (error) {
            log(`Error retrieving IAM users for account ${this.executable_config.account}: ${error}`);
        }
        // Write results to CSV
        const csvWriter = createCsvWriter({
            path: `iam_users_${new Date().getMonth()}-${new Date().getDate()}.csv`,
            append: true,
            alwaysQuote: true,
            header: [
                { id: 'accountName', title: 'AccountName' },
                { id: 'accountId', title: 'AccountId' },
                { id: 'userName', title: 'UserName' },
                { id: 'lastActivity', title: 'LastActivity' },
            ],
        });
        await csvWriter.writeRecords(results);
        log('IAM user details written to CSV');
    }
}
