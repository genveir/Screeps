import { MovementUtil } from './../../util/movement';
import { PositionUtil } from '../../util/position';
import { Task } from '../task';
import { BaseTask } from '../baseTask';

export class Build extends BaseTask implements Task {
    public static readonly type : string = "BUILD";

    constructor(id : string, claimedBy : Id<Creep>[], numAllowed : number, public constructionSite : Id<ConstructionSite>) {
        super(id, Build.type, claimedBy, numAllowed);
    }

    private getSite() : ConstructionSite | null {
        var constructionSite = Game.getObjectById(this.constructionSite);
        if (!constructionSite) {
            this.unclaimAll();
            this.clearOnNextTick = true;
        }

        return constructionSite;
    }

    protected _getPriority(creep : Creep) {
        var site = this.getSite();
        if (!site) return 0;
        else {
            return 100000 - PositionUtil.getFlyDistance(site.pos, creep.pos) + site.progress;
        }
    }

    protected _getSuitability(creep : Creep) {
        if (creep.store.energy > 0) return 100000;
        return 0;
    }

    public execute(creep : Creep) {
        var site = this.getSite();
        if (site)
        {
            if (PositionUtil.getFlyDistance(creep.pos, site.pos) > 3)
            {
                MovementUtil.moveTo(creep, site.pos);
            }
            else {
                if (this.moveAwayFromSources(creep)) return;

                var result = creep.build(site);
                if (result === ERR_NOT_IN_RANGE) {
                    MovementUtil.moveTo(creep, site.pos);
                }
                else if (result === ERR_NOT_ENOUGH_RESOURCES) {}
                else if (result === 0) {}
                else {console.log("build failed with code " + result); }
            }
        }   
        if (this.getPriority(creep) <= 0 || this.getSuitability(creep) <= 0) this.unclaim(creep.id);
    }

    public serialize() : string {
        return JSON.stringify(this);
    }
}