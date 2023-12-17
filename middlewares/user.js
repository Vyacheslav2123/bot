module.exports = db => async (ctx, next) => {
    let row = await db.get("SELECT * FROM users WHERE uid = ?", [ctx.from.id]); 
    if (!row) {
        await db.run(`INSERT INTO users(uid, name, level, attack, hp, defenseLevel) VALUES (?, ?, ?, ?, ?, ?)`, [ctx.from.id, ctx.from.username, 1, 0, 100, 1]);
        row = { uid: ctx.from.id, name: ctx.from.username, level: 1, attack: 0, damage: 100, defense: 1 };
        console.log(`юзер добавлен`);
    }
    else {
      console.log('юзер существует')
    }
    ctx.state.user = row;
    next();
}