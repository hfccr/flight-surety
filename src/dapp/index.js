
/**
 * @author hfccr
 * */
import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App.jsx';
import provide from './contract/contractProvider';

(async () => {
  window.contractInfo = await provide('localhost');
  ReactDOM.render(<App />, document.querySelector('#dapp'));
})();