"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const rxjs_1 = require("rxjs");
const fs_1 = require("fs");
const Path = __importStar(require("path"));
class PluginManager {
    constructor() {
        this.resultsObs = new rxjs_1.Subject();
        this.results = [];
        this.plugins = [];
        let localPluginsPath = Path.join(__dirname, "plugins");
        this.LoadModules(localPluginsPath);
        let homeDir = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
        let externalSettingsPath = Path.join(homeDir, ".focus");
        if (!fs_1.existsSync(externalSettingsPath))
            fs_1.mkdirSync(externalSettingsPath);
        let externalPluginsPath = Path.join(homeDir, ".focus", "plugins");
        if (!fs_1.existsSync(externalPluginsPath))
            fs_1.mkdirSync(externalPluginsPath);
        this.LoadModules(externalPluginsPath);
    }
    LoadModules(pluginPath) {
        //let normalizedPath = require("path").join(__dirname, "plugins");
        console.log(`Loading Modules from ${pluginPath}`);
        fs_1.readdirSync(pluginPath).forEach((file) => {
            try {
                if (!fs_1.lstatSync(Path.join(pluginPath, file)).isDirectory())
                    return;
                let plugin = require(Path.join(pluginPath, file));
                plugin.initialize();
                plugin.id = file;
                this.plugins.push(plugin);
                console.log("module loaded", file);
            }
            catch (err) {
                console.error("Ubable to load module", err);
            }
        });
    }
    PushUpdates(id, newResults) {
        console.log("pushilg chunk", newResults);
        newResults = newResults.map(x => { x.pluginId = id; return x; });
        this.results = this.results.filter(result => result.pluginId !== id);
        this.results = [...this.results, ...newResults];
        console.log("pushilg result", this.results);
        this.resultsObs.next(this.results);
    }
    GetResults(term) {
        this.results = [];
        this.plugins.forEach(plugin => {
            try {
                plugin.main({
                    display: (output) => {
                        this.PushUpdates(plugin.id, output);
                    },
                    term: term,
                });
                console.log(this.results);
            }
            catch (err) {
                console.error(err);
            }
        });
        this.resultsObs.next(this.results);
        return this.resultsObs.asObservable();
    }
}
exports.PluginManager = PluginManager;
