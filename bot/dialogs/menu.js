import { bot } from '../bot.js'
import builder from 'botbuilder';
import moment from 'moment';

const confirm = false;

bot.dialog('/', new builder.IntentDialog()
    .onDefault('/getstarted')

  );
bot.dialog('/menu', new builder.IntentDialog()

    .matches(/^help/i,builder.DialogAction.send("You can : 1. day off  2.createAlarm  3.editprofile") )
    .matches(/^day off/i, '/dayoff')
    .matches(/^createAlarm/i, '/createAlarm')
    .matches(/^ensureProfile/i, '/ensureProfile')
    .onDefault(builder.DialogAction.send("You can : 1. day off  2.createAlarm  3.editprofile"))

);
bot.dialog('/getstarted',[

function (session, args, next , results) {
    if (confirm == false) {
    session.beginDialog('/ensureProfile', session.userData.profile);
    
    } else {
        next();

    }
},
function (session, results) {
  session.beginDialog('/menu', session.userData.profile);
  session.send("You can : 1. чday off  2. createAlarm  3. editprofile  4. help");
}
]);