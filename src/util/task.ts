import { Task } from "../tasks/task";

export class TaskUtil {
    private static priorities : {[id: string]: number } = {};
    public static getPriorityWithCaching(priorityFunc : (creep : Creep) => number, creep : Creep) {
        if (!this.priorities[creep.id]) {
            this.priorities[creep.id] = priorityFunc(creep);
        }
        return this.priorities[creep.id];
    }

    private static suitabilities : {[id: string] : number } = {};
    public static getSuitabilityWithCaching(suitabilityFunc : (creep: Creep) => number, creep: Creep) {
        if (!this.suitabilities[creep.id]) {
            this.suitabilities[creep.id] = suitabilityFunc(creep);
        }
        return this.suitabilities[creep.id];
    }
}