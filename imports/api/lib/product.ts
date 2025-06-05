import { World } from "./world";
import { App } from "./app";
import { IApp } from '/imports/api/types/app-types';
import { IProduct } from '/imports/api/types/world';
import { ProductSchema } from './schemas';
import { isString } from "./basics";

export class Product {
    private world: World;
    public productId: string;

    constructor(world: World, productDef:IProduct){
        this.world = world;

        const Products = world.productCollection;
        const p = {...productDef, apps:[] };

        try {
            ProductSchema.validate(p);
        } catch (err) {
            console.log(err);
            process.exit(1);
        }

        this.productId = Products.insert(p);
    }

    public createApp<T>(appDef: IApp<T>): App<T>
    public createApp<T>(id: string, appDef: IApp<T>): App<T>
    public createApp<T>(idOrAppDef: string | IApp<T>, appDef?: IApp<T>): App<T> {
        if (isString(idOrAppDef) && appDef) {
            appDef._id = idOrAppDef as string;
            return new App(this.world, this, appDef);
        } else {
            return new App(this.world, this, idOrAppDef as IApp<T>);
        }
    }
}
