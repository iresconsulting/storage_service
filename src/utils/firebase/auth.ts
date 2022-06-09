import admin from './admin'

namespace Firebase {
  export async function authenticateToken(token: string): Promise<{
    email: string,
    name: string,
    user_id: string,
    iat: number,
    sign_in_provider: string,
    phone_number: string,
    picture: string,
    email_verified: boolean
  }> {
    if (admin) {
      const decodedToken = await admin.auth().verifyIdToken(token)
      const {
        iat,
        email,
        name,
        user_id,
        firebase: { sign_in_provider },
        phone_number,
        picture,
        email_verified
      } = decodedToken
      if (!email || !iat) {
        throw new Error('email or iat invalid')
      }
      return {
        email,
        name,
        user_id,
        iat,
        sign_in_provider,
        phone_number: phone_number || '',
        picture: picture || '',
        email_verified: !!email_verified
      }
    } else {
      throw new Error('authenticateToken admin instance not found')
    }
  }

  export async function verifyToken(token: string): Promise<boolean> {
    if (admin) {
      const decodedToken = await admin.auth().verifyIdToken(token)
      if (decodedToken) {
        return true
      }
      return false
    } else {
      throw new Error('verifyToken admin instance not found')
    }
  }

  export enum Provider {
    GOOGLE = 'google',
    FACEBOOK = 'facebook',
    TWITTER = 'twitter'
  }
}

export default Firebase
