import { Meteor } from 'meteor/meteor';
import { FilesCollection } from 'meteor/ostrio:files';

let Config = {
    collectionName: 'avatars',
    downloadRoute: '/files',
    allowClientCode: true,
    onBeforeUpload(file) {
        // Allow upload files under 10MB, and only in png/jpg/jpeg formats
        if (file.size <= 10485760 && /png|jpg|jpeg/i.test(file.extension)) {
            return true;
        }
        return 'Please upload image, with size equal or less than 10MB';
    },
    protected(fileObj) {
        // protect access to the file
        // only autth users that has shared the opinion can
        // access the image-file
        if (!this.userId) return false;

        return true;
    }
};

if (Meteor.isServer) {
    const MGP_SETTINGS = process.env.MGP_SETTINGS || JSON.stringify({ settings: { AvatarsPath: '~/temp/data' }});
    const settings = JSON.parse(MGP_SETTINGS);
    Config.storagePath = settings.AvatarsPath;
}

export const Avatars = new FilesCollection(Config);