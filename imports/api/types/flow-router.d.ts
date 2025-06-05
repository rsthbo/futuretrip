
declare module "meteor/kadira:flow-router" {
    export module FlowRouter {
      function current():any;
      function go(url:string):void;      
    }
}