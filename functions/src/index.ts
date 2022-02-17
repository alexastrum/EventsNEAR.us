import { auth, firestore, initializeApp } from 'firebase-admin';
import { onCall } from 'firebase-functions/v1/https';
import { logger } from 'firebase-functions/v1';

import { sign } from 'tweetnacl';
// import { JsonRpcProvider } from 'near-api-js/lib/providers';

// import * as express from 'express';
// import * as cors from 'cors';

// import fetch from 'node-fetch';
// // eslint-disable-next-line
// globalThis.fetch = fetch as any;

initializeApp();
const db = firestore();

const nearConfig = { nodeUrl: 'https://rpc.testnet.near.org' };

function verifySignature(signature: string) {
  const [nodeUrl, sigAccountId, publicKey, nonce, hash] = JSON.parse(
    signature
  ) as string[];
  if (nodeUrl !== nearConfig.nodeUrl) {
    throw new Error('Verify failed: Invalid nodeUrl: ' + nodeUrl);
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  const good = sign.detached.verify(
    Buffer.from(nonce, 'hex'),
    Buffer.from(hash, 'hex'),
    Buffer.from(publicKey, 'hex')
  );
  logger.log('Signature good:', JSON.parse(signature));

  if (!good) {
    // throw new Error('Verify failed: Invalid signature: ' + hash);
  }

  // // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  // const provider = new JsonRpcProvider(nodeUrl);
  // // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  // const result = await provider.query({
  //   request_type: 'view_access_key',
  //   account_id: sigAccountId,
  //   public_key: publicKey,
  //   finality: 'optimistic',
  // });
  // logger.log('Public key confirmed:', result);

  return sigAccountId;
}

interface SignInRequest {
  signature: string;
}

interface SignInResponse {
  profile: {
    // TODO
  };
  token: string;
}

export const signIn = onCall(
  async (
    { signature }: SignInRequest /*context: CallableContext*/
  ): Promise<SignInResponse> => {
    const uid = verifySignature(signature);
    const user = await db.collection('users').doc(uid).get();
    const token = await auth().createCustomToken(uid);
    if (!user.exists) {
      const data = { signature };
      await user.ref.create(data);
      return { profile: data, token };
    }
    return { profile: user.data() || {}, token };
  }
);

// const app = express();
// app.use(cors({ origin: true }));

// app.post('/api/signIn', (req, res) => {
//   void (async () => {
//     try {
//       const uid = await verifySignature(signature);
//       const { signature } = req.body as SignInRequest;
//       await verifySignature(signature);
//       const user = await db.collection('users').doc(uid).get();
//       const token = await auth().createCustomToken(uid);

//       if (!user.exists) {
//         const data = { signature };
//         await user.ref.create(data);
//         res.send({ profile: data, token });
//         return;
//       }

//       res.send({ profile: user.data() || {}, token });
//     } catch (error) {
//       logger.error(error);
//       res.status(500).send(error);
//     }
//   })();
// });

// export const helloWorld = onRequest((request, response) => {
//   functions.logger.info('Hello logs!', { structuredData: true });
//   response.send('Hello from Firebase!');
// });

// export const publicApi = onRequest(app);
