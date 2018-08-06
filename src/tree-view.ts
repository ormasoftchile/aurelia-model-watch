import { bindable, containerless } from 'aurelia-framework';
import { NodeModel } from './node-model';
import { customElement, inlineView } from 'aurelia-templating';

@containerless()
@customElement('model-watch-tree-view')
@inlineView(`
<template>
  <require from='./tree-node'></require>
  <div class="card">
    <div class="card-header">
      <button type="button" class="btn btn-secondary btn-sm" click.trigger="showAll()">show all</button>
      <button type="button" class="btn btn-secondary btn-sm" click.trigger="expandAll(true)">expand</button>
      <button type="button" class="btn btn-secondary btn-sm" click.trigger="expandAll(false)">collapse</button>
      <slot>
      </slot>
    </div>
    <div class="card-body">
      <table class="table table-sm table-hover table-bordered">
        <thead>
          <tr>
            <th scope="col">Key</th>
            <th scope="col">Value</th>
          </tr>
        </thead>
        <tbody>
          <template repeat.for="node of nodes">
            <model-watch-tree-node current.bind="node"></model-watch-tree-node>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>
`)
export class TreeView {
  @bindable nodes: Array<NodeModel>;
  constructor() {
  }

  showAll() {
    const show = (items: Array<NodeModel>) => {
      if (Array.isArray(items)) {
        for (let item of items) {
          item.visible = true;
          if (item.hasChildren())
            show(item.children);
        }
      }
    }
    show(this.nodes);
  }

  expandAll(expand: boolean) {
    const icon = expand ? 'icon minus' : 'icon plus';
    const process = (items: Array<NodeModel>) => {
      if (Array.isArray(items)) {
        for (let item of items) {
          if (item.hasChildren()) {
            item.expanded = expand;
            item.icon = icon;
            process(item.children);
          }
        }
      }
    }
    process(this.nodes);
  }
}
