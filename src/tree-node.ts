import {bindable, containerless} from 'aurelia-framework';
import { customElement, inlineView } from 'aurelia-templating';

@containerless()
@customElement('model-watch-tree-node')
@inlineView(`
<template>
  <tr if.bind="current.visible">
    <th>
      <span click.trigger="current.toggleNode()" class="\${current.icon}"></span>
      \${current.name}<span if.bind="!current.hasChildren()" click.trigger="current.observe()" class="observe-item">observe</span>
      <span click.trigger="current.hide()" class="hide-item">hide</span></th>
    <td>
      <span if.bind="current.value">\${current.value}</span>
      <template if.bind="current.hasChildren() && current.expanded">
        <table class="table table-sm table-hover">
          <thead>
            <tr>
              <th scope="col">Key</th>
              <th scope="col">Value</th>
            </tr>
          </thead>
          <tbody>
            <template repeat.for="node of current.children">
              <model-watch-tree-node current.bind="node"></model-watch-tree-node>
            </template>
          </tbody>
        </table>
      </template>
    </td>
  </tr>
</template>
`)
export class TreeNode {
  @bindable current = null;
}
