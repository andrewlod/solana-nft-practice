import {
  Connection,
  Keypair,
  SYSVAR_RENT_PUBKEY,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';

import dotenv from 'dotenv';
import { getLocalAccount, getProgram } from './util';
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';
dotenv.config();

const {
  SOLANA_NETWORK
} = process.env;


async function main() {
  let connection = new Connection(`http://api.${SOLANA_NETWORK}.solana.com`, 'confirmed');

  const wallet = await getLocalAccount();
  const programId = (await getProgram('mint')).publicKey;

  const mintKeypair = Keypair.generate();
  const tokenAddress = await getAssociatedTokenAddress(
    mintKeypair.publicKey,
    wallet.publicKey
  );

  const instruction = new TransactionInstruction({
    keys: [
      {
        pubkey: mintKeypair.publicKey,
        isSigner: true,
        isWritable: true
      },
      {
        pubkey: tokenAddress,
        isSigner: false,
        isWritable: true
      },
      {
        pubkey: wallet.publicKey,
        isSigner: true,
        isWritable: false
      },
      {
        pubkey: SYSVAR_RENT_PUBKEY,
        isSigner: false,
        isWritable: false
      },
      {
        pubkey: SystemProgram.programId,
        isSigner: false,
        isWritable: false
      },
      {
        pubkey: TOKEN_PROGRAM_ID,
        isSigner: false,
        isWritable: false
      },
      {
        pubkey: ASSOCIATED_TOKEN_PROGRAM_ID,
        isSigner: false,
        isWritable: false
      }
    ],
    programId,
    data: Buffer.alloc(0)
  });

  const transaction = new Transaction().add(instruction);
  await sendAndConfirmTransaction(connection, transaction, [wallet, mintKeypair]);
}

main();