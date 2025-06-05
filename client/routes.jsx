import React from 'react';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { mount } from 'react-mounter';

import { App } from '/imports/ui/App';


import { HomePage } from '../imports/ui/pages/home';
//import { NotFoundPage } from '/imports/ui/pages/not-found';
import { AppDashboardPage } from '../imports/ui/pages/app-dashboard';
import { ReportPage } from '../imports/ui/pages/report-page';
import { RegisterPage } from '/imports/ui/pages/register';
import { VerifyAccount } from '/imports/ui/pages/verify-account';
import { ForgotPassword } from '/imports/ui/pages/forgot-password';
import { NotFoundPage } from '/imports/ui/pages/not-found';
import { UserProfilePage } from '/imports/ui/pages/user-profile';
import { RecordPage } from '/imports/ui/pages/record';

//import { InfoForm } from '../imports/ui/Info';

//import { AppState } from '../imports/client/AppState';
//import { VerifyEMail } from '../imports/ui/components/VerifyEMail';
//import { UserProfileForm } from '../imports/ui/components/user-profile-form';

// https://github.com/kadirahq/flow-router/issues/318
// Prevent routing when there are unsaved changes
// ----------------------------------------------

// This function will be called on every route change.
// Return true to 'prevent' the route from changing.
function preventRouteChange (targetContext) {
    /*if (AppState.selectedDetail && AppState.selectedDetail.isDirty()) {
      if (!window.confirm('Achtung! Sie befinden sich aktuell in der Bearbeitung eines Details.\n\nMöchten Sie Ihre Änderungen verwerfen?')) {
        return true;
      }
      AppState.selectedDetail.discardChanges();
    }*/
    //if (AppState.selectedDetail) AppState.selectedDetail.discardChanges();
    return false;
}
  
  // Workaround FlowRouter to provide the ability to prevent route changes
  var previousPath,
    isReverting,
    routeCounter = 0,
    routeCountOnPopState;
  
  window.onpopstate = function () {
    // For detecting whether the user pressed back/forward button.
    routeCountOnPopState = routeCounter;
  };
  
  FlowRouter.triggers.exit([function (context, redirect, stop) {
    // Before we leave the route, cache the current path.
    previousPath = context.path;
  }]);
  
  FlowRouter.triggers.enter([function (context, redirect, stop) {
    routeCounter++;
  
    if (isReverting) {
      isReverting = false;
      // This time, we are simply 'undoing' the previous (prevented) route change.
      // So we don't want to actually fire any route actions.
      stop();
    }
    else if (preventRouteChange(context)) {
      // This route change is not allowed at the present time.
  
      // Prevent the route from firing.
      stop();
  
      isReverting = true;
  
      if (routeCountOnPopState == routeCounter - 1) {
        // This route change was due to browser history - e.g. back/forward button was clicked.
        // We want to undo this route change without overwriting the current history entry.
        // We can't use redirect() because it would overwrite the history entry we are trying
        // to preserve.
  
        // setTimeout allows FlowRouter to finish handling the current route change.
        // Without it, calling FlowRouter.go() at this stage would cause problems (we would
        // ultimately end up at the wrong URL, i.e. that of the current context).
        setTimeout(function () {
            FlowRouter.go(previousPath);
        });
      }
      else {
          // This is a regular route change, e.g. user clicked a navigation control.
          // setTimeout for the same reasons as above.
          setTimeout(function () {
              // Since we know the user didn't navigate using browser history, we can safely use
              // history.back(), keeping the browser history clean.
              history.back();
          });
      }
    }
  }]);


FlowRouter.route('/verify-account/:token', {
    name: 'verifyAccount',
    action({ token }) {
        mount(App, {
            content: VerifyAccount,
            token,
            authenticatedRoute: false
        });
    },
});

FlowRouter.route('/reset-password/:token', {
    name: 'resetPassword',
    action({ token }) {
        mount(App, {
            //content: ResetPassword,
            token,
            authenticatedRoute: false
        });
    },
});

FlowRouter.route('/forgot-password', {
    name: 'forgotpassword',
    action() {
        mount(App, {
            content: ForgotPassword,
            authenticatedRoute: false
        });
    },
});

FlowRouter.route('/register', {
    name: 'register',
    action() {
        mount(App, {
            content: RegisterPage,
            authenticatedRoute: false
        });
    },
});

FlowRouter.route('/', {
    name: 'root',
    action() {
        mount(App, {
            content: HomePage,
            authenticatedRoute: true
        });
    },
});

FlowRouter.route('/user/profile/:userId', {
    name: 'user-profile',
    action(params, queryParams) {
        mount(App, {
            content: UserProfilePage,
            authenticatedRoute: true,
            params,
            queryParams
        });
    },
});

/*
FlowRouter.route('/info', {
    name: 'info.show',
    action() {
        mount(App, {
            content: InfoForm,
            activeMenuKey: 'INFO',
            authenticatedRoute: true
        });
    },
});
*/
FlowRouter.route('/:productId/:appId/dashboard', {
    name: 'dashboard',
    action(params, queryParams) {
        mount(App, {
            content: AppDashboardPage,
            authenticatedRoute: true,
            params,
            queryParams
        });
    },
});

FlowRouter.route('/:productId/:appId/new', {
    name: 'create-app-record',
    action(params, queryParams) {
        mount(App, {
            content: RecordPage,
            key: 'NEW',
            authenticatedRoute: true,
            params,
            queryParams,
            mode: 'NEW',
            showActivities: true
        });
    },
});


FlowRouter.route('/:productId/:appId/:docId', {
    name: 'show-app-record',
    action(params, queryParams) {
        mount(App, {
            content: RecordPage,
            key: params.docId,
            authenticatedRoute: true,
            params,
            queryParams,
            mode: 'SHOW',
            showActivities: true
        });
    },
});

FlowRouter.route('/reports/:reportId', {
    name: 'show-report',
    action(params, queryParams) {
        mount(App, {
            content: ReportPage,
            authenticatedRoute: true,
            params,
            queryParams,
            mode: 'SHOW',
            showActivities: false
        });
    },
});


FlowRouter.notFound = {
    action: function() {
        mount(App, {
            content: NotFoundPage,
            routeStatus: '404',
            authenticatedRoute: false,
            showActivities: false
        });
    }
};