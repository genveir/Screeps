import { PositionUtil } from "../util/position";
import { RoadUtil } from "../util/road";

export class BuildLogic {
    constructor(private room : Room) {

    }

    public run() {
        if (this.room.controller)
        {
            if (this.room.controller.level > 1) 
            {
                this.buildSourceRoads();
                this.buildControllerRoad();
                this.buildSpawnRingRoads();
                this.buildAggregateContainer();
            }
            if (this.room.controller.level > 2)
            {
                this.buildControllerRingRoad();
                this.buildSpawnTower();
            } 
            if (this.room.controller.level > 3)
            {
                this.buildSecondLevelSpawnRingRoads();
            }
            if (this.room.controller.level > 4)
            {
                this.buildControllerTower();
            }
        }

        this.buildAllPossibleExtensions();
        this.buildAllExtensionAccessRoads();
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

    private buildControllerRoad() : void {
        if (!this.room.controller) return;
        
        var spawns = this.room.find(FIND_MY_SPAWNS);
        if (spawns.length === 0) return;

        var definition = RoadUtil.getRoadDefinition(this.room, "controllerRoad", spawns[0].pos, this.room.controller.pos, 4);

        if (definition) this.buildRoad(definition)
    }

    private buildSourceRoads() : void {
        var spawns = this.room.find(FIND_MY_SPAWNS);
        if (spawns.length === 0) return;

        var sources = this.room.find(FIND_SOURCES);
        for (var i = 0; i < sources.length; i++) {
            var definition = RoadUtil.getRoadDefinition(this.room, "spawnToSource" + sources[i].id, spawns[0].pos, sources[i].pos, 1);

            if (definition) this.buildRoad(definition);

            var ringDef1 = RoadUtil.getRingRoad(sources[i].pos, 1);
            if (ringDef1) this.buildRoad(ringDef1);

            var ringDef2 = RoadUtil.getRingRoad(sources[i].pos, 2);
            if (ringDef2) this.buildRoad(ringDef2);
        }
    }

    private buildSpawnRingRoads() : void {
        var spawns = this.room.find(FIND_MY_SPAWNS);
        if (spawns.length === 0) return;

        for (var i = 0; i < spawns.length; i++)
        {
            var definition = RoadUtil.getRingRoad(spawns[i].pos, 1);

            this.buildRoad(definition);
        }
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

    private buildSecondLevelSpawnRingRoads() : void {
        var spawns = this.room.find(FIND_MY_SPAWNS);
        if (spawns.length === 0) return;

        for (var i = 0; i < spawns.length; i++)
        {
            var definition = RoadUtil.getRingRoad(spawns[i].pos, 2);

            this.buildRoad(definition);
        }
    }

    private buildControllerRingRoad() : void {
        var controller = this.room.controller;
        if (!controller) return;

        var definition = RoadUtil.getControllerRingRoad(controller);
        this.buildRoad(definition);
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

    buildAllExtensionAccessRoads() {
        var numConstructionSites = this.room.find(FIND_MY_CONSTRUCTION_SITES).length;
        var extensions = this.room.find(FIND_STRUCTURES).filter(s => s.structureType === STRUCTURE_EXTENSION).map(s => <StructureExtension>s);

        extensions.forEach(e => {
            if (numConstructionSites > 0) return;

            var posBelow = new RoomPosition(e.pos.x, e.pos.y + 1, e.pos.roomName);
            var terrain = posBelow.lookFor(LOOK_TERRAIN);
            if (terrain[0] === "wall") return;

            var result = posBelow.createConstructionSite(STRUCTURE_ROAD);
            if (result === 0) numConstructionSites++;
        })
    }

    buildRoad(definition : RoadDefinition) {
        var numSites : number = 0;
        var potentials : RoomPosition[] = [];
        definition.route.forEach(step => {
            var stepPos = new RoomPosition(step.x, step.y, step.roomName);

            if(stepPos.lookFor(LOOK_CONSTRUCTION_SITES).length > 0) 
            {
                numSites++;
            }
            else if(stepPos.lookFor(LOOK_STRUCTURES).length === 0) potentials.push(stepPos);
        });

        var potentialsToConvert = 5 - numSites;
        if (potentialsToConvert > potentials.length) potentialsToConvert = potentials.length;

        for (var i = 0; i < potentialsToConvert; i++) {
            var result = potentials[i].createConstructionSite(STRUCTURE_ROAD);

            if (result !== 0) 
            {
                console.log("failed to place construction at " + potentials[i].x + "," + potentials[i].y + " with code " + result);
            }
        }
    }
}