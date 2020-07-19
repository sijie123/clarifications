const CMSTaskAdapter = require('./CMSTaskAdapter.js');

const TaskAdapters = [CMSTaskAdapter];
console.log("Using TaskAdapter: CMSTaskAdapter");

class TaskService {
    static async getTasks() {
        let tasks = ["General"]
        for (let adapter of TaskAdapters) {
            tasks = tasks.concat(await adapter.getTasks())
        }
        console.log(`Tasks: ${tasks}`);
        return tasks;
    }
}

module.exports = TaskService;  