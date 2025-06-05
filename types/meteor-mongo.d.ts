declare module 'meteor/mongo' {
    import SimpleSchema from 'simpl-schema';
  
    module Mongo {
      export interface Collection<T> {
        schema: SimpleSchema;
  
        attachSchema(schema: SimpleSchema): void;
  
        attachJSONSchema(schema: any): void;
  
        helpers(methods: object): void;
  
        allow(o:any):void
        
        _name: string;
      }
    }
  }