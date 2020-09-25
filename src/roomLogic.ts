import { Build } from './tasks/build';
import { Upgrade } from './tasks/upgrade';
import { FillSpawn } from './tasks/fillSpawn';
import { Harvest } from './tasks/harvest';
import { PositionUtil } from './util/position';
import { TaskList } from './tasks/tasklist';

export class RoomLogic {
    constructor(private room: Room) {
        if (!this.room.memory.taskList) this.room.memory.taskList = [];
        if (!this.room.memory.energySlots) this.initializeEnergySlots();
    }

    run() {
        // persistent task list
        var taskList = TaskList.getInstance(this.room);
        if (taskList.getAll().length === 0) this.initializeTasks(taskList);

        if (this.room.controller)
        {
            if (this.room.controller.level > 1) this.buildControllerRoad();
        }

        this.manageBuildTasks(taskList);

        // this.printTaskInfo(taskList);

        this.room.memory.taskList = taskList.serialize();
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
            for (var i = 0; i < harvestTasks.length; i++) {
                taskList.addTask(new Upgrade(TaskList.getNewId(), null, controller.id));
            }
        }

        this.room.find(FIND_MY_SPAWNS).forEach(spawn => 
        {
            for (var i = 0; i < harvestTasks.length; i++) {
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
                console.log("adding build task for site at " + cs.pos.x + "," + cs.pos.y);
                taskList.addTask(new Build(TaskList.getNewId(), null, cs.id));
            }
        });
    }

    private buildControllerRoad() : void {
        if (!this.room.controller) return;
        
        var spawns = this.room.find(FIND_MY_SPAWNS);
        if (spawns.length === 0) return;

        if (!this.room.memory.controllerRoadPath) {
            var controllerPos = this.room.controller.pos;
            var spawnPos = spawns[0].pos;

            var startX : number;
            var startY : number;
            if (controllerPos.x > spawnPos.x) startX = spawnPos.x + 1;
            else startX = spawnPos.x - 1;
            if (controllerPos.y > spawnPos.y) startY = spawnPos.y + 1;
            else startY = spawnPos.y - 1;

            var startPos = new RoomPosition(startX, startY, this.room.name);

            var found = PathFinder.search(startPos, {pos: controllerPos, range: 1}, {swampCost: 1, maxRooms: 1});
            if (!found.incomplete)
            {
                this.room.memory.controllerRoadPath = found.path;
            }
        }

        var route = this.room.memory.controllerRoadPath;

        var numSites : number = 0;
        var potentials : RoomPosition[] = [];
        route.forEach(step => {
            var stepPos = new RoomPosition(step.x, step.y, step.roomName);

            if(stepPos.lookFor(LOOK_CONSTRUCTION_SITES).length > 0) 
            {
                numSites++;
            }
            else if(stepPos.lookFor(LOOK_STRUCTURES).length === 0) potentials.push(stepPos);
        });

        var potentialsToConvert = 5 - numSites;
        if (potentialsToConvert > potentials.length) potentialsToConvert = potentials.length;

        console.log("building " + potentialsToConvert + " new road sites");

        for (var i = 0; i < potentialsToConvert; i++) {
            console.log("building site at " + potentials[i].x + "," + potentials[i].y);
            var result = potentials[i].createConstructionSite(STRUCTURE_ROAD);

            if (result !== 0) 
            {
                console.log("failed to place construction at " + potentials[i].x + "," + potentials[i].y + " with code " + result);
            }
        }
    }
}