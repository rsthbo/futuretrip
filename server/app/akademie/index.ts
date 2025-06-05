import { MebedoWorld } from "../mebedo-world";

export const Akademie = MebedoWorld.createProduct({
    _id: 'akademie',
    title: 'Akademie',
    description: 'foo',
    icon: 'fa-fw fas fa-chalkboard-teacher',
    position: 2,
    sharedWith: [],
    sharedWithRoles: ['EVERYBODY']
});
