import Factory from "buildings/factory";
import { energySpawnThreshold, ticksToLiveThreshold } from "constants/constants";
import Worker, { WorkerMemory, WorkerRole } from "./worker";

export default class Upgrader extends Worker
{
    public static getUpgraders() : Upgrader[] {
        let upgraders =
            _.filter(Game.creeps, creep => creep.memory.role === "upgrader" && !creep.spawning)
            // _.filter(Game.creeps, creep => creep.name.startsWith("Upgrader") && !creep.spawning)
            .map(creep => new Upgrader(creep));

        return upgraders;
    }

    public static create(i: number) {
        let factory = Factory.getFactory();

        if (factory.store.energy >= energySpawnThreshold && factory.spawning == null) {
            let result = factory.spawnCreep([WORK, CARRY, MOVE], 'Upgrader' + i, {memory: new WorkerMemory(WorkerRole.UPGRADER)});
            switch (result) {
                case OK:
                    console.log("Creating upgrader");
                    break;
                default:
                    console.log("Cannot create upgrader: " + result.toString());
            }
        }
    }

    constructor(creep: Creep) {
        super(creep.id);
        this.strokeColor = '#aaff00';
        this.memory.role = WorkerRole.UPGRADER;
    }

    public work() {
        if (this.memory.charging) {
            let targets = this.room.find(FIND_MY_SPAWNS);
            this.tryMoveTo(targets[0]);
        }
        else {
            if (this.memory.working) {
                switch (this.upgradeController(this.room.controller as StructureController)) {
                    case ERR_NOT_IN_RANGE:
                        this.tryMoveTo(this.room.controller as StructureController)
                }
            }
            else {
                this.harvestClosestSource(1);
            }
        }

        if (this.memory.charging && (this.ticksToLive as number) > ticksToLiveThreshold) {
            this.memory.charging = false;
        }

        if(this.memory.working && this.store[RESOURCE_ENERGY] == 0) {
            this.memory.working = false;
            if ((this.ticksToLive as number) < ticksToLiveThreshold)
            {
                this.memory.charging = true;
                console.log(`Worker ${this.name} need to recharge. Time to live: ${this.ticksToLive}`);
                this.say("⚡ChargeMe");
            }
            else {
                this.say('🔄Harvest');
            }
	    }
	    if(!this.memory.working && this.store.getFreeCapacity() == 0) {
	        this.memory.working = true;
	        this.say('👩‍🔧Upgrading');
	    }
    }
}
