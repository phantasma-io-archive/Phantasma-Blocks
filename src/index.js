import * as dotenv from "dotenv";
import * as fs from 'fs';
import * as path from 'path';
import { Address, Base16, PhantasmaAPI, PhantasmaKeys, ScriptBuilder, Transaction } from 'phantasma-ts';
dotenv.config();
const API_URL = String(process.env.API_URL);
const NexusName = String(process.env.NEXUS_NAME);
const ChainName = String(process.env.CHAIN_NAME);
const Payload = Base16.encode(String(process.env.PAYLOAD));
const Wallet1 = PhantasmaKeys.fromWIF(process.env.WALLET1_WIF);
const Wallet2 = PhantasmaKeys.fromWIF(process.env.WALLET2_WIF);
const GasPrice = Number(process.env.GAS_PRICE);
const GasLimit = Number(process.env.GAS_LIMIT);
const api = new PhantasmaAPI(API_URL, undefined, NexusName);
const LogsDirectoryPath = String(process.env.FOLDER_PATH_TO_LOGS);
const FeesPaidFilePath = String(process.env.FEES_PAID_FILE_PATH);
const TotalKCALFilePath = String(process.env.TOTAL_KCAL_FILE_PATH);
const NumberOfTransactionsFilePath = String(process.env.NUMBER_OF_TRANSACTIONS_FILE_PATH);
let feesPaid = 0;
let totalKCALSent = 0;
let numberOfTransactions = 0;
let file = "";
const SendSymbol = "KCAL";
const SendDecimals = 10;
const SendAmount = 0.00005 * 10 ** SendDecimals;
let StartRunTime = new Date();
let LastLogTime = new Date();
const FileTimeLimit = 1000 * 60 * 60 * 4; // 4  Hours
function GenerateWallets() {
    const Wallet_1 = PhantasmaKeys.generate();
    const Wallet_2 = PhantasmaKeys.generate();
    console.info("Wallet 1 Wif : ", Wallet_1.toWIF());
    console.info("Wallet 2 Wif : ", Wallet_2.toWIF());
}
function LoadTrackers() {
    if (fs.existsSync(FeesPaidFilePath)) {
        const feesPaidFromFile = fs.readFileSync(FeesPaidFilePath, 'utf8');
        if (feesPaidFromFile) {
            feesPaid = parseInt(feesPaidFromFile);
        }
    }
    if (fs.existsSync(TotalKCALFilePath)) {
        const totalSOULFromFile = fs.readFileSync(TotalKCALFilePath, 'utf8');
        if (totalSOULFromFile) {
            totalKCALSent = parseInt(totalSOULFromFile);
        }
    }
    if (fs.existsSync(NumberOfTransactionsFilePath)) {
        const numberOfTransactionsFromFile = fs.readFileSync(NumberOfTransactionsFilePath, 'utf8');
        if (numberOfTransactionsFromFile) {
            numberOfTransactions = parseInt(numberOfTransactionsFromFile);
        }
    }
}
function SaveTrackers() {
    fs.existsSync(LogsDirectoryPath) || fs.mkdirSync(LogsDirectoryPath);
    fs.existsSync(FeesPaidFilePath);
    fs.existsSync(TotalKCALFilePath);
    fs.existsSync(NumberOfTransactionsFilePath);
    fs.writeFileSync(FeesPaidFilePath, String(feesPaid));
    fs.writeFileSync(TotalKCALFilePath, String(totalKCALSent));
    fs.writeFileSync(NumberOfTransactionsFilePath, String(numberOfTransactions));
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function SendTransaction(from, to) {
    await SaveAdditionalData(file, `<Transaction Number ${numberOfTransactions}>`);
    await SaveAdditionalData(file, `Sending ${SendAmount / 10 ** SendDecimals} ${SendSymbol} from ${from.Address.Text} to ${to.Text}`);
    let expiration = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate(), new Date().getUTCHours() + 1, new Date().getUTCMinutes() + 10, new Date().getUTCSeconds() + 10));
    console.info("Expiration:", expiration);
    await SaveAdditionalData(file, `Expiration: ${expiration}`);
    let script;
    let sb = new ScriptBuilder();
    let myScript = sb.AllowGas(from.Address, Address.Null, GasPrice, GasLimit)
        .CallInterop("Runtime.TransferTokens", [from.Address.Text, to.Text, SendSymbol, String(SendAmount)])
        .SpendGas(from.Address);
    script = myScript.EndScript();
    const tx = new Transaction(NexusName, ChainName, script, expiration, Payload);
    tx.signWithKeys(from);
    const rawTx = Base16.encodeUint8Array(tx.ToByteAray(true));
    await SaveAdditionalData(file, rawTx);
    const hash = await api.sendRawTransaction(rawTx);
    console.info("Transaction sent: ", hash);
    let txInfo = await api.getTransaction(hash);
    while (!txInfo || txInfo.error !== undefined) {
        console.info("Transaction Info: ", txInfo);
        console.log("Waiting for transaction to be mined...");
        await sleep(2000);
        txInfo = await api.getTransaction(hash);
    }
    console.log("Transaction mined!");
    console.info("Transaction Info: ", txInfo);
    if (txInfo) {
        console.info("Transaction Info: ", txInfo);
        await SaveAdditionalData(file, `Transaction Info: ${JSON.stringify(txInfo)}`);
        if (txInfo.state === "Halt") {
            feesPaid += parseInt(txInfo.fee);
            numberOfTransactions++;
            totalKCALSent += SendAmount;
        }
    }
    await SaveTrackers();
    await SaveAdditionalData(file, `\nTotal KCAL Sent: ${totalKCALSent / 10 ** SendDecimals}\nNumber of Transactions: ${numberOfTransactions}\nFees Paid: ${feesPaid} KCAL\nHash: ${hash}`);
    await SaveAdditionalData(file, `</Transaction Number ${numberOfTransactions}>`);
    return hash;
}
async function SaveAdditionalData(fileName, additionalData) {
    await fs.existsSync(LogsDirectoryPath) || await fs.mkdirSync(LogsDirectoryPath);
    const filePath = path.join(LogsDirectoryPath, fileName);
    if (!await fs.existsSync(filePath)) {
        await fs.writeFileSync(filePath, additionalData);
        return;
    }
    await fs.appendFileSync(filePath, `\n${additionalData}`);
}
async function NewFileName() {
    let timestamp = LastLogTime.toISOString().replace(/[\-\:\.]/g, '');
    file = `Log_${timestamp}.log`;
}
async function InitLogs() {
    await SaveAdditionalData(file, `<Init>`);
    await SaveAdditionalData(file, `Start program...`);
    await SaveAdditionalData(file, `Start Run time: ${StartRunTime.toISOString()}`);
    await SaveAdditionalData(file, `Last Log Time: ${LastLogTime.toISOString()}`);
    await SaveAdditionalData(file, `File Time Limit: ${FileTimeLimit}`);
    await SaveAdditionalData(file, `Wallet1: ${Wallet1.Address.Text}`);
    await SaveAdditionalData(file, `Wallet2: ${Wallet2.Address.Text}`);
    await SaveAdditionalData(file, `Send Symbol: ${SendSymbol}`);
    await SaveAdditionalData(file, `Send Decimals: ${SendDecimals}`);
    await SaveAdditionalData(file, `Send Amount: ${SendAmount / 10 ** SendDecimals}`);
    await SaveAdditionalData(file, `Gas Price: ${GasPrice}`);
    await SaveAdditionalData(file, `Gas Limit: ${GasLimit}`);
    await SaveAdditionalData(file, `API URL: ${API_URL}`);
    await SaveAdditionalData(file, `Nexus Name: ${NexusName}`);
    await SaveAdditionalData(file, `Chain Name: ${ChainName}`);
    await SaveAdditionalData(file, `Payload: ${Payload}`);
    await SaveAdditionalData(file, `Logs Directory Path: ${LogsDirectoryPath}`);
    await SaveAdditionalData(file, `Fees Paid File Path: ${FeesPaidFilePath}`);
    await SaveAdditionalData(file, `Fees Paid : ${feesPaid}`);
    await SaveAdditionalData(file, `Total KCAL File Path: ${TotalKCALFilePath}`);
    await SaveAdditionalData(file, `Total KCAL: ${totalKCALSent}`);
    await SaveAdditionalData(file, `Number Of Transactions File Path: ${NumberOfTransactionsFilePath}`);
    await SaveAdditionalData(file, `Number Of Transactions: ${numberOfTransactions}`);
    await SaveAdditionalData(file, `</Init>`);
}
/**
 * Send transactions
 */
async function SendTransactions() {
    await sleep(3000);
    await SendTransaction(Wallet1, Wallet2.Address);
    await sleep(3000);
    await SendTransaction(Wallet2, Wallet1.Address);
}
async function RunProgram() {
    console.log("Start program...");
    await NewFileName();
    await LoadTrackers();
    await InitLogs();
    while (true) {
        await LoadTrackers();
        if (new Date().getTime() - LastLogTime.getTime() > FileTimeLimit) {
            LastLogTime = new Date();
            await NewFileName();
            await InitLogs();
        }
        await SendTransactions();
        await sleep(1000);
    }
}
RunProgram();
//# sourceMappingURL=index.js.map