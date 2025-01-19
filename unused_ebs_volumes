import { createObjectCsvWriter as createCsvWriter } from "csv-writer";
import { EC2Client, DescribeVolumesCommand, Volume } from "@aws-sdk/client-ec2";
import { IExecutableTaskConfig } from "../../config/config";
import { log } from "console";
import { ExecutableScript } from "../../models/abstract_script";

export class RetrieveEBSVolumes extends ExecutableScript {
    constructor(executable_config: IExecutableTaskConfig) {
        super(executable_config);
    }

    async execute(): Promise<any> {
        console.log('Scanning EBS Volumes');
        const results: any[] = [];

        // Get AWS SSO credentials and region
        const ec2Client = new EC2Client({
            credentials: {
                accessKeyId: this.executable_config.roleCredentials.roleCredentials?.accessKeyId!,
                secretAccessKey: this.executable_config.roleCredentials.roleCredentials?.secretAccessKey!,
                sessionToken: this.executable_config.roleCredentials.roleCredentials?.sessionToken,
                accountId: this.executable_config.account,
            },
            region: this.executable_config.region,
        });

        // Utilize pagination to retrieve all EBS volumes
        try {
            let nextToken: string | undefined;
            do {
                const command = new DescribeVolumesCommand({
                    NextToken: nextToken,
                });
                const response = await ec2Client.send(command);
                const volumes: Volume[] = response.Volumes || [];

                volumes.forEach((volume) => {
                    if (volume.State == "available") {
                        results.push({
                            accountName: this.executable_config.accountName,
                            accountId: this.executable_config.account,
                            region: this.executable_config.region,
                            resourceType: "AWS::EC2::Volume",
                            resourceId: volume.VolumeId,
                            state: volume.State,
                        });
                    }
                });

                nextToken = response.NextToken;
            } while (nextToken);
        } catch (error) {
            log(`Error retrieving EBS volumes for region ${this.executable_config.region}: ${error}`);
        }

        // Write results to CSV
        const csvWriter = createCsvWriter({
            path: `csv_output/ebs_volumes_${new Date().getMonth()}-${new Date().getDate()}.csv`,
            append: true,
            alwaysQuote: true,
            header: [
                { id: "accountName", title: "AccountName" },
                { id: "accountId", title: "AccountId" },
                { id: "region", title: "Region" },
                { id: "resourceType", title: "ResourceType" },
                { id: "resourceId", title: "ResourceId" },
                { id: "state", title: "State" },
            ],
        });

        await csvWriter.writeRecords(results);
        log("EBS volume details written to CSV");
    }
}
