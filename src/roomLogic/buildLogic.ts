import { RoadUtil } from './../util/road';
import { PositionUtil } from "../util/position";

export class BuildLogic {
    constructor(private room : Room) {

    }

    public runBuildLogic() {
        if (this.room.controller && this.room.controller.owner && this.room.controller.owner.username === Memory.me)
        {
            if (this.room.controller.level > 1) 
            {
                this.buildAggregateContainer();
            }
            if (this.room.controller.level > 2)
            {
                this.buildSpawnTower();
            } 
            if (this.room.controller.level > 4)
            {
                this.buildControllerTower();
            }
        
            this.buildAllPossibleExtensions();

            this.buildRoads();
        }
    }

    private buildRoads() : void {
        if (Game.time % 1800 === 0) {
            RoadUtil.setRoads(this.room);
            this.room.memory.logging.heatMap = {};
        }

        var roadsBeingBuilt = this.room.find(FIND_CONSTRUCTION_SITES).filter(f => f.structureType === STRUCTURE_ROAD);
        
        var numRoadsBeingBuilt : number = 0;
        if (roadsBeingBuilt) numRoadsBeingBuilt = roadsBeingBuilt.length;
        var roadsToBuild = this.room.memory.roads;

        for (var i = 0; i < roadsToBuild.length && numRoadsBeingBuilt < 5; i++) {
            var pos = new RoomPosition(roadsToBuild[i].x, roadsToBuild[i].y, roadsToBuild[i].roomName);
            var result = pos.createConstructionSite(STRUCTURE_ROAD);

            if (result === 0) numRoadsBeingBuilt++;
            else if (result === ERR_FULL) break;
        }
    }

    private buildSpawnTower() : void {
        if (!this.room.controller) return;

        var spawns = this.room.find(FIND_MY_SPAWNS);
        if (spawns.length === 0) return;

        var spawnPos = spawns[0].pos;
        this.buildTowerAtRange(spawnPos, 2);
    }

    private buildControllerTower() : void {
        if (!this.room.controller) return;

        var controller = this.room.controller;

        this.buildTowerAtRange(controller.pos, 1);
    }

    private buildTowerAtRange(pos: RoomPosition, range: number) {
        var towers = pos.findInRange(FIND_STRUCTURES, range)
            .filter(s => s.structureType === STRUCTURE_TOWER);

        var towerConstruction = pos.findInRange(FIND_CONSTRUCTION_SITES, range)
            .filter(s => s.structureType === STRUCTURE_TOWER);

        if (towers.length + towerConstruction.length === 0)
        {
            for (var xOffset = -range; xOffset <= range; xOffset++) {
                for (var yOffset = -range; yOffset <= range; yOffset++) {
                    if (xOffset === -range || xOffset === range || yOffset === -range || yOffset === range)
                    {
                        var buildSite = new RoomPosition(pos.x + xOffset, pos.y + yOffset, pos.roomName);

                        var sites = buildSite.lookFor(LOOK_STRUCTURES);
                        if (sites.length === 0)
                        {
                            var result = buildSite.createConstructionSite(STRUCTURE_TOWER);

                            if (result === 0) return;
                        }
                    }
                }
            }
        }
        else return;
    }

    private buildAggregateContainer() : void {
        var spawns = this.room.find(FIND_MY_SPAWNS);
        if (spawns.length === 0) return;

        var spawn = spawns[0];
        var options : RoomPosition[] = [];
        options.push(new RoomPosition(spawn.pos.x + 1, spawn.pos.y + 1, spawn.pos.roomName));
        options.push(new RoomPosition(spawn.pos.x + 1, spawn.pos.y - 1, spawn.pos.roomName));
        options.push(new RoomPosition(spawn.pos.x - 1, spawn.pos.y + 1, spawn.pos.roomName));
        options.push(new RoomPosition(spawn.pos.x - 1, spawn.pos.y - 1, spawn.pos.roomName));

        var built = this.room.find(FIND_STRUCTURES).filter(s => s.structureType === STRUCTURE_CONTAINER).length > 0 ||
            this.room.find(FIND_MY_CONSTRUCTION_SITES).filter(s => s.structureType === STRUCTURE_CONTAINER).length > 0;

        options.forEach(o => {
            if (built) return;
            
            var result = o.createConstructionSite(STRUCTURE_CONTAINER);
            if (result === 0) built = true;
        })
    }

    private buildAllPossibleExtensions() : void {
        var csites = this.room.find(FIND_MY_CONSTRUCTION_SITES).filter(s => s.structureType === STRUCTURE_EXTENSION).length;
        if (csites > 0) return;

        var spawns = this.room.find(FIND_MY_SPAWNS);
        if (!spawns) return;
        var spawnPos = spawns[0].pos;

        var sources = this.room.find(FIND_SOURCES);

        var buildAround = this.room
            .find(FIND_MY_STRUCTURES)
            .filter(s => s.structureType === STRUCTURE_EXTENSION)
            .map(s => s.pos);

        this.tryBuildExtension(new RoomPosition(spawnPos.x + 2, spawnPos.y + 2, spawnPos.roomName), sources, []);
        this.tryBuildExtension(new RoomPosition(spawnPos.x + 2, spawnPos.y - 2, spawnPos.roomName), sources, []);
        this.tryBuildExtension(new RoomPosition(spawnPos.x - 2, spawnPos.y + 2, spawnPos.roomName), sources, []);
        this.tryBuildExtension(new RoomPosition(spawnPos.x - 2, spawnPos.y - 2, spawnPos.roomName), sources, []);
        this.tryBuildExtension(new RoomPosition(spawnPos.x - 2, spawnPos.y, spawnPos.roomName), sources, []);
        this.tryBuildExtension(new RoomPosition(spawnPos.x + 2, spawnPos.y, spawnPos.roomName), sources, []);
        this.tryBuildExtension(new RoomPosition(spawnPos.x, spawnPos.y + 2, spawnPos.roomName), sources, []);
        this.tryBuildExtension(new RoomPosition(spawnPos.x, spawnPos.y - 2, spawnPos.roomName), sources, []);

        var forbiddenPositions : RoomPosition[] = []
        forbiddenPositions.push(new RoomPosition(spawnPos.x + 1, spawnPos.y + 1, spawnPos.roomName));
        forbiddenPositions.push(new RoomPosition(spawnPos.x + 1, spawnPos.y - 1, spawnPos.roomName));
        forbiddenPositions.push(new RoomPosition(spawnPos.x - 1, spawnPos.y + 1, spawnPos.roomName));
        forbiddenPositions.push(new RoomPosition(spawnPos.x - 1, spawnPos.y - 1, spawnPos.roomName));

        var stopTrying : Boolean = false;
        buildAround.forEach(ba => {
            if (stopTrying) return;
            var results : number[];
            stopTrying = this.tryBuildExtension(new RoomPosition(ba.x + 1, ba.y + 1, ba.roomName), sources, forbiddenPositions);
            if (!stopTrying) stopTrying = this.tryBuildExtension(new RoomPosition(ba.x + 1, ba.y - 1, ba.roomName), sources, forbiddenPositions);
            if (!stopTrying) stopTrying = this.tryBuildExtension(new RoomPosition(ba.x - 1, ba.y + 1, ba.roomName), sources, forbiddenPositions);
            if (!stopTrying) stopTrying = this.tryBuildExtension(new RoomPosition(ba.x - 1, ba.y - 1, ba.roomName), sources, forbiddenPositions);

            var csites = this.room.find(FIND_MY_CONSTRUCTION_SITES).filter(s => s.structureType === STRUCTURE_EXTENSION).length;
            if (csites > 2) stopTrying = true;
        });
    }

    tryBuildExtension(pos : RoomPosition, sources : Source[], forbiddenPositions : RoomPosition[]) : boolean {
        var tooClose : boolean = false;
        sources.forEach(source => {
            if (PositionUtil.getFlyDistance(pos, source.pos) < 3) tooClose = true;
        });
        if (tooClose) return false;

        var forbidden :boolean = false;
        forbiddenPositions.forEach(fp => {
            if (pos.x === fp.x && pos.y === fp.y && pos.roomName === fp.roomName) forbidden = true;
        });
        if (forbidden) return false;

        var doubleStruct = pos.lookFor(LOOK_STRUCTURES);
        if (doubleStruct.length > 0) return false;

        var result = pos.createConstructionSite(STRUCTURE_EXTENSION);

        return result === ERR_FULL || result === ERR_GCL_NOT_ENOUGH;
    }
}