import { Meteor, Subscription } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

import './app/apm';
import './app/apm/apps/lieferant';
import './app/apm/apps/software';

// import fixtures at first
import './fixtures/accounts';

import './app/mebedo-world';

import './app/konfiguration';
import './app/konfiguration/apps/mandanten';
import './app/konfiguration/apps/preislisten';
import './app/konfiguration/apps/artikel';
import './app/konfiguration/apps/laender';
import './app/konfiguration/apps/laendergruppen';

import './app/fibu';
import './app/fibu/apps/kontierungen';
import './app/fibu/apps/kontiergruppen';
import './app/fibu/apps/fibustati';

import './app/akademie/';
import './app/akademie/apps/seminarmodule';
import './app/akademie/apps/seminare';
import './app/akademie/apps/seminarteilnehmer';
import './app/akademie/apps/dozenten';

import './app/consulting/';
import './app/consulting/apps/projekte';
import './app/consulting/apps/teilprojekte';
import './app/consulting/apps/aktivitaeten';

import './app/allgemein';
import './app/allgemein/apps/adressen';
import './app/allgemein/apps/kontakte';

import './app/intern';
import './app/intern/apps/urlaubskonto';
import './app/intern/apps/urlaubsanspruch';

// ganz am Ende importieren wir die Reports
import './app/allgemein/reports';
import './app/akademie/reports';
import './app/consulting/reports/projekte-by-user.card';
import { Accounts } from 'meteor/accounts-base';
import { IWorldUser } from '/imports/api/types/world';


Meteor.publish('currentUser', function publishCurrentUser(this:Subscription): Mongo.Cursor<Meteor.User, Meteor.User> | null {
    if (!this.userId) {
        this.ready();
        return null;  
    }

    // extra publish with the field of userdata: { ... }
    // by default meteor only publishs id and username
    return Meteor.users.find({ _id: this.userId });
});


Accounts.validateLoginAttempt( (loginData: any) => {
    const { type, allowed, methodName } = loginData;

    //console.log(JSON.stringify(loginData,null,4));

    if (methodName == 'verifyEmail' || methodName == 'resetPassword') {
        return allowed;
    }

    if (type == 'google' && methodName == 'login') {
        const { user } = loginData;

        const lUser = Meteor.users.findOne({_id: user._id }) as IWorldUser;
        if (!lUser) return false;

        if (!lUser.userData) {
            Meteor.users.update({_id: user._id }, {
                $set: { 
                    userData: {
                        firstName: user.services.google.given_name,
                        lastName: user.services.google.family_name,
                        roles: ['EVERYBODY']
                    }
                }
            });
        }

        return allowed;
    }
    if (methodName == 'login') {
        if (loginData.methodArguments[0].resume && allowed) return true;

        const { user } = loginData.methodArguments[0];
        
        if (!user)
            return false;
            
        // check if we got a user like "admin" that signed in without email
        if (user.username && !user.email && allowed) {
            return true;
        }

        const verifiedUser = Meteor.users.findOne({
            'emails.address': user.email,
            'emails.verified': true
        });

        if (!verifiedUser) {
            Meteor.users.update(user._id, {
                $set: { 'userData.accountVerified' : false }
            });
        }
        return allowed; //!!verifiedUser;
    }

    throw new Meteor.Error('Unknown Loginattempt rejected.');
});