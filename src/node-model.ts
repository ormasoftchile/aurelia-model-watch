
export class NodeModel {
  watcher: any;
  name: string;
  path: string;
  value: any;
  children: Array<NodeModel>;
  visible: boolean;
  icon: string;
  expanded: boolean;
  constructor(name: string, path: string, value: any, children: Array<NodeModel> | undefined, watcher: any) {
    this.watcher = watcher;
    this.name = name;
    this.value = value;
    this.path = path;
    this.children = children || [];
    this.visible = true;
    if(this.hasChildren()){
      this.icon = 'icon plus';
      this.expanded = false;
    }
    else
      this.icon = 'icon none';
  }

  get fullName() {
    return `${this.path}${this.name}`;
  }

  hasChildren(){
    return this.children.length > 0;
  }
  
  toggleNode(){
    if (!this.hasChildren)
      return;
    this.expanded = !this.expanded;
    if(this.expanded === true){
      this.icon = 'icon minus';
    }
    else{
      this.icon = 'icon plus';
    }
  }

  hide() {
    this.visible = false;
  }

  observe() {
    this.watcher.observe(this);
  }
}
