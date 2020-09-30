import { Fill } from '../tasks/implementations/fill';
import { Build } from "../tasks/implementations/build";
import { Harvest } from "../tasks/implementations/harvest";
import { Repair } from "../tasks/implementations/repair";
import { TaskList } from "../tasks/tasklist";
import { Upgrade } from "../tasks/implementations/upgrade";
import { Grab } from '../tasks/implementations/grab';
import { Scout } from '../tasks/implementations/scout';

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

        this.manageScoutingTasks(taskList);

        this.room.memory.taskList = taskList.serialize();
    }

    private manageHarvestTasks(taskList : TaskList) {
        if (Memory.debug) console.log("starting manageHarvestTasks");

        var harvestSlots = this.room.memory.energySlots;
        if (!harvestSlots) return;

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
                taskList.addTask(new Harvest(TaskList.getNewId(), [], 1, hs.id, roomPos));
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

        if (upgradeTasks === 0) {
            console.log("adding upgrade task for " + controller.id);
            taskList.addTask(new Upgrade(TaskList.getNewId(), [], 100, controller.id));
        }
    }

    private manageBuildTasks(taskList : TaskList) : void {
        if (Memory.debug) console.log("starting manageBuildTasks");
        
        var constructionSites = this.room.find(FIND_CONSTRUCTION_SITES);
        var buildTasks = taskList.getAll().filter(t => t.type === Build.type).map(t => <Build>t);

        constructionSites.forEach(cs => {
            var csTasks = buildTasks.filter(bt => bt.constructionSite === cs.id).length;
            
            if (csTasks === 0) {
                taskList.addTask(new Build(TaskList.getNewId(), [], 5, cs.id));
            }
        });
    }

    private manageRepairTasks(taskList : TaskList) : void {
        if (Memory.debug) console.log("starting manageRepairTasks");
        
        var toRepair : Structure[] = this.room.find(FIND_STRUCTURES).filter(s => s.hits < s.hitsMax * .25);

        var repairTasks = taskList.getAll().filter(t => t.type === Repair.type).map(t => <Repair>t);

        toRepair.forEach(s => {
            var shouldMaintain : boolean = true;
            if (s.structureType === STRUCTURE_ROAD) {
                shouldMaintain = this.room.memory.roads.filter(r => r.x === s.pos.x && r.y === s.pos.y).length > 0;
            }

            if (shouldMaintain) {
                var repairCount = repairTasks.filter(rt => rt.structure === s.id).length;

                if (repairCount === 0) taskList.addTask(new Repair(TaskList.getNewId(), [], 1, s.id));
            }
        })
    }

    private manageFillTasks(taskList : TaskList) : void {
        if (Memory.debug) console.log("starting manageFillTasks");
        
        var fillAble = this.room.find(FIND_STRUCTURES)
            .filter(s => this.isFillable(s))
            .map(s => <StructureWithEnergyStore>s);

        var fillTasks = taskList.getAll().filter(t => t.type === Fill.type).map(t => <Fill>t);

        fillAble.forEach(s => {
            var fillTask = fillTasks.filter(rt => rt.structure == s.id);

            if (s.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
            {
                var numberRequired = this.getNumTasksForStructure(s);

                if (fillTask.length === 0) {
                    if (Memory.debug) console.log("adding fill task for " + s.structureType + " " + s.id);
                    taskList.addTask(new Fill(TaskList.getNewId(), [], numberRequired, s.id));
                }
            }
            else
            {
                fillTask.forEach(ft => {
                    ft.unclaimAll();
                    ft.clearOnNextTick = true;
                });
            }
        });
    }

    private isFillable(structure : Structure) {
        var asAny = <any>structure;
        
        return asAny.store && asAny.store.getCapacity(RESOURCE_ENERGY) !== 0;
    }

    private getNumTasksForStructure(structure : Structure) : number {
        switch(structure.structureType) {
            case STRUCTURE_TOWER : return 3;
            case STRUCTURE_SPAWN: return 3;
            case STRUCTURE_CONTAINER: return 5;
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
                taskList.addTask(new Grab(TaskList.getNewId(), [], 1, ts.id));
            }
        });
    }

    private manageGrabRuinTasks(taskList : TaskList, grabTasks : Grab[]) {
        if (Memory.debug) console.log("starting manageGrabRuinTasks");
        
        var ruins = this.room.find(FIND_RUINS);

        ruins.forEach(r => {
            var grabCount = grabTasks.filter(gt => gt.item === r.id).length;

            if (grabCount === 0) {
                taskList.addTask(new Grab(TaskList.getNewId(), [], 3, r.id));
            }
        });
    }

    private manageGrabContainerTasks(taskList : TaskList, grabTasks : Grab[]) {
        if (Memory.debug) console.log("starting manageGrabContainerTasks");
        
        var containers = this.room.find(FIND_STRUCTURES).filter(s => s.structureType === STRUCTURE_CONTAINER);

        containers.forEach(c => {
            var grabCount = grabTasks.filter(gt => gt.item === c.id).length;

            if (grabCount === 0) {
                taskList.addTask(new Grab(TaskList.getNewId(), [], 5, c.id));
            }
        });
    }

    private manageScoutingTasks(taskList: TaskList) {
        if (Memory.debug) console.log("starting manageScoutingTasks");

        var scoutingTargets = Memory.scoutingTargets;

        var scoutTasks = taskList.getAll().filter(t => t.type === Scout.type).map(t => <Scout>t);

        scoutingTargets.forEach(st => {
            var scoutCount = scoutTasks.filter(sc => sc.roomName == st.roomName).length;

            if (scoutCount === 0) taskList.addTask(new Scout(TaskList.getNewId(), [], st.roomName));
        });
    }
}