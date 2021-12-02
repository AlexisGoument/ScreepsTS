import Factory from "buildings/factory";
import { energySpawnThreshold, ticksToLiveThreshold } from "constants/constants";
import Worker, { WorkerMemory, WorkerRole } from "./worker";

export default class Harvester extends Worker
{
    public static getHarvesters() : Harvester[] {
        let harvesters =
            _.filter(Game.creeps, creep => creep.memory.role == "harvester" && !creep.spawning)
            // _.filter(Game.creeps, creep => creep.name.startsWith("Harvester") && !creep.spawning)
            .map(creep => new Harvester(creep));

        return harvesters;
    }

    public static create(i: number) {
        let factory = Factory.getFactory();

        if (factory.store.energy >= energySpawnThreshold && factory.spawning == null) {
            let result = factory.spawnCreep([WORK, CARRY, MOVE], 'Harvester' + i, {memory: new WorkerMemory(WorkerRole.HARVESTER)});
            switch (result) {
                case OK:
                    console.log("Creating harvester");
                    break;
                default:
                    console.log("Cannot create harvester: " + result.toString());
            }
        }
    }

    constructor(creep: Creep) {
        super(creep.id);
        this.strokeColor = '#ffaa00';
        this.memory.role = WorkerRole.HARVESTER;
    }

    public work() {
        if (this.memory.charging) {
            let targets = this.room.find(FIND_MY_SPAWNS);
            this.tryMoveTo(targets[0]);
        }
        else {
            if (this.memory.working) {
                let targets = this.room.find(FIND_MY_SPAWNS);
                if (targets.length > 0) {
                    if (this.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
                        this.tryMoveTo(targets[0]);
                }
            }
            else {
                this.harvestClosestSource();
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
	        this.say('👨‍🌾Deposit');
            this.move(RIGHT); //Avoid being stuck when another harvester is queuing
	    }
    }
}
