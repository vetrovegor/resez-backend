"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const STATIC_PATH = require('./consts');
const saveFile = async (subPath, file) => {
    const directory = path.join(STATIC_PATH, subPath);
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
    }
    const fileName = Date.now() + path.extname(file.filename);
    const buffer = await file.toBuffer();
    fs.writeFileSync(path.join(directory, fileName), buffer);
    return `${subPath}/${fileName}`;
};
const deleteFile = (fileName) => {
    if (!fileName) {
        return;
    }
    const filePath = path.resolve(process.cwd(), 'uploads', fileName);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
};
module.exports = { saveFile, deleteFile };
