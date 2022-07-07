import { MessageBuilder, Webhook } from 'discord-webhook-node'

export const channels = {
  default: 'https://discordapp.com/api/webhooks/994600496084029552/ED2-Kcp2nesP9iOZlowbzp1e9II-za76SwxHGn0uYN0sQ9AKE_URR83xSL870vCAkWCp'
}

export default function createHook(url: string) {
  return new Webhook({ url, throwErrors: true })
}

export async function bulkSendMessage(messageList: MessageBuilder[], webhookUrl?: string) {
  for (let i = 0; i < messageList.length; i++) {
    const hook = createHook(webhookUrl || channels.default)
    await hook.send(messageList[i])
  }
}

export async function sendMessage(message: MessageBuilder, webhookUrl?: string) {
  const hook = createHook(webhookUrl || channels.default)
  await hook.send(message)
}

export async function sendErrorMessage(title: string, content: string, webhookUrl: string) {
  const hook = createHook(webhookUrl)
  await hook.error('Error', title, content)
}

export function genSysMsg(title: string, message: string) {
  const embed = new MessageBuilder().setTitle(title).setAuthor(message)
  return embed
}
