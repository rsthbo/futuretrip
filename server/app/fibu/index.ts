import { MebedoWorld } from "../mebedo-world";

export const Fibu = MebedoWorld.createProduct({
    _id: 'fibu',
    title: 'Rechnungswesen',
    description: 'Definition aller relevanten Apps für das Rechnungswesen.',
    icon: 'fa fa-calculator',
    position: 6,
    sharedWith: [],
    sharedWithRoles: ['ADMIN']
});