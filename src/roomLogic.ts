import { RoadUtil } from './util/road';
import { Fill } from './tasks/fill';
import { Build } from './tasks/build';
import { Upgrade } from './tasks/upgrade';
import { FillSpawn } from './tasks/fillSpawn';
import { Harvest } from './tasks/harvest';
import { PositionUtil } from './util/position';
import { TaskList } from './tasks/tasklist';
import { Repair } from './tasks/repair';

export class RoomLogic {
    constructor(private room: Room) {
        if (!this.room.memory.taskList) this.room.memory.taskList = [];
        if (!this.room.memory.energySlots) this.initializeEnergySlots();
    }

    run() {
        this.fireTowers();

        // persistent task list
        var taskList = TaskList.getInstance(this.room);
        if (taskList.getAll().length === 0) this.initializeTasks(taskList);

        if (this.room.controller)
        {
            if (this.room.controller.level > 1) 
            {
                this.buildSourceRoads();
                this.buildControllerRoad();
                this.buildSpawnRingRoads();
            }
            if (this.room.controller.level > 2)
            {
                this.buildControllerRingRoad();
                this.buildSpawnTower();
            } 
        }

        this.manageBuildTasks(taskList);
        this.manageRepairTasks(taskList);
        this.manageRefuelTasks(taskList);

        // this.printTaskInfo(taskList);

        this.room.memory.taskList = taskList.serialize();
    }

    private fireTowers() {
        var towers = this.room.find(FIND_MY_STRUCTURES).filter(s => s.structureType === STRUCTURE_TOWER).map(s => <StructureTower>s);
        if (towers.length === 0) return;

        var enemies = this.room.find(FIND_HOSTILE_CREEPS);
        if (enemies.length === 0) return;

        towers.forEach(t => {
            var closest : number = 1000;
            var target : Creep;
            enemies.forEach(e => {
                if (PositionUtil.getManhattanDistance(t.pos, e.pos) < closest) target = e;
            })

            t.attack(target!);
        });
    }

    private printTaskInfo(taskList : TaskList)
    {
        var tasks = taskList.getAll();
        var totalTasks = tasks.length;
        var claimedTasks = tasks.filter(t => t.claimedBy).length;
        var unclaimedTasks = tasks.filter(t => !t.claimedBy).length;

        console.log("there are " + totalTasks + " tasks in room " + this.room.name + ", " + claimedTasks + " are claimed, " + unclaimedTasks + " are not");
    }

    private initializeEnergySlots() : void {
        console.log("initializing energy slots for room " + this.room.name);

        var energySources = this.room.find(FIND_SOURCES);

        var energySlots : SavedHarvestPosition[] = [];
        energySources.forEach(es => {
            var id = es.id;
            var pos = es.pos;

            var emptySurrounding = PositionUtil.getEmptySurrounding(pos);
            emptySurrounding.forEach(es => 
            {
                energySlots.push({ id: id, pos: es })
            });
        });

        this.room.memory.energySlots = energySlots;
    }

    private initializeTasks(taskList : TaskList) : void {
        console.log("initializing tasks for room " + this.room.name);

        var harvestSlots = this.room.memory.energySlots;

        var harvestTasks = harvestSlots.map(hs => {
            var roomPos = new RoomPosition(hs.pos.x, hs.pos.y, hs.pos.roomName);
            taskList.addTask(new Harvest(TaskList.getNewId(), null, hs.id, roomPos));
        });

        var controller = this.room.controller;
        if (controller)
        {
            for (var i = 0; i < harvestTasks.length * 2; i++) {
                taskList.addTask(new Upgrade(TaskList.getNewId(), null, controller.id));
            }
        }

        this.room.find(FIND_MY_SPAWNS).forEach(spawn => 
        {
            for (var i = 0; i < harvestTasks.length * 2; i++) {
                taskList.addTask(new FillSpawn(TaskList.getNewId(), null, spawn.id))
            }
        });
    }

    private manageBuildTasks(taskList : TaskList) : void {
        var constructionSites = this.room.find(FIND_CONSTRUCTION_SITES);
        var buildTasks = taskList.getAll().filter(t => t.type === Build.type).map(t => <Build>t);

        constructionSites.forEach(cs => {
            var buildCount = buildTasks.filter(bt => bt.constructionSite === cs.id).length;
            
            for (var i = buildCount; i < 2; i++) {
                taskList.addTask(new Build(TaskList.getNewId(), null, cs.id));
            }
        });
    }

    private manageRepairTasks(taskList : TaskList) : void {
        var structures : Structure[] = this.room.find(FIND_MY_STRUCTURES).filter(s => s.hits < s.hitsMax);
        var roads : Structure[] = this.room.find(FIND_STRUCTURES).filter(s => s.structureType === STRUCTURE_ROAD).filter(s => s.hits < s.hitsMax / 2);
        var toRepair : Structure[] = structures.concat(roads);

        var repairTasks = taskList.getAll().filter(t => t.type === Repair.type).map(t => <Repair>t);

        toRepair.forEach(s => {
            var repairCount = repairTasks.filter(rt => rt.structure === s.id).length;

            if (repairCount < 1) taskList.addTask(new Repair(TaskList.getNewId(), null, s.id));
        })
    }

    private manageRefuelTasks(taskList : TaskList) : void {
        var towers = this.room.find(FIND_MY_STRUCTURES).filter(s => s.structureType === STRUCTURE_TOWER).map(s => <StructureTower>s);
        if (towers.length === 0) return;

        var refuelTasks = taskList.getAll().filter(t => t.type === Fill.type).map(t => <Fill>t);

        towers.forEach(t => {
            var refuelCount = refuelTasks.filter(rt => rt.structure == t.id).length;

            for (var i = refuelCount; i < 5; i++) {
                console.log("adding fill task for tower " + t.id);
                taskList.addTask(new Fill(TaskList.getNewId(), null, t.id));
            } 
        })
    }

    private buildSpawnTower() : void {
        var towers = this.room.find(FIND_MY_STRUCTURES).filter(s => s.structureType === STRUCTURE_TOWER);

        if (!this.room.controller) return;

        var spawns = this.room.find(FIND_MY_SPAWNS);
        if (spawns.length === 0) return;

        var spawnPos = spawns[0].pos;

        if (towers.length === 0)
        {
            for (var xOffset = -2; xOffset <= 2; xOffset++) {
                for (var yOffset = -2; yOffset <= 2; yOffset++) {
                    if (xOffset === -2 || xOffset === 2 || yOffset === -2 || yOffset === 2)
                    {
                        var buildSite = new RoomPosition(spawnPos.x + xOffset, spawnPos.y + yOffset, spawnPos.roomName);

                        var sites = buildSite.lookFor(LOOK_CONSTRUCTION_SITES).filter(cs => cs.structureType === STRUCTURE_TOWER);
                        if (sites.length > 0) return;

                        var result = buildSite.createConstructionSite(STRUCTURE_TOWER);

                        if (result === 0) return;
                    }
                }
            }
        }
        else return;

        console.log("unable to build spawn tower");
    }

    private buildControllerRoad() : void {
        if (!this.room.controller) return;
        
        var spawns = this.room.find(FIND_MY_SPAWNS);
        if (spawns.length === 0) return;

        var definition = RoadUtil.getRoadDefinition(this.room, "controllerRoad", spawns[0].pos, this.room.controller.pos, 1);

        if (definition) this.buildRoad(definition)
    }

    private buildSourceRoads() : void {
        var spawns = this.room.find(FIND_MY_SPAWNS);
        if (spawns.length === 0) return;

        var sources = this.room.find(FIND_SOURCES);
        for (var i = 0; i < sources.length; i++) {
            var definition = RoadUtil.getRoadDefinition(this.room, "spawnToSource" + sources[i].id, spawns[0].pos, sources[i].pos, 1);

            if (definition) this.buildRoad(definition);
        }
    }

    private buildSpawnRingRoads() : void {
        var spawns = this.room.find(FIND_MY_SPAWNS);
        if (spawns.length === 0) return;

        for (var i = 0; i < spawns.length; i++)
        {
            var definition = RoadUtil.getSpawnRingRoad(spawns[i]);

            this.buildRoad(definition);
        }
    }

    private buildControllerRingRoad() : void {
        var controller = this.room.controller;
        if (!controller) return;

        var definition = RoadUtil.getControllerRingRoad(controller);
        this.buildRoad(definition);
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