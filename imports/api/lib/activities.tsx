import { Mongo } from 'meteor/mongo';

import { ActivitySchema } from './schemas';


export const Activities = new Mongo.Collection('activities');
Activities.attachSchema(ActivitySchema);

Activities.allow ({
    insert() { return false; },
    update() { return false; },
    remove() { return false; },
});

