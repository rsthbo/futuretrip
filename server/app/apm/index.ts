import { MebedoWorld } from "../mebedo-world";

export const Apm = MebedoWorld.createProduct({
    _id: 'apm',
    title: 'APM',
    description: 'Application Portfolio Management',
    icon: 'fa-fw fas fa-archive',
    position: 0,
    sharedWith: [],
    sharedWithRoles: ['ADMIN']
});

