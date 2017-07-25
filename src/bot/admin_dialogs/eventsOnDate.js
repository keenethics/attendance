import { bot } from '../bot.js';
import { validateDate } from '../helpers/date.js';
import { getEventsOnDate, getEventDate } from '../helpers/events.js'; 
import { getMomentDDMMFormat } from '../helpers/date.js'; 
import { ofEmail } from '../dialogs/dialogExpressions.js';

bot.dialog('/eventsOnDate', [
  async function(session, args) {
    session.send('welcome to events on dialog');
    const query = args.matched.input;
    const queryString = query.split('events on').filter(d => (d))[0];
    const emailSpecified = ofEmail.test(queryString);
    let date = query.split('events on ').filter(d => (d))[0];
    let email = '';
    if (emailSpecified) {
      const dateAndEmail = queryString.split(' of '); 
      date = dateAndEmail[0];
      email = dateAndEmail[1];
    }
    const validDate = validateDate(date);
    if (!validDate) {
      session.send('incorect date...');
      session.endDialog();
    } else if (validDate == 2 || validDate == 1) {
      const [startDate, endDate] = date.split('-');
      const events = (await getEventsOnDate(getMomentDDMMFormat(startDate), getMomentDDMMFormat(endDate), email))
        .sort((a,b) =>(a > b));
      const displayEvents = events.map((ev,index) => (
        `${index} - ${getEventDate(ev)} ${ev.type} reason: ${ev.comment} user: ${ev.user}`
      ));
      displayEvents.forEach(ev => {
        session.send(ev);
      });
    } 
    session.endDialog(); 
  }
]);
