import { customElement, inlineView } from 'aurelia-templating';
import { bindable, BindingEngine, Disposable } from 'aurelia-framework';
import { NodeModel } from './node-model';

@customElement('model-watch')
@inlineView(`
<template>
<require from="./tree-view"></require>
<div class="model-watcher">
  <div class="container container-fluid">
    <div class="row">
      <div class="col-12 p-1">
        <div class="card">
          <div class="card-header">
            Observed items
          </div>
          <ul class="list-group list-group-flush observed-items">
            <li class="list-group-item p-1" if.bind="observedItems.length === 0">
              <p class="card-text text-center">No observers yet.</p>
            </li>
            <li class="list-group-item p-1" repeat.for="item of observedItems">
              <div class="container">
                <div class="row">
                  <div class="col-3">
                    <label class="col-form-label col-form-label-sm w-100 text-right" for.bind="item.fullName">\${item.fullName}</label>
                  </div>
                  <div class="col-7">
                    <input id.bind="item.fullName" class="form-control form-control-sm" type="text" value.bind="item.value" />
                  </div>
                  <div class="col-2">
                    <button type="button" class="close" click.delegate="unobserve(item)">&times;</button>
                    <button type="button" class="item-btn close" click.delegate="moveDown(item)">&#9660;</button>
                    <button type="button" class="item-btn close" click.delegate="moveUp(item)">&#9650;</button>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-12 p-1">
        <model-watch-tree-view nodes.bind="nodes">
          <button type="button" class="btn btn-secondary btn-sm" click.trigger="save()">save</button>
          <button type="button" class="btn btn-secondary btn-sm btn-load" click.trigger="load()">load</button>
        </model-watch-tree-view>
      </div>
    </div>
  </div>
</div>
</template>
`)
export class UxModelWatch {
  static inject = [BindingEngine];
  @bindable model: any;
  @bindable name: string;
  observedItems: Array<NodeModel> = [];
  propertiesSubscription: Array<any> = [];
  bindingEngine: BindingEngine;
  subscription: Disposable;
  nodes: Array<NodeModel>;
  [key: string]: any;
  constructor(
    bindingEngine: BindingEngine,
  ) {
    this.bindingEngine = bindingEngine;
  }

  attached() {
    this.subscription = this.bindingEngine.collectionObserver(this.observedItems).subscribe(this.observedItemsChanged.bind(this));
  }

  detached() {
    this.subscription.dispose();
    // for (const [, value] of Object.entries(this.propertiesSubscription))
    //   value.dispose();
  }

  observedItemsChanged(splices: Array<any>) {
    console.debug('observedItemsChanged', splices);
  }

  modelChanged(newValue: any) {
    this.cleanup();
    this.buildTree();
  }

  buildTree() {
    const m = this.model;
    if (m === undefined || m === null)
      return;
    const processArray = (arr: Array<any>, path: string): Array<NodeModel> => {
      const nodes = [];
      const p = path || '';
      let key = 0;
      for (let value of arr) {
        if (Array.isArray(value)) {
          nodes.push(new NodeModel(key.toString(), p, undefined, processArray(value, `${p}${key}.`), this));
        }
        else {
          const t = typeof value;
          if (t === 'object') {
            const node = new NodeModel(key.toString(), p, undefined, processObject(value, `${p}${key}.`), this);
            nodes.push(node);
          }
          else {
            nodes.push(new NodeModel(key.toString(), p, value, undefined, this));
          }
        }
        key++;
      }
      return nodes;
    };
    const processObject = (obj: any, path: string): Array<NodeModel> => {
      if (obj === undefined || obj === null)
        return [];
      if (typeof obj !== 'object')
        return obj;
      const nodes = [];
      const p = path || '';
      for (const [key, value] of Object.entries(obj)) {
        if (Array.isArray(value)) {
          nodes.push(new NodeModel(key, p, undefined, processArray(value, `${p}${key}.`), this));
        }
        else {
          const t = typeof value;
          if (t === 'object') {
            const node = new NodeModel(key, p, undefined, processObject(value, `${p}${key}.`), this);
            nodes.push(node);
          }
          else {
            nodes.push(new NodeModel(key, p, value, undefined, this));
          }
        }
      }
      return nodes;
    };
    this.nodes = processObject(m, '');
  }

  cleanup() {
    const o = this.observedItems.map(o => o);
    o.forEach(i => this.unobserve(i));
  }

  observe(item: NodeModel) {
    const findObject = (m: any, i: NodeModel) => {
      let o = m;
      if (i.path !== undefined && i.path.length) {
        for (let part of i.path.split('.'))
          if (part !== undefined && part.length)
            o = o[part];
      }
      return o;
    };
    if (this.observedItems.findIndex(oi => oi.fullName === item.fullName) === -1) {
      this.observedItems.push(item);
      const methodName = `${item.fullName}Changed`;
      this[methodName] = this.itemValueChanged.bind(this, methodName);
      const object = findObject(this.model, item);
      this.propertiesSubscription.push({
        name: methodName,
        subscription: this.bindingEngine
          .propertyObserver(object, item.name)
          .subscribe((newValue, oldValue) => {
            this[methodName](newValue, oldValue);
          })
      });
      const srcMethodName = `src${item.fullName}Changed`;
      this[srcMethodName] = this.srcItemValueChanged.bind(this, srcMethodName);
      this.propertiesSubscription.push({
        name: srcMethodName,
        subscription: this.bindingEngine
          .propertyObserver(item, 'value')
          .subscribe((newValue, oldValue) => {
            this[srcMethodName](newValue, oldValue);
          })
      });
    }
  }

  itemValueChanged(method: string, newValue: any) {
    const itemName = method.substr(0, method.length - 7);
    const item = this.observedItems.find(oi => oi.fullName === itemName);
    if (item !== undefined)
      item.value = newValue;
  }

  srcItemValueChanged(method: string, newValue: any) {
    const itemName = method.substr(3, method.length - 10);
    const item = this.observedItems.find(oi => oi.fullName === itemName);
    const findObject = (m: any, i: NodeModel): any => {
      let o = m;
      if (i.path !== undefined && i.path.length) {
        for (let part of i.path.split('.'))
          if (part !== undefined && part.length)
            o = o[part];
      }
      return o;
    };
    if (item !== undefined) {
      const object = findObject(this.model, item);
      object[item.name] = newValue;
    }
  }

  unobserve(item: NodeModel) {
    const index = this.observedItems.findIndex(oi => oi.fullName === item.fullName);
    this.observedItems.splice(index, 1);
    const methodName = `${item.fullName}Changed`;
    const srcMethodName = `src${item.fullName}Changed`;
    this.propertiesSubscription.find(ps => ps.name === methodName).subscription.dispose();
    this.propertiesSubscription.find(ps => ps.name === srcMethodName).subscription.dispose();
    delete this[methodName];
    delete this[srcMethodName];
  }

  moveUp(item: NodeModel) {
    const index = this.observedItems.findIndex(oi => oi.fullName === item.fullName);
    if (index === 0)
      return;
    this.observedItems.splice(index, 1);
    this.observedItems.splice(index - 1, 0, item);
  }

  moveDown(item: NodeModel) {
    const index = this.observedItems.findIndex(oi => oi.fullName === item.fullName);
    if (index === this.observedItems.length - 1)
      return;
    this.observedItems.splice(index, 1);
    this.observedItems.splice(index + 1, 0, item);
  }

  save() {
    const dataToSave = this.observedItems.map(oi => oi.fullName);
    const name = this.name || 'aurelia-model-watcher';
    localStorage.setItem(name, dataToSave.toString());
  }

  load() {
    this.cleanup();
    const findObject = (nodes: Array<NodeModel>, path: string) => {
      let o = nodes;
      for (let part of path.split('.')) {
        const node = o.find(oi => oi.name === part);
        if (node === undefined)
          return undefined;
        if (node.fullName === path)
          return node;
        o = node.children;
      }
      return undefined;
    };
    const name = this.name || 'aurelia-model-watcher';
    try {
      const savedData = localStorage.getItem(name) || '';
      for (let key of savedData.split(',')) {
        const item = findObject(this.nodes, key);
        if (item !== undefined)
          this.observe(item);
      }
    }
    catch (ex) {
    }
  }
}
