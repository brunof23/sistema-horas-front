import React, { Component } from 'react';

import Header from './components/Header';

import CertificadoBox from './components/Certificado';

class App extends Component {
  render() {
    return (
      <div className="container">
        <Header title="Meus Certificados" />
        <br />
        <CertificadoBox />
      </div>
    );
  }
}

export default App;
