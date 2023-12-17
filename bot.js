require("./utils/editOrReply");
const { Telegraf, Markup } = require('telegraf');
const chunk = require("chunk");
const fs = require("fs");
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const userMiddleware = require("./middlewares/user");
const bot = new Telegraf('6287280856:AAFfXtuTN4QDjBWexga56TSgiDHbWdKb9fk')
let attackTimer = {};

if (bot === undefined) {
  throw new Error('Токена не существует!')
}
else {
  console.clear()
  console.log('token start!')
  // bot.use(Telegraf.log())
}


(async () => {
  // open the database
  const db = await open({
    filename: './db/users.db',
    driver: sqlite3.Database
  });
  await db.run('CREATE TABLE users(uid BIGINT(20), name TEXT, level INT, attack INT, hp INT, defenseLevel INT)').catch(e => {});

bot.use(userMiddleware(db));
bot.use((ctx, next) => {
  next();
  return 1;
})

bot.start(async (ctx) => { 
  ctx.reply(`Привет ${ctx.from.first_name}! Выберите: `, {
    reply_markup: {
        inline_keyboard: [
            [ { text: "Профиль", callback_data: "profile" }],
            [ { text: "Укрепить базу", callback_data: "strengthen" }, { text: "Атаковать друга", callback_data: "attack" }  ],
            [ { text: "Сайт", url: "telegraf.js.org" } ]
        ]
    }
    
  });
})


bot.action('profile', (ctx) => { 

   ctx.editOrReply(
    `
👤 ***Ваш профиль:***

🆙 _Уровень базы:_ ${ctx.state.user.level}
👊 _Нападений:_ ${ctx.state.user.attack}

🛡️ _Защита:_ ${ctx.state.user.defenseLevel}
❤️ _HP:_ ${ctx.state.user.hp}/${ctx.state.user.defenseLevel * 100}`.trim(),
    {
      parse_mode:'MarkdownV2',
      reply_markup: {
          inline_keyboard: [
              [{ text: "Атаковать друга", callback_data: "attack" } ],
              [ { text: "Укрепить базу", callback_data: "strengthen" } ],
              [ { text: "Сайт", url: "pornhub.com" } ]
          ]
      }
    }).catch(e => console.log(e))
})   



bot.action('attack', async (ctx) => { 

  let users = await db.all('SELECT uid, name FROM users WHERE uid != ? AND hp > 0', [ctx.from.id]);

  let buttons = chunk(users.map(user => ({ text: user.name, callback_data: "attack_" + user.uid })), 2);

  let text = buttons.length > 0 ? 'Выберите никнейм врага:' : 'Атаковать некого';

  ctx.reply(text,
  {
    parse_mode:'MarkdownV2',
    reply_markup: {
        inline_keyboard: buttons
    }
  })  
});

bot.action(/^attack_(\d+)$/, async ctx => {
  if(attackTimer[ctx.from.id] > Date.now()) return ctx.reply("Подождите 10 секунд!").catch(e => {});
  let user = await db.get('SELECT * FROM users WHERE uid = ?', ctx.match[1]);
  db.run(`UPDATE users SET hp = ${Math.max(user.hp - ctx.state.user.level * 10, 0)} WHERE uid = ?`, user.uid);
  if(!user) return;
  attackTimer[ctx.from.id] = Date.now() + 10000;
  ctx.telegram.sendMessage(user.uid, `Вас атаковал @${ctx.from.username}`).catch(e => {});
  ctx.reply(`Вы атаковали @${user.name}`);
});

bot.action('strengthen', (ctx) => { 
  ctx.reply(
   '***Скоро будет***',
   {
     parse_mode:'MarkdownV2',
     reply_markup: {
         inline_keyboard: [
             [{ text: "Атаковать друга", callback_data: "attack" } ],
             [{ text: "Назад", callback_data: "profile" } ]
         ]
     }
   })
}) 

bot.on('message', ctx => {
  ctx.reply("Я вас не понял!").catch(e => {});
});

bot.launch();

})();

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))