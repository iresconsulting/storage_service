import * as admin from 'firebase-admin'
import * as credential from './credentials.json'

const config = {
  type: credential.type,
  projectId: credential.project_id,
  privateKeyId: credential.private_key_id,
  privateKey: credential.private_key,
  clientEmail: credential.client_email,
  clientId: credential.client_id,
  authUri: credential.auth_uri,
  tokenUri: credential.token_uri,
  authProviderX509CertUrl: credential.auth_provider_x509_cert_url,
  clientC509CertUrl: credential.client_x509_cert_url,
}

async function initSDK(): Promise<admin.app.App | undefined> {
  try {
    console.log('[Firebase] Credential:', config)
    const initResult = await admin.initializeApp(config)
    if (admin) {
      await admin.auth()
      console.log('[Firebase] Init Success')
      return initResult
    } else {
      throw new Error('init failed')
    }
  } catch (e: unknown) {
    const _err = (e as string).toString()
    console.log('[Firebase] Error: Init ' + _err)
    Promise.reject(new Error(_err))
  }
}

export default await initSDK()
