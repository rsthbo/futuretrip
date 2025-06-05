import { Accounts } from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor';
import { World } from '../../imports/api/lib/world'
import { RolesEnum } from './security';
import { IWorldUser } from '/imports/api/types/world';

export const MebedoWorld = new World({
    title: 'MyWorld',
    description: 'MyWorld-Portal für alle Mitarbeiter, Kunden, Partner sowie alle Interessierten.',
    imageUrl: '/econ.png',

    login: {
        welcome:'Herzlich Willkommen!',
        introduction: 'Sie befinden sich auf der Zugangseite unseres Portals. Hier haben Sie Zugriff als Kunden, Partner, Mitarbeiter und Seminarteilnehmer auf alle Ressourcen.',
        imageUrl: '/econ.png',
        with: {
            password: true,
            google: true,
            facebook: true
        },
        register: true,
        forgotPassword: true
    },

    register: {
        initialRoles: [ RolesEnum.EVERYBODY ]
    }
});


declare const ServiceConfiguration: any;

const settings = Meteor.settings;

// check for google-auth
if (settings && settings.auth && settings.auth.google) {
    const { web } = settings.auth.google;
    
    if (!web || !web.client_id || !web.client_secret) {
        console.log('The google auth-settings are incorrect. Please check your settings.json');
        process.exit(1);
    }

    ServiceConfiguration.configurations.upsert({ service: 'google' }, {
        $set: {
            loginStyle: "popup",
            clientId: web.client_id,
            secret: web.client_secret
        }
    });
}

Accounts.config({
    sendVerificationEmail: true, 
    forbidClientAccountCreation: true,
    
    /*restrictCreationByEmailDomain?: string | Function | undefined;
    loginExpirationInDays?: number | undefined;
    oauthSecretKey?: string | undefined;
    passwordResetTokenExpirationInDays?: number | undefined;
    passwordEnrollTokenExpirationInDays?: number | undefined;
    ambiguousErrorMessages?: boolean | undefined;
    defaultFieldSelector?: { [key: string]: 0 | 1 } | undefined;*/
    
})

Accounts.emailTemplates.siteName = 'MyWorld';
Accounts.emailTemplates.from = '';

Accounts.emailTemplates.enrollAccount.subject = (user) => {
  return `Welcome to Awesome Town, ${user.userData.firstName}`;
};

Accounts.emailTemplates.enrollAccount.text = (user, url) => {
  return 'You have been selected to participate in building a better future!'
    + ' To activate your account, simply click the link below:\n\n'
    + url;
};

Accounts.emailTemplates.resetPassword = {
    subject() {
       return "MyWorld - Passwort vergessen";
    },
    html(user, url) {
         const { gender, firstName, lastName} = (user as IWorldUser).userData as any;
         const [ host, token ] = url.split('/#/reset-password/');
 
         return `Guten Tag ${gender} ${lastName},<br>
             <p>
                 Sie haben Ihr Passwort für <strong>MyWorld</strong> vergessen - kein Problem!
             </p>
             <p>
                 Bitte betätigen Sie den nachfolgenden Link und vergeben Sie sich einfach ein neues Passwort.
                 <br>
                 <br>
                 <a href="https://gutachten.mebedo-ac.de/reset-password/${token}" target="_blank">Neues Passwort festlegen</a>
             </p>
             <p>
                 Nach erfolgreicher Änderung Ihres Passworts werden Sie umgehend angemeldet und können direkt weiterarbeiten.
             </p>
             <p>
                 Haben Sie weiterführende Fragen oder Anregungen, so wenden Sie sich bitte direkt an:
                 <br>
                 <br>MyWorld
                 <br><strong>Herrn Rene Schulte ter Hardt</strong>
                 <br>Hier bitte die Straße einfügen
                 <br>PLZ / Ort
                 <br>
                 <br>Telefon: <a href="tel:+4900000">+49(0)0000 9000-0000</a>
                 <br>E-Mail: schulteterhardt@myworld.de
             </p>
             <p>
                 Beste Grüße
                 <br>
                 <br>
                 <br><strong>Ihr MyWorld Team</strong>
             </p>
         `;
    }
};

Accounts.emailTemplates.verifyEmail = {
   subject() {
      return "MyWorld - Zugang aktivieren";
   },
   html(user, url) {
        const { gender, firstName, lastName} = (user as IWorldUser).userData as any;
        const [ host, token ] = url.split('/#/verify-email/');

        return `Guten Tag ${gender} ${lastName},<br>
            <p>
                Sie wurden soeben in unserem Portal als neuer Benutzer registriert.
            </p>
            <p>                
                Wir bitten Sie um Bestätigung dieses Benutzerzugangs indem Sie den nachfolgenden Link anwählen.
                <br>
                <a href="https://myworld/verify-email/${token}" target="_blank">Jetzt Zugang bestätigen</a>
            </p>
            <p>
                Nach erfolgreicher Bestätigung können Sie jederzeit die Anwendung über <a href="https://myworld.de">https://myworld.de</a> erreichen.
            </p>
            <p>
                <br>
                 <br>MyWorld
                 <br><strong>Herrn Rene Schulte ter Hardt</strong>
                 <br>Hier bitte die Straße einfügen
                 <br>PLZ / Ort
                 <br>
                 <br>Telefon: <a href="tel:+4900000">+49(0)0000 9000-0000</a>
                 <br>E-Mail: schulteterhardt@myworld.de
             </p>
             <p>
                 Beste Grüße
                 <br>
                 <br>
                 <br><strong>Ihr MyWorld Team</strong>
             </p>
        `;
   }
};