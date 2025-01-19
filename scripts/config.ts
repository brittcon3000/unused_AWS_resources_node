import { AWS_ACCOUNTS, AWS_REGIONS } from '../../models/aws_accounts';
import { IScriptsConfig } from '../../config/config';

export const CONFIG: IScriptsConfig = {
    accountsConfig: {
        [AWS_ACCOUNTS.<yourAWSAccount>]: {
            enabled: true,
            regions: [AWS_REGIONS.US_WEST_2, AWS_REGIONS.US_EAST_1, AWS_REGIONS.SA_EAST_1],
        },
    },
};
