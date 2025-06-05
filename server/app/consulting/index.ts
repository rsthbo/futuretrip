import { MebedoWorld } from "../mebedo-world";

export const Consulting = MebedoWorld.createProduct({
    _id: 'consulting',
    title: 'Consulting',
    description: 'foo bar',
    icon: 'fa fa-user',
    position: 1,
    sharedWith: [],
    sharedWithRoles: ['EVERYBODY']
});