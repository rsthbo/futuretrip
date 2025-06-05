import { World } from "./world";
import { IReportAction, TReport } from "../types/world";
import { deepClone, isFunction } from "./basics";
import { Meteor, Subscription } from "meteor/meteor";
import { ReportSchema } from "./schemas";


export class Report {
    private world: World
    private _originalReportDef: TReport<any, any>
    private _report: TReport<any, any> | null = null;
    private _reportId: string | null = null;

    constructor(world: World, reportDef: TReport<any, any>) {
        this.world = world;

        this._originalReportDef = deepClone(reportDef);

        this.registerReport(reportDef);
    }

    get reportId(): string {
        return this._reportId || '';
    }

    get report(): TReport<any, any> | null {
        return this._report;
    }

    get originalReportDef(): TReport<any, any> | null {
        return this._originalReportDef;
    }

    private registerReport = (r: TReport<any, any>) => {
        const reportId = r._id;
        console.log('Register Report', reportId);
        
        let report = r;
    
        if (r.type == "table"){
            if (r.tableDetails && r.tableDetails.columns) {
                r.tableDetails.columns = r.tableDetails.columns.map( col => {
                    if (col.render && isFunction(col.render)) col.render = col.render.toString()
                    if (col.children) {
                        col.children = col.children.map( cchi => {
                            if (cchi.render && isFunction(cchi.render)) cchi.render = cchi.render.toString()
                            return cchi;
                        })
                    }
                    return col;
                });
            }
        } else if(r.type == 'card') {
            if (r.cardDetails && r.cardDetails.avatar && isFunction(r.cardDetails.avatar)) r.cardDetails.avatar = r.cardDetails.avatar.toString() as any;
            if (r.cardDetails && r.cardDetails.title && isFunction(r.cardDetails.title)) r.cardDetails.title = r.cardDetails.title.toString() as any;
            if (r.cardDetails && r.cardDetails.description && isFunction(r.cardDetails.description)) r.cardDetails.description = r.cardDetails.description.toString() as any;
            if (r.cardDetails && r.cardDetails.cover && isFunction(r.cardDetails.cover)) r.cardDetails.cover = r.cardDetails.cover.toString() as any;
        } else if (r.type == 'chart') {
            // only chart-type available

        }
    
        if (r.actions) {
            r.actions = r.actions.map( (ac:IReportAction) => {
                if (ac.disabled && isFunction(ac.disabled)) ac.disabled = ac.disabled.toString();
                if (ac.visible && isFunction(ac.visible)) ac.visible = ac.visible.toString();
    
                if (ac.onExecute && ac.onExecute.runScript && isFunction(ac.onExecute.runScript)) {
                    ac.onExecute.runScript = ac.onExecute.runScript.toString();
                }
    
                ac.inGeneral = !!ac.inGeneral;
                ac.iconOnly = !!ac.iconOnly;

                return ac;
            })
        }
    
        if (report.staticDatasource) {
            const methodName = '__reports.' + reportId;

            console.log('Register method for static report', methodName);
            const fnDatasource: Function = report.staticDatasource as Function;
    
            Meteor.methods({ [methodName]: function(this:Meteor.MethodThisType, param) {
                param = param || {};
                param.isServer = true
                param.datasource = this;
                param.record = param.record || {};
    
                const currentUser = Meteor.users.findOne(this.userId as string);
                param.currentUser = currentUser;
    
                //console.log('From inside method', methodName, param);
                return fnDatasource.apply(this, [param]);
            }})
            
            r.staticDatasource = report.staticDatasource.toString();
        }
    
        if (report.liveDatasource) {
            const subscriptionName = '__reports.' + reportId;
            console.log('Register subscription for realtime-report', subscriptionName);
            const fnLiveData: Function = report.liveDatasource as Function;

            Meteor.publish(subscriptionName, function(this:Subscription, param) {
                param = param || {};
                param.isServer = true
                param.publication = this;
                param.record = param.record || {};
    
                const currentUser = Meteor.users.findOne(this.userId as string);
                param.currentUser = currentUser;
    
                //console.log('From inside publication', subscriptionName, param);
                return fnLiveData.apply(this, [param]);
            });
            
            r.liveDatasource = report.liveDatasource.toString();
        }
    
        try {
            ReportSchema.validate(r);
        } catch (err) {
            console.log(err);
            process.exit(1);
        }

        this._reportId = this.world.reportCollection.insert(r);
        this._report = r;
    
        console.log(`done. (register Report ${reportId})`);
    }
}