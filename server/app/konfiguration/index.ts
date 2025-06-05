import { MebedoWorld } from "../mebedo-world";

export const Konfiguration = MebedoWorld.createProduct({
    _id: 'konfiguration',
    title: 'Konfiguration',
    description: 'Definition aller Apps, die der Konfiguration und Schlüsseltabellen dienen',
    icon: 'fa fa-cogs',
    position: 6,
    sharedWith: [],
    sharedWithRoles: ['ADMIN']
});