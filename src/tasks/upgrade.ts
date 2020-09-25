import { Task } from './task';

export class Upgrade implements Task {
    public static readonly type : string = "UPGRADE";

    public type : string;
    public claimedBy : Id<Creep> | null;

    constructor() {
        this.type = Upgrade.type;
    }

    public canPerform(creep : Creep)
    {
        return true;
    }

    public claim(creep : Creep)
    {
        this.claimedBy = creep.id;
    }

    public unclaim() {
        this.claimedBy = null;
    }

    public serialize() : string {
        return Upgrade.type;
    }

    public report() : string {
        return "This is a working Upgrade task";
    }
}