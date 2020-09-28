import { Task } from "../tasks/task";

export class TaskUtil {
    public static sort(tasks : Task[], creep : Creep) {
        var priorities : {[id: string]: number } = {};
        var suitabilities : {[id: string] : number } = {};

        tasks.forEach(t => {
            priorities[t.id] = t.getPriority(creep);
            suitabilities[t.id] = t.getSuitability(creep);
        })
        
        tasks.sort((a, b) => {
            var aPrio = priorities[a.id];
            var bPrio = priorities[b.id];

            var aSuit = suitabilities[a.id];
            var bSuit = suitabilities[b.id];
            
            if (aPrio === bPrio) {
                return bSuit - aSuit;
            }
            else return bPrio - aPrio;
        });
    }
}