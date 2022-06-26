import init from '..'

import { createWalletTable, dropWalletTable } from '../models/wallet'
import { createTransactionTable, dropTransactionTable } from '../models/transaction'
import { createAdminWhitelistTable, dropAdminWhitelistTable } from '../models/admin_whitelist'
import { createMemberTable, dropMemberTable } from '../models/member'
import { createAccessLevelTable, defineAccessLevel } from '../models/access_level'
import { createMemberAwardTable } from '../models/member_award'
import { addMemberInfoAvatar, createMemberInfoTable } from '../models/member_info'
import { createMemberAddressTable } from '../models/member_address'

await init()

// await dropAdminWhitelistTable()
// await dropTransactionTable()
// await dropWalletTable()
// await dropMemberTable()

await createAccessLevelTable()
await defineAccessLevel()
await createAdminWhitelistTable()
await createMemberTable()
await createWalletTable()
await createTransactionTable()

await createMemberAddressTable()
await createMemberInfoTable()
await createMemberAwardTable()

process.exit(0)
