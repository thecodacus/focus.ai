"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const plugin_1 = require("./plugin");
class Core {
    constructor() {
        this.pluginManager = new plugin_1.PluginManager();
    }
    GetResults(term) {
        console.log("getting results from plugins");
        return this.pluginManager.GetResults(term);
    }
    OnSelect(result) {
        this.pluginManager.OnSelect(result);
    }
}
exports.Core = Core;
