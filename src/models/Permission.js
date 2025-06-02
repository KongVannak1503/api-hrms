const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
    route: String, // e.g., "/api/users"
    actions: [String] // e.g., ["view", "update", "delete"]
});

module.exports = mongoose.model('Permission', permissionSchema);
