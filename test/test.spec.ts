import { readFileSync } from "fs";

describe('Evaluate submission', () => {
    let txid: string;
    let MinnerInputAddress: string;
    let MinnerInputAmount: number;
    let TradersssInputAddress: string;
    let TradersssInputAmount: number;
    let MinnerChangeAddress: string;
    let MinnerChangeAmount: number;
    let fee: number;
    let blockHeight: number;
    let blockHash: string;
    let tx: any;

    it('should read data from out.txt and perform sanity checks', () => {
        // read txid from out.txt
        const data = readFileSync('out.txt', 'utf8').trim().split('\n');
        expect(data.length).toBe(10);

        txid = data[0].trim();
        expect(txid).toBeDefined();
        expect(txid).toHaveLength(64);

        MinnerInputAddress = data[1].trim();
        expect(MinnerInputAddress).toBeDefined();

        MinnerInputAmount = parseFloat(data[2].trim());
        expect(MinnerInputAmount).toBeDefined();
        expect(MinnerInputAmount).toBeGreaterThan(0);

        TradersssInputAddress = data[3].trim();
        expect(TradersssInputAddress).toBeDefined();

        TradersssInputAmount = parseFloat(data[4].trim());
        expect(TradersssInputAmount).toBeDefined();
        expect(TradersssInputAmount).toBeGreaterThan(0);

        MinnerChangeAddress = data[5].trim();
        expect(MinnerChangeAddress).toBeDefined();

        MinnerChangeAmount = parseFloat(data[6].trim());
        expect(MinnerChangeAmount).toBeDefined();
        expect(MinnerChangeAmount).toBeGreaterThan(0);

        fee = parseFloat(data[7].trim());
        expect(fee).toBeDefined();
        if (fee < 0) fee = -fee;
        expect(fee).toBeGreaterThan(0);

        blockHeight = parseInt(data[8].trim());
        expect(blockHeight).toBeDefined();
        expect(blockHeight).toBeGreaterThan(0);

        blockHash = data[9].trim();
        expect(blockHash).toBeDefined();
        expect(blockHash).toHaveLength(64);
    });

    it('should get transaction details from node', async () => {
        const RPC_USER = "mubarak23";
        const RPC_PASSWORD = "mubarak23";
        const RPC_HOST = "http://127.0.0.1:18443/wallet/Minner";

        const response = await fetch(RPC_HOST, {
            method: 'post',
            body: JSON.stringify({
                jsonrpc: '1.0',
                id: 'curltest',
                method: 'gettransaction',
                params: [txid, null, true]
            }),
            headers: {
                'Content-Type': 'text/plain',
                'Authorization': 'Basic ' + Buffer.from(`${RPC_USER}:${RPC_PASSWORD}`).toString('base64'),
            }
        });
        const result = (await response.json()).result as any;
        expect(result).not.toBeNull();
        expect(result.txid).toBe(txid);

        tx = result;
    });

    it('should have the correct block height', () => {
        expect(tx.blockheight).toBe(blockHeight);
    });

    it('should have the correct block hash', () => {
        expect(tx.blockhash).toBe(blockHash);
    });

    it('should have the correct number of vins', () => {
        expect(tx.decoded.vin.length).toBe(1);
    });

    it('should have the correct number of vouts', () => {
        expect(tx.decoded.vout.length).toBe(2);
    });

    it('should have the correct Minner output', () => {
        const MinnerOutput = tx.decoded.vout.find((o: any) => o.scriptPubKey.address.includes(MinnerChangeAddress));
        expect(MinnerOutput).toBeDefined();
        expect(MinnerOutput.value).toBe(MinnerChangeAmount);
    });

    it('should have the correct Tradersss output', () => {
        const TradersssOutput = tx.decoded.vout.find((o: any) => o.scriptPubKey.address.includes(TradersssInputAddress));
        expect(TradersssOutput).toBeDefined();
        expect(TradersssOutput.value).toBe(TradersssInputAmount);
    });

    it('should have the correct fee', () => {
        expect(Math.abs(tx.fee)).toBe(fee);
    });
});