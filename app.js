const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');

const tocen = '6246698710:AAHjcWCzVDYJEhlhOUeR7nYlenj4OSSUzn0';

const idChat = 535124715;

let bot = new TelegramBot(tocen, {polling: true})

const api = 'https://pro.openweathermap.org/data/2.5/forecast?q=Khmelnytskyi&lang=ua&appid=b1b15e88fa797225412429c1c50c122a1';

bot.setMyCommands([
    {command: '/start', description: 'Вибери з чим хочите працювати'},
])

let sort = 1;

let startMessg = {
    reply_markup: {
        resize_keyboard: true,
        keyboard: [
            [
                {text: '/Погода'},
            ],
        ]}
}

bot.on('message', async (msg) => {
    if(msg.text === '/start') {
        await bot.sendMessage(msg.chat.id, 'Вибери з чим хочите працювати', startMessg)

    } else if (msg.text === '/Погода') {
        await bot.sendMessage(msg.chat.id, 'Вибери час', {
            reply_markup: {
                resize_keyboard: true,
                keyboard: [
                    [
                        {text: 'Кожні 3 години'},
                        {text: 'Кожні 6 години'},
                    ],
                    [
                        {text: 'Повернутися до меню'},
                    ],
                ]
            }
        })
    } else if(msg.text === 'Кожні 3 години') {
        sort = 1;
        sendWeather();
    } else if (msg.text === 'Кожні 6 години') {
        sort = 2;
        sendWeather();
    } else if (msg.text === 'Повернутися до меню') {
        await bot.sendMessage(msg.chat.id, 'Вибери з чим хочите працювати', startMessg)
    }
})


function sendWeather() {
    axios.get(api)
.then(respons => {
    dataProcessing(respons.data);
})

function dataProcessing(data) {
    
    let structureMessage = '';
    let weather = '';

    
    let dateSettings = { weekday:"long", year:"numeric", month:"short", day:"numeric", time:'numeric'}
    
    for(let i=0; i<data.list.length; i+=sort) {
        if(i >= 5) {
            break
        }

        let time = data.list[i].dt_txt.split(' ')[1].substr(0, 5);
        let date = new Date(data.list[i].dt_txt).toLocaleDateString('uk', dateSettings);
        let temp = Math.round(data.list[i].main.temp);
        let feelsLike = Math.round(data.list[i].main.feels_like);
        let description = data.list[i].weather[0].description;


        if(temp <= 273 || feelsLike <= 273) {
            temp = `${temp - 273}°C`;
            feelsLike = `${feelsLike - 273}°C`;
        } else {
            temp = `+${temp - 273}°C`;
            feelsLike = `+${feelsLike - 273}°C`;
        }

        weather += `
${date}
 ${time}, ${temp}, Відчувається: ${feelsLike}, ${description}\n`;
    }
    

    structureMessage = `Погода в Хмельницькому: \n${weather}`;

    bot.sendMessage(idChat, structureMessage);
}

}


