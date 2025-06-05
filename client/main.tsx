import React from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';
import { App } from '/imports/ui/App'

import './routes';
import './css/summernote-lite.min.css';

Meteor.startup(() => {
  render(<App />, document.getElementById('react-root'));
});
