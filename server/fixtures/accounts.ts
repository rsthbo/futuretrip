import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';


// Setup Admin user if not exists
const USERNAME = 'admin';
const PASSWORD = 'password';

if (!Accounts.findUserByUsername(USERNAME)) {
    Accounts.createUser({
        username: USERNAME,
        password: PASSWORD,
    });
}
let newUser = Accounts.findUserByUsername(USERNAME);
if (newUser){
    Meteor.users.update( {_id: newUser._id}, {
        $set: {
            userData: {
                firstName: 'IT',
                lastName: 'Administrator',
                roles: ['EVERYBODY', 'ADMIN', 'EMPLOYEE', 'APPDESIGN']
            }
        }
    });
}


if (!Accounts.findUserByUsername('jeder')) {
    Accounts.createUser({
        username: 'jeder',
        password: PASSWORD, 
    });
}
newUser = Accounts.findUserByUsername('jeder');
if (newUser){
    Meteor.users.update( {_id: newUser._id}, {
        $set: {
            userData: {
                firstName: 'Hans',
                lastName: 'Jedermann',
                roles: ['EVERYBODY']
            }
        }
    });
}


if (!Accounts.findUserByUsername('kunde')) {
    Accounts.createUser({
        username: 'kunde',
        password: PASSWORD,
    });
}
newUser = Accounts.findUserByUsername('kunde');
if (newUser){
    Meteor.users.update( {_id: newUser._id}, {
        $set: {
            userData: {
                firstName: 'Michael',
                lastName: 'Kundenmüller',
                roles: ['EVERYBODY', 'EXTERN']
            }
        }
    });
}