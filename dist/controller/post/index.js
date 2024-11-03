"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUrl = exports.updatePost = exports.getPostsList = exports.addNewPost = void 0;
const upload_1 = require("./upload");
Object.defineProperty(exports, "addNewPost", { enumerable: true, get: function () { return upload_1.addNewPost; } });
Object.defineProperty(exports, "getPostsList", { enumerable: true, get: function () { return upload_1.getPostsList; } });
const update_1 = require("./update");
Object.defineProperty(exports, "updatePost", { enumerable: true, get: function () { return update_1.updatePost; } });
Object.defineProperty(exports, "updateUrl", { enumerable: true, get: function () { return update_1.updateUrl; } });
