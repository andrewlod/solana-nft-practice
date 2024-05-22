import { AccountInfo, Connection, Keypair, PublicKey, SystemProgram, Transaction, TransactionInstruction, sendAndConfirmTransaction } from '@solana/web3.js';
import { fs } from 'mz';
import path from 'path';
import os from 'os';
import yaml from 'yaml';

const CONFIG_FILE_PATH = path.resolve(
  os.homedir(),
  '.config',
  'solana',
  'cli',
  'config.yml'
);

const PROGRAM_PATH = path.resolve(__dirname, '../../dist/program');

export async function createKeypairFromFile(filePath: string): Promise<Keypair> {
  const secretKeyString = await fs.readFile(filePath, { encoding: 'utf8' });
  const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
  return Keypair.fromSecretKey(secretKey);
}

export async function airdropAccount(connection: Connection, publicKey: PublicKey, lamports: number): Promise<void> {
  const airdropRequest = await connection.requestAirdrop(
    publicKey,
    lamports
  );

  const latestBlockhash = await connection.getLatestBlockhash();

  await connection.confirmTransaction({
    blockhash: latestBlockhash.blockhash,
    lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    signature: airdropRequest
  });
}

export async function getLocalAccount(): Promise<Keypair> {
  const configYml = await fs.readFile(CONFIG_FILE_PATH, { encoding: 'utf8' });
  const keypairPath: string = await yaml.parse(configYml).keypair_path;
  return await createKeypairFromFile(keypairPath);
}

export async function getProgram(programName: string): Promise<Keypair> {
  return await createKeypairFromFile(
    path.join(PROGRAM_PATH, `${programName}-keypair.json`)
  );
}