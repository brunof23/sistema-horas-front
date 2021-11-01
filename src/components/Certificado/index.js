import React, { Component } from 'react';
import PubSub from 'pubsub-js';

import { 
    Table, 
    Button,
    Form,
    FormGroup,
    Label,
    Input,
    Alert
} from 'reactstrap';

var i = 1;

class FormCertificado extends Component {
    
    

    state = { 
        model: {

            id: 0,
            nome: '',
            tipo: '', 
            horas: 0,
            status: '', 
            anexo: '' 
        
        } 
    };

    setValues = (e, field) => {
        const { model } = this.state;
        model[field] = e.target.value;
        this.setState({ model });
    }

    create = () => {
        this.setState({ model: { id: 0, nome: '', tipo: '', horas: 0, status:'', anexo:'' } })
        this.props.certificadoCreate(this.state.model);
    }

    componentWillMount() {
        PubSub.subscribe('edit-certificado', (topic, certificado) => {
            this.setState({ model: certificado });
        });
    }

    render() {
        return (
            <Form>
                <FormGroup>
                    <Label for="nome">Nome:</Label>
                    <Input id="nome" type="text" value={this.state.model.nome} placeholder="Nome do Certificado"
                    onChange={e => this.setValues(e, 'nome') } />
                </FormGroup>
                <FormGroup>
                    <div classnome="form-row">
                        <div classnome="col-md-6">
                            <Label for="tipo">Tipo:</Label>
                            <Input id="tipo" type="text"  value={this.state.model.tipo} placeholder="Tipo" 
                            onChange={e => this.setValues(e, 'tipo') } />
                        </div>
                        <div classnome="col-md-6">
                            <Label for="horas">Carga Horária:</Label>
                            <Input id="horas" type="text" value={this.state.model.horas} placeholder="Horas" 
                            onChange={e => this.setValues(e, 'horas') } />
                        </div>
                        <div classnome="col-md-6">
                            <Label for="anexo">Anexo:</Label>
                            <Input id="anexo" type="text" value={this.state.model.anexo} placeholder="Escolha o documento" 
                            onChange={e => this.setValues(e, 'anexo') } />
                            <Button color="primary" block onClick> Anexar</Button>
                        </div>
                        {/* <div classnome="col-md-6">
                            <Label for="status">Status:</Label>
                            <Input id="status" type="text" value={this.state.model.status} placeholder="Status" 
                            onChange={e => this.setValues(e, 'status') } />
                        </div> */}
                    </div>
                    <p></p>
                </FormGroup>
                <Button color="primary" block onClick={this.create}> Enviar </Button>
                    <p></p>
            </Form>
        );
    }
}

class ListCertificado extends Component {

    delete = (id) => {
        this.props.deleteCertificado(id);
    }

    onEdit = (certificado) => {
        PubSub.publish('edit-certificado', certificado);
    }

    render() {
        const { certificados } = this.props;
        return (
            <Table classnome="table-bordered text-center">
                <thead classnome="thead-dark">
                    <tr>
                        <th>Nome</th>
                        <th>Tipo</th>
                        <th>Horas</th>
                        <th>Status</th>
                        <th>Anexo</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        certificados.map(certificado => (
                            <tr key={certificado.id}>
                                <td>{certificado.nome}</td>
                                <td>{certificado.tipo}</td>
                                <td>{certificado.horas}</td>
                                <td>Pendente</td>
                                <td><a type='' rel='' href=''>{certificado.nome}</a></td>
                                {/* <td>
                                    <Button color="info" size="sm" onClick={e => this.onEdit(certificado)}>Editar</Button>
                                    <Button color="danger" size="sm" onClick={e => this.delete(certificado.id)}>Deletar</Button>
                                </td> */}
                            </tr>
                        ))
                    }
                </tbody>
            </Table>
        );
    }   
}

export default class CertificadoBox extends Component {

    Url = 'http://localhost:4000/certificado';

    state = {
        certificados: [],
        message: {
            text: '',
            alert: ''
        }
    }

    componentDidMount() {
        fetch(this.Url)
            .then(response => response.json())
            .then(certificados => this.setState({ certificados }))
            .catch(e => console.log(e));
    }

    save = (certificado) => {
        let data = {
            id: certificado.id,
            nome: certificado.nome,
            tipo: certificado.tipo,
            horas: parseInt(certificado.horas),
            status: parseInt(certificado.status),
            anexo:certificado.anexo,
        };
        console.log(data);

        const requestInfo = {
            method: data.id !== 0? 'PUT': 'POST',
            body: JSON.stringify(data),
            headers: new Headers({
                'Content-type': 'application/json'
            })
        };

        if(data.id === 0) {
            // CREATE NEW Certificado
            fetch(this.Url, requestInfo)
            .then(response => response.json())
            .then(newCertificado => {
                let { certificados } = this.state;
                certificados.push(newCertificado);
                this.setState({ certificados, message: { text: 'Novo certificado adicionado com sucesso!', alert: 'success' } });
                this.timerMessage(3000);
            })
            .catch(e => console.log(e)); 
        } else {
            // EDIT Certificado
            fetch(`${this.Url}/${data.id}`, requestInfo)
            .then(response => response.json())
            .then(updatedCertificado => {
                let { certificados } = this.state;
                let position = certificados.findIndex(certificado => certificado.id === data.id);
                certificados[position] = updatedCertificado;
                this.setState({ certificados, message: { text: 'Certificado atualizado com sucesso!', alert: 'info' } });
                this.timerMessage(3000);
            })
            .catch(e => console.log(e)); 
        }
    }

    delete = (id) => {
        fetch(`${this.Url}/${id}`, {method: 'DELETE'})
            .then(response => response.json())
            .then(rows => {
                const certificados = this.state.certificados.filter(certificado => certificado.id !== id);
                this.setState({ certificados,  message: { text: 'Certificado deletado com sucesso.', alert: 'danger' } });
                this.timerMessage(3000);
            })
            .catch(e => console.log(e));
    }

    timerMessage = (duration) => {
        setTimeout(() => {
            this.setState({ message: { text: '', alert: ''} });
        }, duration);
    }

    render() {
        return (
            <div>
                {
                    this.state.message.text !== ''? (
                        <Alert color={this.state.message.alert} classnome="text-center"> {this.state.message.text} </Alert>
                    ) : ''
                }

                <div classnome="row">
    
                    <div classnome="col-md-6 my-3">
                        <h2 classnome="font-weight-bold text-center"> Cadastro de Certificados </h2>
                        <FormCertificado certificadoCreate={this.save} />
                    </div>
                    <div classnome="col-md-6 my-3">
                        <h2 classnome="font-weight-bold text-center"> Lista de Certificados </h2>
                        <ListCertificado certificados={this.state.certificados}  deleteCertificado={this.delete} />
                    </div>
                    {/* <div classnome="col-md-6 my-3">
                        <h2 classnome="font-weight-bold text-center"> Total de Horas </h2>
                        <p>{this.state.certificados.filter(certificado => certificado.horas + certificado.horas)}</p>
                    </div> */}
                </div>
            </div>
        );
    }
}