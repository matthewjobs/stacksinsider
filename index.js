const {getContractEvent, getTransactionInfo, getContractInfo} = require('./service')

const TelegramBot = require('node-telegram-bot-api');

// replace the value below with the Telegram token you receive from @BotFather
const token = '7008169812:AAHLBWZONrdZAd2dTxYGqr-a-IzChtyWPsU';

const channelId = '-1002106029502'

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

bot.onText(/\/getChannelId/, (msg, match) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, `Channel ID: ${chatId}`);
});

// Listen for any kind of message. There are different kinds of
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    let contractEv = getContractEvent()

    contractEv.then((response) => {
        let formatData = response.data;
        let new_arr_txid = []

        new_arr_txid = formatData.results.map((item, index) => {
            return item.tx_id
        })

        const distinct_arr = new_arr_txid.filter((value, index, self) => {
            return self.indexOf(value) === index;
        });


        distinct_arr.forEach((item_tx, index) => {
            setTimeout(() => {
                let transInfo = getTransactionInfo(item_tx)

                transInfo.then((response) => {
                    let formatData = response.data;
                    let contract_call = formatData.contract_call?.function_name
                    if (contract_call && ((contract_call == "swap-helper") || (contract_call == "swap-helper-a"))) {
                        // console.log("Index: ", index, " Tx: ", item_tx, " - ", formatData.event_count, "Contract call : ", formatData.contract_call?.function_name)

                        let data = formatData;

                        let event_stx, event_fungible_token = null;
                        data.events.forEach(item => {
                            if (item.event_type == 'stx_asset') {
                                event_stx = item
                            }
                            if (item.event_type == 'fungible_token_asset') {
                                event_fungible_token = item
                            }
                        })

                        if (event_stx && event_fungible_token) {
                            let number_stx = (parseFloat(event_stx.asset.amount) / (10 ** 6)).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
                            let symbol_stx = 'STX'

                            let fungible_token_contract_id = event_fungible_token.asset.asset_id.split('::')[0]
                            let fungible_token_info = getContractInfo(fungible_token_contract_id)

                            fungible_token_info.then((responseFungible) => {

                                console.log('---------------------------------------------------------------------------------------------------------------------------------------')
                                console.log(event_fungible_token.asset.asset_id)
                                // console.log(responseFungible)

                                let number_fungible_token = (parseFloat(event_fungible_token.asset.amount) / (10 ** 6)).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
                                let symbol_fungible_token = event_fungible_token.asset.asset_id.split('::')[1].toUpperCase()
                                let hash = data.tx_id.slice(0, 7) + "...." + data.tx_id.slice(data.tx_id.length - 4, data.tx_id.length)


                                let content = `
                                            Bought **${number_fungible_token} ${symbol_fungible_token}** with **${number_stx} ${symbol_stx}** on Alex Swap
                                            \n🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢

                                            \n💵 14,010 ($44,972.41)\n🔗 [${hash} | Txn hash](https://explorer.hiro.so/txid/${data.tx_id}) |
                                            \n📊 Chart ✨ Trade
                                    `
                                bot.sendMessage(chatId, content, {parse_mode: 'markdown'});

                            })

                        }


                    }
                })
            }, index * 500); // delay the request by 1000 milliseconds for each index of the array

        })

    })

});

// gửi vào channel theo interval
// setInterval(function () {
//     bot.sendMessage(channelId, `hehe`);
// }, 5000);
