"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const plugin_1 = __importDefault(require("./plugin"));
exports.default = (term) => {
    console.log("getting results from plugins");
    return plugin_1.default(term);
};
