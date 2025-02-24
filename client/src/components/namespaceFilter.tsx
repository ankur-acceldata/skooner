import React from 'react';
import Select, {SingleValue, ActionMeta} from 'react-select/dist/react-select.cjs';
import Base from './base';
import api from '../services/api';
import {TODO} from '../utils/types';

interface NamespaceFilterProps {
    onChange?: Function;
}

interface NamespaceFilterStates {
    namespace: {};
    namespaces?: TODO[];
    allowedNamespaces?: TODO[];
}

export default class NamespaceFilter extends Base<NamespaceFilterProps, NamespaceFilterStates> {
    private onChange: Function;

    constructor({onChange}: { onChange: Function }) {
        super({});
        const {namespace} = localStorage;
        this.state = {namespace};
        this.onChange = onChange;
        onChange(namespace);
    }

    async setNamespace(namespace: string) {
        localStorage.namespace = namespace;
        this.setState({namespace});
        this.onChange(namespace);
    }

    async getAllowedNamespaces() {
        const response = await api.getAllowedNamespaces();
        this.setState({allowedNamespaces: response || []});
        // eslint-disable-next-line prefer-destructuring
        localStorage.namespace = response[0];
        this.setState({namespace: response[0]});
    }

    componentDidMount() {
        this.getAllowedNamespaces().then(() => {
            this.registerApi({
                namespaces: api.namespace.list((namespaces: TODO[]) => this.setState({namespaces})),
            });
        });
    }

    render() {
        const {namespace = '', namespaces = [], allowedNamespaces = []} = this.state;

        const options = allowedNamespaces.length > 0 ? allowedNamespaces.map(x => ({value: x, label: x}))
            : namespaces.map(x => ({value: x.metadata.name, label: x.metadata.name}));
        // options.unshift({value: '', label: 'All Namespaces'});

        const value = options.find(x => x.value === namespace);

        return (
            <div className='select_namespace'>
                <Select
                    className="react-select"
                    classNamePrefix="react-select"
                    value={value}
                    onChange={(newValue: SingleValue<{value: string, label: string}>, actionMeta: ActionMeta<{value: string, label: string}>) => {
                        if (newValue) {
                            this.setNamespace(newValue.value);
                        }
                    }}
                    options={options}
                />
            </div>
        );
    }
}
