"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rxjs_1 = require("rxjs");
function LoadModules() {
    let normalizedPath = require("path").join(__dirname, "plugins");
    console.log(`Loading Modules from ${normalizedPath}`);
    let plugins = [];
    require("fs").readdirSync(normalizedPath).forEach((file) => {
        try {
            let plugin = require("./plugins/" + file);
            plugin.initialize();
            plugin.id = file;
            plugins.push(plugin);
            console.log("module loaded", file);
        }
        catch (err) {
            console.error("Ubable to load module", err);
        }
    });
    return plugins;
}
let plugins = LoadModules();
let resultsObs = new rxjs_1.Subject();
let results = [];
const PushUpdates = (id, newResults) => {
    console.log("pushilg chunk", newResults);
    newResults = newResults.map(x => { x.pluginId = id; return x; });
    results = results.filter(result => result.pluginId !== id);
    results = [...results, ...newResults];
    console.log("pushilg result", results);
    resultsObs.next(results);
};
exports.default = (term) => {
    results = [];
    plugins.forEach(plugin => {
        try {
            plugin.main({
                display: (output) => {
                    PushUpdates(plugin.id, output);
                },
                term: term,
            });
            console.log(results);
        }
        catch (err) {
            console.error(err);
        }
    });
    resultsObs.next(results);
    return resultsObs.asObservable();
};
