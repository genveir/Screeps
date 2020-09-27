import { Fill } from './../tasks/fill';
import { Build } from "../tasks/build";
import { FillSpawn } from "../tasks/fillSpawn";
import { Harvest } from "../tasks/harvest";
import { Repair } from "../tasks/repair";
import { TaskList } from "../tasks/tasklist";
import { Upgrade } from "../tasks/upgrade";
import { GrabTombstone } from '../tasks/grabTombstone';
import { GrabRuin } from '../tasks/grabRuin';

export class TaskLogic {
    constructor(private room : Room) {

    }

    run() {
        // persistent task list
        var taskList = TaskList.getInstance(this.room);
        if (taskList.getAll().length === 0) this.initializeTasks(taskList);

        this.manageBuildTasks(taskList);
        this.manageRepairTasks(taskList);
        this.manageFillTasks(taskList);
        this.manageGrabTombstoneTasks(taskList);
        this.manageGrabRuinTasks(taskList);

        this.room.memory.taskList = taskList.serialize();
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
            for (var i = 0; i < harvestTasks.length * 3; i++) {
                taskList.addTask(new Upgrade(TaskList.getNewId(), null, controller.id));
            }
        }

        this.room.find(FIND_MY_SPAWNS).forEach(spawn => 
        {
            for (var i = 0; i < harvestTasks.length * 3; i++) {
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

    private manageFillTasks(taskList : TaskList) : void {
        var fillAble = this.room.find(FIND_MY_STRUCTURES)
            .filter(s => this.isFillable(s))
            .map(s => <StructureWithEnergyStore>s);

        var refuelTasks = taskList.getAll().filter(t => t.type === Fill.type).map(t => <Fill>t);

        fillAble.forEach(s => {
            var refuelCount = refuelTasks.filter(rt => rt.structure == s.id).length;
            var numberRequired = this.getNumTasksForStructure(s);

            for (var i = refuelCount; i < numberRequired; i++) {
                console.log("adding fill task for " + s.structureType + " " + s.id);
                taskList.addTask(new Fill(TaskList.getNewId(), null, s.id));
            } 
        });
    }

    private isFillable(structure : Structure) {
        var asAny = <any>structure;
        
        return asAny.store && asAny.store.getCapacity(RESOURCE_ENERGY) !== 0;
    }

    private getNumTasksForStructure(structure : Structure) : number {
        switch(structure.structureType) {
            case STRUCTURE_TOWER : return 5;
            default: return 1;
        }
    }

    private manageGrabTombstoneTasks(taskList : TaskList) {
        var tombstones = this.room.find(FIND_TOMBSTONES);

        var grabTasks = taskList.getAll().filter(t => t.type === GrabTombstone.type).map(t => <GrabTombstone>t);

        tombstones.forEach(ts => {
            var grabCount = grabTasks.filter(gt => gt.tombstone === ts.id).length;

            if (grabCount === 0) {
                taskList.addTask(new GrabTombstone(TaskList.getNewId(), null, ts.id));
            }
        });
    }

    private manageGrabRuinTasks(taskList : TaskList) {
        var ruins = this.room.find(FIND_RUINS);

        var grabTasks = taskList.getAll().filter(t => t.type === GrabRuin.type).map(t => <GrabRuin>t);

        ruins.forEach(r => {
            var grabCount = grabTasks.filter(gt => gt.ruin === r.id).length;

            if (grabCount < 3) {
                taskList.addTask(new GrabRuin(TaskList.getNewId(), null, r.id));
            }
        });
    }
}