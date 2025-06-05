import { MebedoWorld } from "../mebedo-world";

export const Intern = MebedoWorld.createProduct({
    _id: 'intern',
    title: 'Intern',
    description: 'foo',
    icon: 'fa-fw fas fa-network-wired',
    position: 4,
    sharedWith: [],
    sharedWithRoles: ['EMPLOYEE', 'ADMIN']
});
