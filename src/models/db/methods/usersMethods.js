import mongoose from 'mongoose';
import _ from 'underscore';

let usersDB = mongoose.connection.model('Users');
let holidaysDB = mongoose.connection.model('Holidays');
let holidays = null;
holidaysDB.find((err, data) => {
	if (err) {
		console.log(err);
	} else {
		holidays = data;
	}
});

function getInfoByUsername(username, callback) {
	usersDB.findOne({name: username}, (err, user) => {
		var answer;
		if (err) {
			answer = 'Sorry, something go wrong. :(';
			console.log(err);
		} else if (user) {
			answer = 'Name: ' + user.name + '\n\n';
			answer += 'Email: ' + user.email + '\n\n';
			answer += 'Role: ' + user.role + '\n\n';
			answer += 'sickLeaveLeft: ' + user.sickLeaveLeft + '\n\n';
			answer += 'sickLeaveHalfLeft: ' + user.sickLeaveHalfLeft + '\n\n';
			var vacationDays = 0;
			var workedMonths = null;
			user.workingInfo.forEach((year) => {
				holidays.forEach((yearHolidays) => {
					if (_.isMatch(yearHolidays, {year: year.year})) {
						workedMonths = yearHolidays.months;
					}
				});
				year.months.forEach((month, index) => {
					vacationDays += (20 / 12) * (month.actuallyWorkedDays / workedMonths[index].totalWorkingDays);
				});
			});
			vacationDays -= user.usedVacations;
			answer += 'Vacation days available: ' + parseInt(vacationDays);
		} else {
			answer = 'User is not found.';
		}
		callback(answer);
	});
}


function getRoleByUsername(username, callback) {
	usersDB.findOne({name: username}, (err, user) => {
		if (err) {
			console.log(err);
		}
		if (user) {
			callback(user.role);
		} else {
			callback('user');
		}
	});
}


function setSessionAddressForUser(username, address) {
	usersDB.update({name: username}, {$set: {sessionAddress: address}}, (err) => {
		if(err) {
			return console.log(err);
		}
	});
}

function getSessionAddressForUser(username, callback) {
	usersDB.findOne({name: username}, (err, user) => {
		if (err) {
			return console.log(err);
		}
		if (user) {
			callback(user.sessionAddress);
		}
	});
}

module.exports = {
	getInfoByUsername: getInfoByUsername,
	getRoleByUsername: getRoleByUsername,
	setSessionAddressForUser: setSessionAddressForUser,
	getSessionAddressForUser: getSessionAddressForUser
};
