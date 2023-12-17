const { Telegraf } = require('telegraf')
const { Markup } = Telegraf
const fs = require("fs");
const sqlite3 = require('sqlite3').verbose();
const bot = new Telegraf('6287280856:AAFfXtuTN4QDjBWexga56TSgiDHbWdKb9fk')


if (bot === undefined) {
  throw new Error('Токена не существует!')
}
else {
  console.clear()
  console.log('token start!')
  // bot.use(Telegraf.log())
}


let db = new sqlite3.Database('./db/users.db');
db.run('CREATE TABLE users(id INT, name TEXT, level INT, attack TEXT, damage TEXT, defense TEXT)');


bot.start((ctx) => { 
  ctx.reply(`Привет ${ctx.from.first_name}! Выберите: `, {
    reply_markup: {
        inline_keyboard: [
            [ { text: "Профиль", callback_data: "profile" }],
            [ { text: "Укрепить базу", callback_data: "strengthen" }, { text: "Атаковать друга", callback_data: "attack" }  ],
            [ { text: "Сайт", url: "telegraf.js.org" } ]
        ]
    }
    
  });
  
  db.get("SELECT * FROM `users` WHERE `id`=?", [ctx.from.id],  function(err) {
    if (err) {
      db.run(`INSERT INTO users(id, name, level, attack, damage, defense) VALUES(?, ?, ?, ?, ?, ?)`, [ctx.from.id, ctx.from.first_name, 1, 'full', '0', 'full'], function() {
        // get the last insert id
        console.log(`A row has been inserted with rowid ${this.lastID}`);
      });
    }
    else {
      console.log('юзер существует')
    }
  });




  



  let line;
  fs.readFile('db/users.txt', 'utf8', (err, data) => {
    users = []
    for (i=0; i<100; i++) {
      line = data.split('\n')[i];
      users.push(line)
    }
    let check = users.filter(function(dannie) {
      return dannie == ctx.from.first_name;
    });
    if (check == '') {
      fs.appendFile("db/users.txt", ctx.from.first_name+'\n', function(error){
        if(error) throw error;
      })
    }
});
})


bot.action('profile', (ctx) => { 
   ctx.reply(
    '👤 ***Ваш профиль:***\n\n 🆙 _Уровень базы:_ 1\n\n 👊 _Нападений:_ 0\n\n ❌ _Повреждений:_ 0',
    {
      parse_mode:'MarkdownV2',
      reply_markup: {
          inline_keyboard: [
              [{ text: "Атаковать друга", callback_data: "attack" } ],
              [ { text: "Укрепить базу", callback_data: "strengthen" } ],
              [ { text: "Сайт", url: "pornhub.com" } ]
          ]
      }
    })
})   


bot.action('attack', (ctx) => { 
  ctx.reply('Введите никнейм врага: ')  //получаем тег
                                        //Ищем айди челика в БД по тегу
  let chatId = 1;                       //id чата 
  let msg = 'Вас атаковали!'            //сообщенька
  bot.telegram.sendMessage(chatId, msg) //отправляем сообщение челу на которого напали  

  bot.on('message', async(ctx) => {
      console.log(ctx.message.chat.id)
      ctx.reply(msg)
  })
})  
 


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


bot.hears('snanelx', async (ctx) => { 
  return ctx.reply(
    'Сори его нельзя трогать',
    {
      parse_mode:'MarkdownV2',
      reply_markup: {
          inline_keyboard: [
              [{ text: "Назад", callback_data: "profile" } ],
          ]
      }
    }
  )
})

bot.hears('skipli', async (ctx) => { 
  return ctx.reply(
    'Сори его нельзя трогать',
    {
      parse_mode:'MarkdownV2',
      reply_markup: {
          inline_keyboard: [
              [{ text: "Назад", callback_data: "profile" } ],
          ]
      }
    }
  )
})


bot.launch().then()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
