import { Task } from './task';
import { BaseTask } from './baseTask';

export class Build extends BaseTask implements Task {
    public static readonly type : string = "BUILD";

    constructor(id : string, claimedBy : Id<Creep> | null, public constructionSite : Id<ConstructionSite>) {
        super(id, Build.type, claimedBy);
    }

    private getSite() : ConstructionSite | null {
        var constructionSite = Game.getObjectById(this.constructionSite);
        if (!constructionSite) {
            console.log("constructionsite no longer exists");
            this.unclaim();
            this.clearOnNextTick = true;
        }

        return constructionSite;
    }

    public getPriority() {
        return 100;
    }

    public canPerform(creep : Creep)
    {
        return creep.store.energy > 0;
    }

    public execute(creep : Creep) {
        var site = this.getSite();
        if (site)
        {
            var result = creep.build(site);
            if (result === ERR_NOT_IN_RANGE) {
                creep.moveTo(site);
            }
            else if (result === 0) {}
            else {console.log("build failed with code " + result); }
        }   
        if (!this.canPerform(creep)) this.unclaim();
    }

    public serialize() : string {
        return JSON.stringify(this);
    }

    public report() : string {
        return "This is a working Build task";
    }
}