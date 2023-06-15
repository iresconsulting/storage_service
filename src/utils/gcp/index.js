import * as fs from 'fs/promises'
import * as fsCb from 'fs'
import * as path from 'path'
import process from 'process'
import { authenticate } from '@google-cloud/local-auth';
import { google } from 'googleapis'
import Logger from '../logger';
import { v4 as uuid } from 'uuid'
import moment from 'moment';

// If modifying these scopes, delete token.json.
const SCOPES = [
  'https://www.googleapis.com/auth/drive.metadata.readonly',
  'https://www.googleapis.com/auth/drive'
];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), 'src/data/gcp', 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'src/data/gcp', 'credentials.json');

let client = null

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
    try {
      const content = await fs.readFile(TOKEN_PATH);
      const credentials = JSON.parse(content);
      return google.auth.fromJSON(credentials);
    } catch (err) {
      return null;
    }
  }
  
  /**
   * Serializes credentials to a file comptible with GoogleAUth.fromJSON.
   *
   * @param {OAuth2Client} client
   * @return {Promise<void>}
   */
  async function saveCredentials(client) {
    const content = await fs.readFile(CREDENTIALS_PATH);
    const keys = JSON.parse(content);
    const key = keys.installed || keys.web;
    const payload = JSON.stringify({
      type: 'authorized_user',
      client_id: key.client_id,
      client_secret: key.client_secret,
      refresh_token: client.credentials.refresh_token,
    });
    await fs.writeFile(TOKEN_PATH, payload);
  }
  
  /**
   * Load or request or authorization to call APIs.
   *
   */
  async function authorize() {
    client = await loadSavedCredentialsIfExist();
    if (client) {
      Logger.generateTimeLog({ label: Logger.Labels.GCP, message: 'authorize success.' })
      return client;
    }
    client = await authenticate({
      scopes: SCOPES,
      keyfilePath: CREDENTIALS_PATH,
    });
    if (client.credentials) {
      await saveCredentials(client);
    }
    Logger.generateTimeLog({ label: Logger.Labels.GCP, message: 'authorize success.' })
    return client;
  }
  
  const gdrive = {
    /**
     * Lists the names and IDs of up to 10 files.
     * @param {OAuth2Client} authClient An authorized OAuth2 client.
     */
      async listFiles(pageSize = 20, query = '') {
        const service = google.drive({version: 'v3', auth: client });
        const res = await service.files.list({
          spaces: 'drive',
          q: query,
          pageSize,
          fields: 'nextPageToken, files(id, name, mimeType, modifiedTime)',
        });
        const files = res.data.files;
        if (files.length === 0) {
          return [];
        }
        console.log('res.data', res.data);
        return res.data || []
      },
      /**
       * Insert new file.
       * @return{obj} file Id
       * */
    async uploadFile({ name = 'fileName', fields = 'id', mimeType, path }) {
      // Get credentials and build service
      const service = google.drive({ version: 'v3', auth: client });
      const requestBody = {
        name,
        fields: fields,
      };
      const media = {
        mimeType,
        body: fsCb.createReadStream(path),
      };
      try {
        const file = await service.files.create({
          requestBody,
          media: media,
        });
        return file;
      } catch (err) {
        Logger.generateTimeLog({ label: Logger.Labels.GCP, message: String(err) })
        throw err
      }
    },

    // convertFileMimeType(mimeType = '') {
    //   if (!mimeType) {
    //     return
    //   }
    //   switch (mimeType) {
    //     case 'application/vnd.google-apps.spreadsheet':
    //       return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    //     default:
    //       return
    //   }
    // },

    convertFileMimeTypeToExt(mimeType = '') {
      if (!mimeType) {
        return
      }
      switch (mimeType) {
        case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
          return '.xlsx'
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          return '.docx'
        case 'application/pdf':
          return '.pdf'
        case 'text/plain':
          return '.txt'
        case 'application/zip':
          return '.zip'
        case 'text/csv':
          return '.csv'
        case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
          return '.pptx'
        case 'image/jpeg':
          return '.jpeg'
        case 'image/png':
          return '.png'
        case 'image/svg+xml':
          return '.svg'
        case 'image/gif':
          return '.gif'
        case 'audio/mpeg':
          return '.mp3'
        default:
          return
      }
    },
    getFileExtFromFileName(name) {
      if (name && name.includes('.')) {
        const splitted = name.split('.')
        if (splitted.length === 2) {
          return `.${splitted[1]}`
        }
        return ''
      }
      return ''
    },
    /**
     * Downloads a file
     * @param{string} realFileId file ID
     * @return{obj} file status
     * */
    async downloadFile(fileId = '', name = '', mimeType = '') {
      if (!fileId) {
        return
      }
      const service = google.drive({ version: 'v3', auth: client });
      try {
        const file = await service.files.get({
          fileId,
          alt: 'media',
        });
        // console.log(file);
        const dataUrl = `data:${file.headers["content-type"]};base64,${Buffer.from(file.data).toString('base64')}`;
        // console.log('dataUrl', dataUrl);
        const extFromName = gdrive.getFileExtFromFileName(name)
        const fileName = (name ? extFromName ? name.split('.')[0] : name : name) || 'gdrive_download_' + uuid() + '_' + moment().format('YYYYMMDD_HHmmss')
        const ext = extFromName || gdrive.convertFileMimeTypeToExt(mimeType)
        const path = `${process.cwd()}/src/public/${fileName}${ext}`
        const data = file.data
        // await fs.writeFile(path, data, 'binary')
        // return file;

        return dataUrl
      } catch (err) {
        Logger.generateTimeLog({ label: Logger.Labels.GCP, message: String(err) })
        throw err
      }
    }
  }

  export {
    client,
    authorize,
    gdrive
  }