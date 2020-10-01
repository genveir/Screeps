import { TaskLogic } from './taskLogic';
import { BuildLogic } from './buildLogic';
import { PositionUtil } from '../util/position';

export class RoomLogic {
    buildLogic : BuildLogic;
    taskLogic : TaskLogic;

    constructor(private room: Room) {
        this.buildLogic = new BuildLogic(this.room);
        this.taskLogic = new TaskLogic(this.room);

        this.room.memory.name = room.name;
    }

    runRoomLogic() {
        if (!this.room.memory.energySlots) this.initializeEnergySlots();
        
        var name : string;
        var level : number;
        if (this.room.controller) {
            if (this.room.controller.owner) {
                name = this.room.controller.owner.username;
            }
            else {
                name = "none";
            }
            level = this.room.controller.level;
        }
        else {
            var invaderCreeps = this.room.find(FIND_CREEPS)
                .filter(c => c.owner.username === "Invader");

            var sourceKeepers = this.room.find(FIND_STRUCTURES)
                .filter(s => s.structureType === STRUCTURE_KEEPER_LAIR);

            if (invaderCreeps.length > 0 || sourceKeepers.length > 0) name = "Invader";
            else name = "none"

            level = 0;
        }
        this.room.memory.owner = {owner: name, level: level};

        Memory.scoutingTargets = Memory.scoutingTargets.filter(st => st.roomName != this.room.name);

        if (this.room.memory.owner.owner === Memory.me) {
            if (Memory.debug || this.room.memory.debug) console.log("firing towers in " + this.room.name);
            this.fireTowers();

            if (Memory.debug || this.room.memory.debug) console.log("running build logic for " + this.room.name);
            this.buildLogic.runBuildLogic();
        }

        if (Memory.debug || this.room.memory.debug) console.log("setting scouting targets for " + this.room.name);
        this.setScoutingTargets();

        if (Memory.debug || this.room.memory.debug) console.log("running task logic for " + this.room.name);
        this.taskLogic.runTaskLogic();

        if (Memory.debug || this.room.memory.debug) console.log("finished with room logic");
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
                var distance = PositionUtil.getFlyDistance(t.pos, e.pos);
                if (distance < closest)  {
                    closest = distance;
                    target = e;
                };
            })

            t.attack(target!);
        });
    }

    private initializeEnergySlots() : void {
        console.log("initializing energy slots for room " + this.room.name);

        var energySources = this.room.find(FIND_SOURCES);

        this.room.memory.energySlots = [];
        energySources.forEach(es => {
            var id = es.id;
            var pos = es.pos;

            var emptySurrounding = PositionUtil.getEmptySurrounding(pos);
            emptySurrounding.forEach(es => 
            {
                this.room.memory.energySlots!.push({ id: id, pos: es })
            });
        });
    }

    private setScoutingTargets() {
        Memory.scoutingTargets = Memory.scoutingTargets.filter(st => st.roomName !== this.room.name);

        var owner = this.room.memory.owner.owner;
        if (owner === "none" || owner === Memory.me)
        {
            var neighbours = Game.map.describeExits(this.room.name);

            var rooms : string[] = [];
            if (neighbours[FIND_EXIT_BOTTOM]) rooms.push(neighbours[FIND_EXIT_BOTTOM]!);
            if (neighbours[FIND_EXIT_LEFT]) rooms.push(neighbours[FIND_EXIT_LEFT]!);
            if (neighbours[FIND_EXIT_RIGHT]) rooms.push(neighbours[FIND_EXIT_RIGHT]!);
            if (neighbours[FIND_EXIT_TOP]) rooms.push(neighbours[FIND_EXIT_TOP]!);

            rooms.forEach(r => {
                if (!Memory.rooms[r]) {
                    if (Memory.scoutingTargets.filter(st => st.roomName === r).length === 0) {
                        Memory.scoutingTargets.push({roomName: r, claimedBy: null})
                    }
                }
            });
        }
    }
}