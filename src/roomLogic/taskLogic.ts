import { Fill } from './../tasks/fill';
import { Build } from "../tasks/build";
import { Harvest } from "../tasks/harvest";
import { Repair } from "../tasks/repair";
import { TaskList } from "../tasks/tasklist";
import { Upgrade } from "../tasks/upgrade";
import { Grab } from '../tasks/grab';

export class TaskLogic {
    constructor(private room : Room) {

    }

    run() {
        // persistent task list
        if (Memory.debug) console.log("loading task list");
        var taskList = TaskList.getInstance(this.room);

        this.manageHarvestTasks(taskList);
        this.manageUpgradeTasks(taskList);

        this.manageBuildTasks(taskList);
        this.manageRepairTasks(taskList);
        this.manageFillTasks(taskList);
        this.manageGrabTasks(taskList);

        this.room.memory.taskList = taskList.serialize();
    }

    private manageHarvestTasks(taskList : TaskList) {
        if (Memory.debug) console.log("starting manageHarvestTasks");

        var harvestSlots = this.room.memory.energySlots;

        var harvestTasks = taskList.getAll()
            .filter(ht => ht.type === Harvest.type)
            .map(ht => <Harvest>ht);

        harvestSlots.forEach(hs => {
            var roomPos = new RoomPosition(hs.pos.x, hs.pos.y, hs.pos.roomName);
            var taskExists : boolean = false;
            harvestTasks.forEach(ht => 
            { 
                if (roomPos.x === ht.pos.x && roomPos.y === ht.pos.y && roomPos.roomName === ht.pos.roomName) taskExists = true;
            });
            
            if (!taskExists) {
                console.log("adding harvest task for " + roomPos);
                taskList.addTask(new Harvest(TaskList.getNewId(), null, hs.id, roomPos));
            } 
        });
    }

    private manageUpgradeTasks(taskList : TaskList) {
        if (Memory.debug) console.log("starting manageUpgradeTasks");
        
        var controller = this.room.controller;
        if (!controller) return;

        var upgradeTasks = taskList.getAll()
            .filter(ht => ht.type === Upgrade.type)
            .map(ht => <Upgrade>ht)
            .length;

        for (var i = upgradeTasks; i < 15; i++) {
            console.log("adding upgrade task for " + controller.id);
            taskList.addTask(new Upgrade(TaskList.getNewId(), null, controller.id));
        }
    }

    private manageBuildTasks(taskList : TaskList) : void {
        if (Memory.debug) console.log("starting manageBuildTasks");
        
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
        if (Memory.debug) console.log("starting manageRepairTasks");
        
        var toRepair : Structure[] = this.room.find(FIND_STRUCTURES).filter(s => s.hits < s.hitsMax * .75);

        var repairTasks = taskList.getAll().filter(t => t.type === Repair.type).map(t => <Repair>t);

        toRepair.forEach(s => {
            var repairCount = repairTasks.filter(rt => rt.structure === s.id).length;

            if (repairCount < 1) taskList.addTask(new Repair(TaskList.getNewId(), null, s.id));
        })
    }

    private manageFillTasks(taskList : TaskList) : void {
        if (Memory.debug) console.log("starting manageFillTasks");
        
        var fillAble = this.room.find(FIND_STRUCTURES)
            .filter(s => this.isFillable(s))
            .map(s => <StructureWithEnergyStore>s);

        var fillTasks = taskList.getAll().filter(t => t.type === Fill.type).map(t => <Fill>t);

        fillAble.forEach(s => {
            var refuelCount = fillTasks.filter(rt => rt.structure == s.id).length;
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
            case STRUCTURE_SPAWN: return 15;
            case STRUCTURE_CONTAINER: return 3;
            default: return 1;
        }
    }

    private manageGrabTasks(taskList : TaskList) {
        if (Memory.debug) console.log("starting manageGrabTasks");

        var grabTasks = taskList.getAll().filter(t => t.type === Grab.type).map(t => <Grab>t);

        this.manageGrabTombstoneTasks(taskList, grabTasks);
        this.manageGrabRuinTasks(taskList, grabTasks);
        this.manageGrabContainerTasks(taskList, grabTasks);
    }

    private manageGrabTombstoneTasks(taskList : TaskList, grabTasks : Grab[]) {
        if (Memory.debug) console.log("starting manageGrabTombstoneTasks");
        
        var tombstones = this.room.find(FIND_TOMBSTONES);

        tombstones.forEach(ts => {
            var grabCount = grabTasks.filter(gt => gt.item === ts.id).length;

            if (grabCount === 0) {
                taskList.addTask(new Grab(TaskList.getNewId(), null, ts.id));
            }
        });
    }

    private manageGrabRuinTasks(taskList : TaskList, grabTasks : Grab[]) {
        if (Memory.debug) console.log("starting manageGrabRuinTasks");
        
        var ruins = this.room.find(FIND_RUINS);

        ruins.forEach(r => {
            var grabCount = grabTasks.filter(gt => gt.item === r.id).length;

            if (grabCount < 3) {
                taskList.addTask(new Grab(TaskList.getNewId(), null, r.id));
            }
        });
    }

    private manageGrabContainerTasks(taskList : TaskList, grabTasks : Grab[]) {
        if (Memory.debug) console.log("starting manageGrabContainerTasks");
        
        var containers = this.room.find(FIND_STRUCTURES).filter(s => s.structureType === STRUCTURE_CONTAINER);

        containers.forEach(c => {
            var grabCount = grabTasks.filter(gt => gt.item === c.id).length;

            if (grabCount < 20) {
                taskList.addTask(new Grab(TaskList.getNewId(), null, c.id));
            }
        });
    }
}