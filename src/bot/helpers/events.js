import mongoose from 'mongoose';
import moment from 'moment';
import Event from '../../models/event.js';
import Users from '../../models/users.js';

export const getHolidays = () => {
  return new Promise(function(resolve, reject) {
    const holidays = mongoose.connection.model('Holidays');
    holidays.find({ year: 2017 }, (err, info) => {
      if (err) { 
        reject(err.reason);
      } else {
        const workedMonths = info[0] && info[0].months;
        resolve(workedMonths);
      }
    });
  });
};

export const saveEvent = (dayoff) => {
  return new Promise(function(resolve, reject) {
    const DayOff = new Event(dayoff);
    const { _id } = DayOff;
    DayOff.save((err) => {
      if (err) {
        reject(null);
      } else {
        resolve(_id);
      }
    });			
  });
};

export const saveEventIntoUser = (userId, eventId) => {
  return new Promise(function(resolve, reject) {
    Users.update({ _id: userId }, { $addToSet: { events: eventId }} ,(err) => {
      if (err) {
        reject(err);
      } else {
        resolve('success');
      }
    });			
  }); 
};

export const getEventDate = (event) => {
  const { startsAt, endsAt } = event;
  const diff = moment(endsAt).diff(moment(startsAt), 'days');
  const dayoffs = diff > 1 ? `${moment(startsAt).format('MMMM Do YYYY')} - ${moment(endsAt).format('MMMM Do YYYY')}`
    : moment(startsAt).format('MMMM Do YYYY'); 
  return dayoffs;
};

export const cancelEvent = (eventId) => {
  return new Promise(function(resolve, reject) {
    Event.remove({ _id: eventId}, function(err){
      if (err) {
        reject(false);
      }
      resolve(true);
    });
  });
};

export const getEventsByIds = (ids, options = {}) => {
  return new Promise(function(resolve, reject) {
    const query = { _id: { $in: ids } };
    const queryWithOptions = Object.assign({}, query, options);   
    Event.find(queryWithOptions).sort('startsAt').exec(function(err, data){
      if(err) {
        reject(err);
      }
      resolve(data);
      
    });
  });
};

export const getPendingEvents = (adminId) => {
  return new Promise(function(resolve, reject) {
    const notRejected = { rejected: { $ne: `${adminId}` }};
    const notApproved = { approved: { $ne: `${adminId}` }};
    Event.find({$and: [notRejected, notApproved]})
      .sort('startsAt')
      .exec(function(err, data){
        if(err) {
          reject(err);
        }
        resolve(data);
      });
  });
};

export const getUsers = (userIds) => {
  return new Promise(function(resolve, reject) {
    const query = { _id: { $in: userIds } };
    Users.find(query)
      .select('email name _id')
      .exec(function(err, data){
        if(err) {
          reject(err);
        }
        resolve(data);
      });
  });
};

export const approveOrRejectEvent = (eventId, adminId, action) => {
  return new Promise(function(resolve, reject) {
    const query = { _id: eventId };
    const projection = { $addToSet: { [action]: adminId }};
    Event.update(query, projection)
      .exec(function(err, data){
        if (err) {
          reject(err);
        }
        resolve(data);
      });
  });
};

export const getEventsOnDate = (startDate, endDate, email, status) => {
  return new Promise(function(resolve, reject) {
    const startsAtCondition = { startsAt: { $gte: `${startDate}` } };
    const noEndDateCondition = { startsAt: { $lte: `${moment(startDate).clone().add('1', 'days')._d}`} }; 
    const endsAtCondition = { startsAt: { $lte : `${endDate}` } };
    const and = [startsAtCondition, ...[endDate ? endsAtCondition : noEndDateCondition ]];
    if (email) and.push({ user: email });
    if (status == 'approved') {
      and.push({ $and: [{$where: 'this.approved.length > 0'}, { rejected: { $size: 0 }}]});
    } 
    if (status == 'rejected') {
      and.push({ $where: 'this.rejected.length > 0'});
    }
    if (status == 'pending') {
      and.push({ $and: [{ approved: { $size: 0 }}, { rejected: { $size: 0 }}]});
    }
    const query = { $and: and };
    Event.find(query).sort('startsAt').exec(function(err, data){
      if(err) {
        reject(err);
      }
      resolve(data);
      
    });
  });
}; 
