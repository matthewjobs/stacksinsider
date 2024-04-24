const axios = require('axios');

const CONTRACT_ID = 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.amm-swap-pool-v1-1'


const getContractEvent = async () => {
    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `https://api.mainnet.hiro.so/extended/v1/contract/${CONTRACT_ID}/events?limit=50`,
        headers: {
            'Accept': 'application/json'
        }
    };
    return await axios.request(
        config
    )
};

const getTransactionInfo = async (tx_id) => {
    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `https://api.mainnet.hiro.so/extended/v1/tx/${tx_id}`,
        headers: {
            'Accept': 'application/json'
        }
    };
    return await axios.request(
        config
    )
}

const getContractInfo = async (contract_id) => {
    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `https://api.mainnet.hiro.so/extended/v1/contract/${contract_id}`,
        headers: {
            'Accept': 'application/json'
        }
    };

    return await axios.request(
        config
    )
}

function parseTuple(t) {
    var lc = "(";
    var rc = ")";
    var lc_level = 0;
    var rc_level = 0;
    var last_lc = 0;
    var last_rc = 0;
    var result = [];
    for (i = 0; i < t.length; i++) {
        if (t[i] == lc) {
            lc_level++;
            last_lc = i;
        } else if (t[i] == rc) {
            rc_level++;
            last_rc = i;
        }
        if (rc_level == 1) {
            var substr = t.slice(last_lc + 1, last_rc);
            var data = substr.split(",");
            result.push(data);
            lc_level--;
            rc_level--;
            i = 0;
            t = t.slice(0, last_lc) + t.substring(last_rc + 1);
        }
        if (lc_level == rc_level && lc_level == 0) {
            break;
        }
    }
    return result;
}

function getContentBot(data) {

    let event_stx, event_fungible_token = null;
    data.events.forEach(item => {
        if (item.event_type == 'stx_asset') {
            event_stx = item
        }
        if (item.event_type == 'fungible_token_asset') {
            event_fungible_token = item
        }
    })

    if(event_stx && event_fungible_token) {
        let number_stx = (parseFloat(event_stx.asset.amount)/(10**6)).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
        let symbol_stx = 'STX'

        let fungible_token_contract_id = event_fungible_token.asset.asset_id.split('::')[0]

        let fungible_token_info = getContractInfo(fungible_token_contract_id)


        fungible_token_info.then((response) => {
            let number_fungible_token = (parseFloat(event_fungible_token.asset.amount)/(10**6)).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
            let symbol_fungible_token = event_fungible_token.asset.asset_id.split('::')[1].toUpperCase()
            let hash = data.tx_id.slice(0,7) + "...." +data.tx_id.slice(data.tx_id.length-4, data.tx_id.length)


            let content = `
            Bought **${number_fungible_token} ${symbol_fungible_token}** with **${number_stx} ${symbol_stx}** on Alex Swap
            \n🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢

            \n💵 14,010 ($44,972.41)\n🔗 [${hash} | Txn hash](https://explorer.hiro.so/txid/${data.tx_id}) |
            \n📊 Chart ✨ Trade
        `
            return content

        })

    }

    return null
}


module.exports = {getContractEvent, getTransactionInfo, parseTuple, getContractInfo}
