const { Context } = require("telegraf");

Context.prototype.editOrReply = function (...args) {
    if(!this.callbackQuery?.data || this.state.notEdit) return this.reply(...args);
    else return this.editMessageText(...args);
}