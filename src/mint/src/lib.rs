use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    pubkey::Pubkey,
    program::invoke,
    system_instruction,
    native_token::LAMPORTS_PER_SOL
};
use spl_token::instruction::{self as token_instruction, AuthorityType};
use spl_associated_token_account::instruction as token_account_instruction;

entrypoint!(process_instruction);

fn process_instruction(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    _instruction_data: &[u8],
) -> ProgramResult {
    // Iterating accounts is safer than indexing
    let accounts_iter = &mut accounts.iter();

    let mint = next_account_info(accounts_iter)?;
    let token_account = next_account_info(accounts_iter)?;
    let mint_authority = next_account_info(accounts_iter)?;
    let rent = next_account_info(accounts_iter)?;
    let _system_program = next_account_info(accounts_iter)?;
    let token_program = next_account_info(accounts_iter)?;
    let associated_token_program = next_account_info(accounts_iter)?;

    msg!("Creating mint account with key {}", &mint.key);
    invoke(
        &system_instruction::create_account(
            mint_authority.key,
            mint.key,
            LAMPORTS_PER_SOL,
            82,
            token_program.key
        ),
        &[
            mint.clone(),
            mint_authority.clone(),
            token_program.clone()
        ]
    )?;

    msg!("Initializing mint account");
    invoke(
        &token_instruction::initialize_mint(
            token_program.key,
            mint.key,
            mint_authority.key,
            Some(mint_authority.key),
            0
        )?,
        &[
            mint.clone(),
            mint_authority.clone(),
            token_program.clone(),
            rent.clone()
        ]
    )?;

    msg!("Creating token account with address {}", &token_account.key);
    invoke(
        &token_account_instruction::create_associated_token_account(
            mint_authority.key,
            mint_authority.key,
            mint.key,
            token_program.key
        ),
        &[
            mint.clone(),
            token_account.clone(),
            mint_authority.clone(),
            token_program.clone(),
            associated_token_program.clone()
        ]
    )?;

    msg!("Minting token to account {}", &token_account.key);
    invoke(
        &token_instruction::mint_to(
            token_program.key,
            mint.key,
            token_account.key,
            mint_authority.key,
            &[mint_authority.key],
            1
        )?,
        &[
            mint.clone(),
            mint_authority.clone(),
            token_account.clone(),
            token_program.clone(),
            rent.clone()
        ]
    )?;

    msg!("Disabling token minting");
    invoke(
        &token_instruction::set_authority(
            token_program.key,
            mint.key,
            None,
            AuthorityType::MintTokens,
            mint_authority.key,
            &[mint_authority.key]
        )?,
        &[
            mint.clone(),
            mint_authority.clone()
        ]
    )?;

    msg!("Finished!");

    Ok(())
}
