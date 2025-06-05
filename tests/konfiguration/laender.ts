import '/server/main';

import assert from 'assert';

import { EnumMethodResult } from '/imports/api/consts';
import { Meteor } from 'meteor/meteor';
import { DDP } from 'meteor/ddp';
import { LaenderErrorEnum } from '/server/app/konfiguration/apps/laender';
import { IGenericInsertResult } from '/imports/api/types/app-types'
import { Laendergruppen } from '/server/app/konfiguration/apps/laendergruppen';

let connection:any;

let lgInsertResult: IGenericInsertResult;
let adresseInsertResult: IGenericInsertResult;
let insertLandResult1: IGenericInsertResult;
let insertLandResult2: IGenericInsertResult;

describe('konfiguration/laender', function () {
    before(async function () {
        connection = DDP.connect(Meteor.absoluteUrl());

        await connection.call('login', {user:{username:'admin'}, password:'password'}); 
    });
    
    after(async function() {
        await connection.call('logout');
        await connection.disconnect(); 
    });

    describe('Abhängigkeit Land zu Ländern', function () {
        
        before(async function() { 
            // setup Ländergruppe
            lgInsertResult = await connection.call('__app.laendergruppen.insertDocument', {                
                title: 'Testländergruppe',
                description: 'Testbeschreibung',
            });
            assert.strictEqual(lgInsertResult.status, EnumMethodResult.STATUS_OKAY);

            // setup Land
            insertLandResult1 = await connection.call('__app.laender.insertDocument', {
                title: 'Testland',
                description: 'Testbeschreibung',
                laendergruppe: [{_id:lgInsertResult.docId as string, title:'test', description:'test'}]
            });
            assert.strictEqual(insertLandResult1.status, EnumMethodResult.STATUS_OKAY);

            // setup Adresse
            adresseInsertResult = await connection.call('__app.adressen.insertDocument', {
                title: 'testAdresse',
                description: 'Testbeschreibung',
                land: [{ _id: insertLandResult1.docId as string, title: 'Test', description: 'Test' }]
            });
            assert.strictEqual(adresseInsertResult.status, EnumMethodResult.STATUS_OKAY);
        });

        it('Hinzufügen des Landes mit entspr. Ländergruppe fügt das Land der Ländergruppe hinzu', async function () {            
            let lgAfterAddLand = await Laendergruppen.raw().findOne({ _id: lgInsertResult.docId });
            assert.strictEqual(lgAfterAddLand.laender[0]._id, insertLandResult1.docId);
        });

        it('Das erstellen eines weiteren Land fügt dieses am Ende der Ländergruppe an', async function() {
            insertLandResult2 = await connection.call('__app.laender.insertDocument', {
                title: 'Testland 2',
                description: 'Testbeschreibung',
                laendergruppe: [{_id:lgInsertResult.docId as string, title:'test', description:'test'}]
            });
            assert.strictEqual(insertLandResult2.status, EnumMethodResult.STATUS_OKAY);

            const lgAfterAddLand = await Laendergruppen.raw().findOne({ _id: lgInsertResult.docId });
            // jetzt müssen 2 Länder der Ländergruppe angehören
            assert.strictEqual(lgAfterAddLand.laender.length, 2);
            assert.strictEqual(lgAfterAddLand.laender[1]._id, insertLandResult2.docId);
        });
        
        it('Löschen des Landes scheitert, da noch in Verwendung der Adresse', async function(){
            const removeLandResult1 = await connection.call('__app.laender.removeDocument', insertLandResult1.docId );
            
            assert.strictEqual(removeLandResult1.status, EnumMethodResult.STATUS_ABORT);
            assert.strictEqual(removeLandResult1.errCode, LaenderErrorEnum.REF_EXISTS_TO_ADRESSE);
        });

        it('Löschen des Landes nimmt diese auch wieder aus der Ländergruppe raus', async function(){
            const removeLandResult2 = await connection.call('__app.laender.removeDocument', insertLandResult2.docId);
            assert.strictEqual(removeLandResult2.status, EnumMethodResult.STATUS_OKAY);
            
            let lgAfterRemoveLand2 = await Laendergruppen.raw().findOne({ _id: lgInsertResult.docId });
            // jetzt darf nur noch 1 Land der Ländergruppe angehören
            assert.strictEqual(lgAfterRemoveLand2.laender.length, 1);
        });
    });
});
