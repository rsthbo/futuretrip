import { MebedoWorld } from "../mebedo-world";

export const Allgemein = MebedoWorld.createProduct({
    _id: 'allgemein',
    title: 'Allgemein',
    description: 'Hier werden alle allgemeinen Funktionalitäten abgelegt die sowohl für AKADEMIE und CONSULTING gültig sind.',
    icon: 'fa-fw fas fa-network-wired',
    position: 0,
    sharedWith: [],
    sharedWithRoles: ['EMPLOYEE', 'ADMIN']
});
